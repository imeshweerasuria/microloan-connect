import { useEffect, useState } from "react";
import client from "./api/client";

export default function AdminDashboard() {
  const [borrowers, setBorrowers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [loansRes, txRes] = await Promise.all([
        client.get("/loans?status=SUBMITTED"),
        client.get("/transactions")
      ]);

      setLoans(loansRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const approveLoan = async (loanId) => {
    try {
      setMessage("");
      setError("");
      await client.patch(`/loans/${loanId}/approve`);
      setMessage("✅ Loan approved successfully");
      fetchAll();
    } catch (err) {
      setError(err.message || "Failed to approve loan");
    }
  };

  const rejectLoan = async (loanId) => {
    try {
      setMessage("");
      setError("");
      await client.patch(`/loans/${loanId}/reject`);
      setMessage("✅ Loan rejected successfully");
      fetchAll();
    } catch (err) {
      setError(err.message || "Failed to reject loan");
    }
  };

  return (
    <div style={styles.page}>
      <h1>Admin Dashboard</h1>
      <p style={styles.sub}>
        Review borrower activity, moderate loan requests, and monitor transactions.
      </p>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h3>Submitted Loans</h3>
          <p style={styles.big}>{loans.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Total Transactions</h3>
          <p style={styles.big}>{transactions.length}</p>
        </div>
      </div>

      <div style={styles.card}>
        <h2>Pending Loan Approvals</h2>

        {loading ? (
          <p>Loading...</p>
        ) : loans.length === 0 ? (
          <p>No submitted loans right now.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {loans.map((loan) => (
              <div key={loan._id} style={styles.loanCard}>
                <div style={styles.rowBetween}>
                  <strong>{loan.title}</strong>
                  <span style={styles.badge}>{loan.status}</span>
                </div>

                <p><strong>Description:</strong> {loan.description}</p>
                <p><strong>Amount:</strong> {loan.amount} {loan.currency}</p>
                <p><strong>Purpose:</strong> {loan.purpose}</p>
                <p><strong>Category:</strong> {loan.businessCategory}</p>
                <p><strong>Impact Plan:</strong> {loan.povertyImpactPlanSnapshot}</p>

                <div style={styles.btnRow}>
                  <button style={styles.approveBtn} onClick={() => approveLoan(loan._id)}>
                    Approve
                  </button>
                  <button style={styles.rejectBtn} onClick={() => rejectLoan(loan._id)}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h2>Recent Transactions</h2>

        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {transactions.slice(0, 8).map((tx) => (
              <div key={tx._id} style={styles.txCard}>
                <div style={styles.rowBetween}>
                  <strong>{tx.type}</strong>
                  <span>{tx.status}</span>
                </div>
                <p>{tx.amount} {tx.currency}</p>
                {tx.amountConverted && (
                  <p>Converted: {tx.amountConverted} {tx.convertedCurrency}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  sub: {
    color: "#6b7280",
    marginBottom: "20px"
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "20px"
  },
  statCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
  },
  big: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: 0
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
  },
  loanCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px"
  },
  txCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "12px"
  },
  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  badge: {
    border: "1px solid #2563eb",
    color: "#2563eb",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "600"
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    marginTop: "12px"
  },
  approveBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer"
  },
  rejectBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer"
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "16px"
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "16px"
  }
};