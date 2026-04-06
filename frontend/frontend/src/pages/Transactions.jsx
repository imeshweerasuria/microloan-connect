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
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Transactions Ledger
            <span style={styles.titleAccent}> | Track Your Impact</span>
          </h1>
          <p style={styles.subtitle}>
            Fund approved loans, track your funding history, and see your impact in real-time
          </p>
        </div>
        <div style={styles.sdgBadge}>
          <span style={styles.sdgIcon}>🎯</span>
          <span style={styles.sdgText}>SDG Goal 1: No Poverty</span>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div style={styles.success}>
          <span style={styles.messageIcon}>✅</span>
          <span>{message}</span>
          <button onClick={() => setMessage("")} style={styles.closeBtn}>×</button>
        </div>
      )}
      {error && (
        <div style={styles.error}>
          <span style={styles.messageIcon}>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError("")} style={styles.closeBtn}>×</button>
        </div>
      )}

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTopColor: "#3b82f6"}}>
          <div style={styles.statIcon}>📊</div>
          <div>
            <h3 style={styles.statTitle}>Total Transactions</h3>
            <p style={styles.statValue}>{summary.count}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#10b981"}}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <h3 style={styles.statTitle}>Total Funded (LKR)</h3>
            <p style={styles.statValue}>LKR {summary.totalFunding.toLocaleString()}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#8b5cf6"}}>
          <div style={styles.statIcon}>💱</div>
          <div>
            <h3 style={styles.statTitle}>Total Converted (USD)</h3>
            <p style={styles.statValue}>USD {summary.totalConverted.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* FX Converter Link */}
      <div style={styles.fxLinkCard}>
        <div style={styles.fxLinkContent}>
          <span style={styles.fxIcon}>💱</span>
          <div>
            <h4 style={styles.fxTitle}>Need currency conversion?</h4>
            <p style={styles.fxText}>Use our FX converter to check real-time exchange rates</p>
          </div>
          <Link to="/fx" style={styles.fxButton}>
            Open FX Converter →
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* Create Funding Form */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <span style={styles.formIcon}>💚</span>
            <h2 style={styles.formTitle}>Create Funding Transaction</h2>
          </div>

          <form onSubmit={handleCreateFunding}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🏦</span>
                Select Approved Loan
              </label>
              <select
                style={styles.select}
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                required
              >
                <option value="">-- Choose a loan to fund --</option>
                {loans.map((loan) => {
                  const remaining =
                    Number(loan.amount || 0) - Number(loan.fundedAmount || 0);

                  return (
                    <option key={loan._id} value={loan._id}>
                      {loan.title} | {loan.amount} {loan.currency} | Remaining: {remaining}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedLoan && (
              <div style={styles.loanInfo}>
                <div style={styles.loanInfoHeader}>
                  <span>📋</span>
                  <strong>Loan Details</strong>
                </div>
                <div style={styles.loanInfoGrid}>
                  <div>
                    <p style={styles.loanInfoLabel}>Purpose</p>
                    <p style={styles.loanInfoValue}>{selectedLoan.purpose}</p>
                  </div>
                  <div>
                    <p style={styles.loanInfoLabel}>Category</p>
                    <p style={styles.loanInfoValue}>{selectedLoan.businessCategory}</p>
                  </div>
                  <div>
                    <p style={styles.loanInfoLabel}>Remaining Needed</p>
                    <p style={{...styles.loanInfoValue, color: "#f59e0b", fontWeight: "700"}}>
                      {remainingAmount} {selectedLoan.currency}
                    </p>
                  </div>
                </div>
                <div>
                  <p style={styles.loanInfoLabel}>Impact Plan</p>
                  <p style={styles.loanInfoValue}>{selectedLoan.povertyImpactPlanSnapshot}</p>
                </div>
              </div>
            )}

            <div style={styles.twoCol}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>💰</span>
                  Amount
                </label>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  max={remainingAmount || undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🌍</span>
                  Currency
                </label>
                <input
                  style={styles.input}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="LKR, USD, etc."
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📝</span>
                Note (Optional)
              </label>
              <textarea
                style={styles.textarea}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a personal note about this funding..."
              />
            </div>

            <button type="submit" style={styles.submitBtn} disabled={funding}>
              {funding ? (
                <span style={styles.btnContent}>
                  <span style={styles.spinner}></span>
                  Processing...
                </span>
              ) : (
                <span style={styles.btnContent}>
                  <span>💚</span>
                  Create Funding Transaction
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div style={styles.transactionsCard}>
          <div style={styles.transactionsHeader}>
            <div style={styles.headerLeft}>
              <span style={styles.transactionsIcon}>📜</span>
              <h2 style={styles.transactionsTitle}>My Transactions</h2>
            </div>
            <div style={styles.searchWrapper}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p>Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <p>No transactions found</p>
              <Link to="/lender/dashboard" style={styles.emptyLink}>
                Browse available loans to fund →
              </Link>
            </div>
          ) : (
            <div style={styles.transactionsList}>
              {filteredTransactions.map((tx) => (
                <div key={tx._id} style={styles.transactionItem}>
                  <div style={styles.txHeader}>
                    <div style={styles.txType}>
                      <span style={tx.type === "FUNDING" ? styles.fundingIcon : styles.repaymentIcon}>
                        {tx.type === "FUNDING" ? "💚" : "🔄"}
                      </span>
                      <strong>{tx.type}</strong>
                    </div>
                    <span style={{...styles.txStatus, 
                      background: tx.status === "CONFIRMED" ? "#d1fae5" : "#fef3c7",
                      color: tx.status === "CONFIRMED" ? "#065f46" : "#92400e"
                    }}>
                      {tx.status}
                    </span>
                  </div>

                  <div style={styles.txDetails}>
                    <div style={styles.txDetail}>
                      <span style={styles.txLabel}>Loan ID</span>
                      <span style={styles.txValue}>{tx.loanId?.slice(-8) || "N/A"}</span>
                    </div>
                    <div style={styles.txDetail}>
                      <span style={styles.txLabel}>Amount</span>
                      <span style={styles.txValue}>{tx.amount} {tx.currency}</span>
                    </div>
                    {tx.amountConverted && (
                      <div style={styles.txDetail}>
                        <span style={styles.txLabel}>Converted</span>
                        <span style={styles.txValue}>{tx.amountConverted} {tx.convertedCurrency}</span>
                      </div>
                    )}
                    {tx.fxRate && (
                      <div style={styles.txDetail}>
                        <span style={styles.txLabel}>FX Rate</span>
                        <span style={styles.txValue}>1 {tx.currency} = {tx.fxRate} {tx.convertedCurrency}</span>
                      </div>
                    )}
                  </div>

                  {tx.note && (
                    <div style={styles.txNote}>
                      <span>📝</span>
                      <span>{tx.note}</span>
                    </div>
                  )}

                  <div style={styles.txFooter}>
                    <span style={styles.txDate}>
                      🕐 {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Impact Summary */}
      <div style={styles.impactCard}>
        <div style={styles.impactContent}>
          <span style={styles.impactEmoji}>🌟</span>
          <div>
            <h4 style={styles.impactTitle}>Your Impact So Far</h4>
            <p style={styles.impactText}>
              You've funded <strong>{summary.count}</strong> transaction{summary.count !== 1 ? 's' : ''} 
              totaling <strong>LKR {summary.totalFunding.toLocaleString()}</strong>, 
              helping underserved communities work towards financial freedom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "40px 24px",
  },
  
  heroSection: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  },
  
  heroContent: {
    flex: 1,
  },
  
  title: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  
  titleAccent: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  
  subtitle: {
    color: "#6b7280",
    fontSize: "16px",
    margin: 0,
  },
  
  sdgBadge: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    padding: "12px 20px",
    borderRadius: "40px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
  },
  
  sdgIcon: {
    fontSize: "24px",
  },
  
  sdgText: {
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
  },
  
  success: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    background: "#d1fae5",
    color: "#065f46",
    padding: "14px 20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderLeft: "4px solid #10b981",
  },
  
  error: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "14px 20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderLeft: "4px solid #ef4444",
  },
  
  messageIcon: {
    fontSize: "20px",
  },
  
  closeBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "inherit",
    padding: "0 8px",
  },
  
  statsGrid: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  
  statCard: {
    background: "white",
    padding: "24px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    borderTop: "4px solid",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  
  statIcon: {
    fontSize: "40px",
  },
  
  statTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6b7280",
    margin: "0 0 8px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  
  statValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1f2937",
    margin: 0,
  },
  
  fxLinkCard: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    background: "white",
    borderRadius: "16px",
    padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  fxLinkContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  
  fxIcon: {
    fontSize: "32px",
  },
  
  fxTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 4px 0",
  },
  
  fxText: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
  },
  
  fxButton: {
    marginLeft: "auto",
    padding: "10px 20px",
    background: "#111827",
    color: "white",
    textDecoration: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.2s",
  },
  
  mainGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
  },
  
  formCard: {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  
  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  
  formIcon: {
    fontSize: "28px",
  },
  
  formTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  formGroup: {
    marginBottom: "20px",
  },
  
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "14px",
  },
  
  labelIcon: {
    fontSize: "16px",
  },
  
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
  },
  
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    transition: "border-color 0.2s",
    outline: "none",
    boxSizing: "border-box",
  },
  
  textarea: {
    width: "100%",
    minHeight: "80px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
  },
  
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  
  loanInfo: {
    background: "#f0fdf4",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
  },
  
  loanInfoHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  
  loanInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "12px",
  },
  
  loanInfoLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#059669",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
  },
  
  loanInfoValue: {
    fontSize: "13px",
    color: "#065f46",
    margin: 0,
  },
  
  submitBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.1s",
  },
  
  btnContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid white",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  
  transactionsCard: {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  
  transactionsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  
  transactionsIcon: {
    fontSize: "28px",
  },
  
  transactionsTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  searchWrapper: {
    position: "relative",
    minWidth: "200px",
  },
  
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
  },
  
  searchInput: {
    width: "100%",
    padding: "10px 12px 10px 36px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
  },
  
  loadingContainer: {
    textAlign: "center",
    padding: "40px",
  },
  
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e5e7eb",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  
  emptyIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "16px",
  },
  
  emptyLink: {
    display: "inline-block",
    marginTop: "12px",
    color: "#3b82f6",
    textDecoration: "none",
  },
  
  transactionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxHeight: "500px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  
  transactionItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    transition: "box-shadow 0.2s",
  },
  
  txHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  
  txType: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  
  fundingIcon: {
    fontSize: "18px",
  },
  
  repaymentIcon: {
    fontSize: "18px",
  },
  
  txStatus: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  
  txDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "12px",
  },
  
  txDetail: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  
  txLabel: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
  },
  
  txValue: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
  },
  
  txNote: {
    display: "flex",
    gap: "8px",
    padding: "8px",
    background: "#f9fafb",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "12px",
  },
  
  txFooter: {
    borderTop: "1px solid #f3f4f6",
    paddingTop: "8px",
  },
  
  txDate: {
    fontSize: "11px",
    color: "#9ca3af",
  },
  
  impactCard: {
    maxWidth: "1200px",
    margin: "30px auto 0",
    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    borderRadius: "20px",
    padding: "24px",
    color: "white",
  },
  
  impactContent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },
  
  impactEmoji: {
    fontSize: "40px",
  },
  
  impactTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: "0 0 8px 0",
  },
  
  impactText: {
    fontSize: "14px",
    opacity: 0.95,
    margin: 0,
    lineHeight: "1.5",
  },
};

// Add animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);