import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function AdminDashboard() {
  const [allLoans, setAllLoans] = useState([]);
  const [submittedLoans, setSubmittedLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [message, setMessage] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch all loans (admin has access to /loans)
      const loansRes = await client.get("/loans");
      setAllLoans(loansRes.data || []);
      
      // Fetch submitted loans for pending approvals
      const submittedRes = await client.get("/loans?status=SUBMITTED");
      setSubmittedLoans(submittedRes.data || []);
      
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const totalLoans = allLoans.length;
    const pendingApprovals = submittedLoans.length;
    const approvedLoans = allLoans.filter(l => l.status === "APPROVED").length;
    const rejectedLoans = allLoans.filter(l => l.status === "REJECTED").length;
    const fundedLoans = allLoans.filter(l => l.status === "FUNDED" || l.status === "ACTIVE").length;
    const totalAmount = allLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
    const fundedAmount = allLoans.reduce((sum, loan) => sum + (loan.fundedAmount || 0), 0);
    
    return {
      totalLoans,
      pendingApprovals,
      approvedLoans,
      rejectedLoans,
      fundedLoans,
      totalAmount,
      fundedAmount,
    };
  }, [allLoans, submittedLoans]);

  const filteredLoans = useMemo(() => {
    const q = search.trim().toLowerCase();
    
    let loansToFilter = allLoans;
    if (statusFilter !== "ALL") {
      loansToFilter = allLoans.filter(loan => loan.status === statusFilter);
    }
    
    return loansToFilter.filter((loan) => {
      // Search by title, purpose, business category, or borrowerId (since borrower object not populated)
      const matchesSearch = !q ||
        String(loan.title || "").toLowerCase().includes(q) ||
        String(loan.purpose || "").toLowerCase().includes(q) ||
        String(loan.businessCategory || "").toLowerCase().includes(q) ||
        String(loan.borrowerId || "").toLowerCase().includes(q);
      
      return matchesSearch;
    });
  }, [allLoans, statusFilter, search]);

  const handleApproveLoan = async (loanId) => {
    if (!window.confirm("Approve this loan? It will be ready for funding.")) return;
    
    try {
      setProcessingAction(true);
      setError("");
      setMessage("");
      
      // Use PATCH /loans/:loanId/approve (admin-only endpoint)
      const response = await client.patch(`/loans/${loanId}/approve`);
      
      // Use response.data.message if available, otherwise use default message
      if (response.data && response.data.message) {
        setMessage(`✅ ${response.data.message}`);
      } else {
        setMessage("✅ Loan approved successfully");
      }
      
      await fetchDashboardData();
    } catch (err) {
      setError(err.message || "Failed to approve loan");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectLoan = async (loanId) => {
    if (!window.confirm("Reject this loan?")) return;
    
    try {
      setProcessingAction(true);
      setError("");
      setMessage("");
      
      // Use PATCH /loans/:loanId/reject (admin-only endpoint)
      const response = await client.patch(`/loans/${loanId}/reject`);
      
      // Use response.data.message if available, otherwise use default message
      if (response.data && response.data.message) {
        setMessage(`❌ ${response.data.message}`);
      } else {
        setMessage("❌ Loan rejected");
      }
      
      await fetchDashboardData();
    } catch (err) {
      setError(err.message || "Failed to reject loan");
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "#92400e";
      case "SUBMITTED":
        return "#1d4ed8";
      case "APPROVED":
        return "#166534";
      case "REJECTED":
        return "#b91c1c";
      case "FUNDED":
        return "#7c3aed";
      case "ACTIVE":
        return "#7c3aed";
      case "CLOSED":
        return "#374151";
      default:
        return "#111827";
    }
  };

  const getActionButtons = (loan) => {
    switch (loan.status) {
      case "SUBMITTED":
        return (
          <div style={styles.actionButtons}>
            <button 
              style={{...styles.smallBtn, background: "#166534"}} 
              onClick={() => handleApproveLoan(loan._id)}
              disabled={processingAction}
            >
              Approve
            </button>
            <button 
              style={{...styles.smallBtn, background: "#b91c1c"}} 
              onClick={() => handleRejectLoan(loan._id)}
              disabled={processingAction}
            >
              Reject
            </button>
          </div>
        );
      case "APPROVED":
        // Mark as funded button removed - backend doesn't support it yet
        return (
          <div style={styles.actionButtons}>
            <span style={{...styles.infoText, color: "#7c3aed"}}>
              ⚠️ Funding status update not available yet
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <h1>Admin Dashboard</h1>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>Admin Dashboard</h1>
      <p style={styles.sub}>
        Manage loans, review submissions, and track funding progress.
      </p>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Stats Cards */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h3>Total Loans</h3>
          <p style={styles.big}>{stats.totalLoans}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Pending Approvals</h3>
          <p style={{...styles.big, color: "#1d4ed8"}}>{stats.pendingApprovals}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Approved</h3>
          <p style={{...styles.big, color: "#166534"}}>{stats.approvedLoans}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Rejected</h3>
          <p style={{...styles.big, color: "#b91c1c"}}>{stats.rejectedLoans}</p>
        </div>
      </div>

      {/* Financial Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h3>Total Requested</h3>
          <p style={styles.big}>LKR {stats.totalAmount.toLocaleString()}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Total Funded</h3>
          <p style={styles.big}>LKR {stats.fundedAmount.toLocaleString()}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Funded/Active Loans</h3>
          <p style={{...styles.big, color: "#7c3aed"}}>{stats.fundedLoans}</p>
        </div>
      </div>

      {/* Note about admin routes */}
      <div style={{...styles.infoBox, marginBottom: "20px"}}>
        <strong>ℹ️ Admin Actions:</strong> Approve and reject loans using the buttons below.
        Funding status updates will be available in a future update.
      </div>

      {/* Pending Approvals Section */}
      {submittedLoans.length > 0 && (
        <div style={styles.card}>
          <h2>Pending Approvals ({submittedLoans.length})</h2>
          <div style={styles.pendingList}>
            {submittedLoans.map((loan) => (
              <div key={loan._id} style={styles.loanCard}>
                <div style={styles.loanTop}>
                  <strong>{loan.title}</strong>
                  <span style={{...styles.badge, color: getStatusColor(loan.status), borderColor: getStatusColor(loan.status)}}>
                    {loan.status}
                  </span>
                </div>
                <p><strong>Borrower ID:</strong> {loan.borrowerId || "Unknown"}</p>
                <p><strong>Amount:</strong> {loan.amount} {loan.currency}</p>
                <p><strong>Tenure:</strong> {loan.tenureMonths} months</p>
                <p><strong>Purpose:</strong> {loan.purpose}</p>
                <p><strong>Business Category:</strong> {loan.businessCategory}</p>
                <p><strong>Description:</strong> {loan.description}</p>
                <div style={styles.actionButtons}>
                  <button style={{...styles.smallBtn, background: "#166534"}} onClick={() => handleApproveLoan(loan._id)} disabled={processingAction}>
                    Approve
                  </button>
                  <button style={{...styles.smallBtn, background: "#b91c1c"}} onClick={() => handleRejectLoan(loan._id)} disabled={processingAction}>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Loans with Filters */}
      <div style={styles.card}>
        <div style={styles.filterToolbar}>
          <h2 style={{ margin: 0 }}>All Loans</h2>
          
          <div style={styles.filterRow}>
            <input
              style={styles.searchInput}
              placeholder="Search by title, purpose, category, or borrower ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            
            <select
              style={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="FUNDED">FUNDED</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>

        {filteredLoans.length === 0 ? (
          <p style={{ marginTop: "20px" }}>No loans match your filter.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
            {filteredLoans.map((loan) => (
              <div key={loan._id} style={styles.loanCard}>
                <div style={styles.loanTop}>
                  <strong>{loan.title}</strong>
                  <span style={{...styles.badge, color: getStatusColor(loan.status), borderColor: getStatusColor(loan.status)}}>
                    {loan.status}
                  </span>
                </div>
                
                <p style={{ margin: "8px 0" }}>{loan.description}</p>
                
                <div style={styles.meta}>
                  <span><strong>Borrower ID:</strong> {loan.borrowerId || "Unknown"}</span>
                  <span><strong>Amount:</strong> {loan.amount} {loan.currency}</span>
                </div>
                
                <div style={styles.meta}>
                  <span><strong>Tenure:</strong> {loan.tenureMonths} months</span>
                  <span><strong>Funded:</strong> {loan.fundedAmount || 0}</span>
                </div>
                
                <div style={styles.meta}>
                  <span><strong>Category:</strong> {loan.businessCategory}</span>
                  <span><strong>Purpose:</strong> {loan.purpose}</span>
                </div>
                
                {loan.rejectionReason && loan.status === "REJECTED" && (
                  <div style={{...styles.error, marginTop: "8px", fontSize: "14px"}}>
                    <strong>Rejection reason:</strong> {loan.rejectionReason}
                  </div>
                )}
                
                {getActionButtons(loan)}
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
    margin: "0 auto",
  },
  sub: {
    color: "#6b7280",
    marginBottom: "20px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
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
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  pendingList: {
    display: "grid",
    gap: "12px",
    marginTop: "14px",
  },
  loanCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px",
  },
  loanTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "600",
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "14px",
    color: "#374151",
    marginTop: "6px",
    flexWrap: "wrap",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  smallBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  filterToolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  filterRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    minWidth: "250px",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
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
  infoBox: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #bae6fd",
  },
  infoText: {
    fontSize: "13px",
    fontStyle: "italic",
  },
};