import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Transactions() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("LKR");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentUserId = user?.id || user?._id || "";

  const fetchTransactions = async () => {
    try {
      const res = await client.get("/transactions/me");
      setTransactions(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load transactions");
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await client.get("/loans?status=APPROVED");
      setLoans(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load approved loans");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([fetchTransactions(), fetchLoans()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loanIdFromQuery = searchParams.get("loanId");
    if (loanIdFromQuery) {
      setSelectedLoanId(loanIdFromQuery);
    }
  }, [searchParams]);

  const selectedLoan = useMemo(
    () => loans.find((l) => l._id === selectedLoanId),
    [loans, selectedLoanId]
  );

  const remainingAmount = selectedLoan
    ? Number(selectedLoan.amount || 0) - Number(selectedLoan.fundedAmount || 0)
    : 0;

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;

    return transactions.filter((tx) => {
      return (
        String(tx.type || "").toLowerCase().includes(q) ||
        String(tx.status || "").toLowerCase().includes(q) ||
        String(tx.loanId || "").toLowerCase().includes(q) ||
        String(tx.currency || "").toLowerCase().includes(q) ||
        String(tx.note || "").toLowerCase().includes(q)
      );
    });
  }, [transactions, search]);

  const summary = useMemo(() => {
    const totalFunding = transactions
      .filter((tx) => tx.type === "FUNDING" && tx.status === "CONFIRMED")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const totalConverted = transactions
      .filter((tx) => tx.type === "FUNDING" && tx.status === "CONFIRMED")
      .reduce((sum, tx) => sum + Number(tx.amountConverted || 0), 0);

    return {
      count: transactions.length,
      totalFunding,
      totalConverted,
    };
  }, [transactions]);

  const handleCreateFunding = async (e) => {
    e.preventDefault();

    if (!selectedLoan) {
      setError("Please select a loan");
      return;
    }

    const normalizedBorrowerId =
      selectedLoan.borrowerId?._id || selectedLoan.borrowerId || "";

    if (!currentUserId) {
      setError("Unable to detect current user session");
      return;
    }

    try {
      setFunding(true);
      setError("");
      setMessage("");

      await client.post("/transactions", {
        type: "FUNDING",
        loanId: selectedLoan._id,
        fromUserId: currentUserId,
        toUserId: normalizedBorrowerId,
        amount: Number(amount),
        currency,
        note,
      });

      setMessage("✅ Funding transaction created successfully");
      setAmount("");
      setNote("");
      await Promise.all([fetchTransactions(), fetchLoans()]);
    } catch (err) {
      setError(err.message || "Failed to create transaction");
    } finally {
      setFunding(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1>Transactions Ledger</h1>
      <p style={styles.sub}>
        Fund approved loans, track your funding history, and show the FX-converted transaction values.
      </p>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h3>My Transactions</h3>
          <p style={styles.big}>{summary.count}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Total Funded</h3>
          <p style={styles.big}>LKR {summary.totalFunding}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Total Converted</h3>
          <p style={styles.big}>USD {summary.totalConverted}</p>
        </div>
      </div>

      <div style={styles.topActions}>
        <Link to="/fx" style={styles.linkBtn}>
          Open FX Converter
        </Link>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>Create Funding Transaction</h2>

          <form onSubmit={handleCreateFunding}>
            <label style={styles.label}>Select Approved Loan</label>
            <select
              style={styles.input}
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              required
            >
              <option value="">-- Select Loan --</option>
              {loans.map((loan) => {
                const remaining =
                  Number(loan.amount || 0) - Number(loan.fundedAmount || 0);

                return (
                  <option key={loan._id} value={loan._id}>
                    {loan.title} | {loan.amount} {loan.currency} | remaining: {remaining}
                  </option>
                );
              })}
            </select>

            {selectedLoan && (
              <div style={styles.loanInfo}>
                <p><strong>Purpose:</strong> {selectedLoan.purpose}</p>
                <p><strong>Category:</strong> {selectedLoan.businessCategory}</p>
                <p><strong>Impact Plan:</strong> {selectedLoan.povertyImpactPlanSnapshot}</p>
                <p><strong>Remaining Needed:</strong> {remainingAmount} {selectedLoan.currency}</p>
              </div>
            )}

            <label style={styles.label}>Amount</label>
            <input
              style={styles.input}
              type="number"
              min="1"
              max={remainingAmount || undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <label style={styles.label}>Currency</label>
            <input
              style={styles.input}
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              required
            />

            <label style={styles.label}>Note</label>
            <textarea
              style={styles.textarea}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
            />

            <button type="submit" style={styles.primaryBtn} disabled={funding}>
              {funding ? "Processing..." : "Create Funding"}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <div style={styles.rowBetween}>
            <h2 style={{ margin: 0 }}>My Transactions</h2>
            <input
              style={styles.searchInput}
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Loading transactions...</p>
          ) : filteredTransactions.length === 0 ? (
            <div>
              <p>No transactions found.</p>
              <Link to="/lender/dashboard">Go to lender dashboard</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
              {filteredTransactions.map((tx) => (
                <div key={tx._id} style={styles.txCard}>
                  <div style={styles.rowBetween}>
                    <strong>{tx.type}</strong>
                    <span style={styles.badge}>{tx.status}</span>
                  </div>

                  <p><strong>Loan ID:</strong> {tx.loanId}</p>
                  <p><strong>Amount:</strong> {tx.amount} {tx.currency}</p>

                  {tx.amountConverted && (
                    <p>
                      <strong>Converted:</strong> {tx.amountConverted} {tx.convertedCurrency}
                    </p>
                  )}

                  {tx.fxRate && (
                    <p><strong>FX Rate:</strong> {tx.fxRate}</p>
                  )}

                  {tx.note && <p><strong>Note:</strong> {tx.note}</p>}

                  <p style={styles.smallText}>
                    Created: {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sub: {
    color: "#6b7280",
    marginBottom: "20px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },
  big: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
  },
  topActions: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },
  linkBtn: {
    textDecoration: "none",
    background: "#111827",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "8px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },
  label: {
    display: "block",
    fontWeight: "600",
    marginTop: "12px",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
  },
  searchInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    width: "220px",
  },
  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
  },
  primaryBtn: {
    marginTop: "16px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  loanInfo: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "10px 12px",
    marginTop: "12px",
  },
  txCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "12px",
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    border: "1px solid #2563eb",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "600",
  },
  smallText: {
    fontSize: "12px",
    color: "#6b7280",
  },
};
