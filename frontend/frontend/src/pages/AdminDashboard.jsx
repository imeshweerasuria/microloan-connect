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
      
      const loansRes = await client.get("/loans");
      setAllLoans(loansRes.data || []);
      
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
      
      const response = await client.patch(`/loans/${loanId}/approve`);

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
      
      const response = await client.patch(`/loans/${loanId}/reject`);

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
      case "DRAFT": return "#f59e0b";
      case "SUBMITTED": return "#3b82f6";
      case "APPROVED": return "#2563eb";
      case "REJECTED": return "#ef4444";
      case "FUNDED": return "#8b5cf6";
      case "ACTIVE": return "#06b6d4";
      case "CLOSED": return "#6b7280";
      default: return "#374151";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "DRAFT": return "#fef3c7";
      case "SUBMITTED": return "#dbeafe";
      case "APPROVED": return "#e0e7ff";
      case "REJECTED": return "#fee2e2";
      case "FUNDED": return "#ede9fe";
      case "ACTIVE": return "#cffafe";
      case "CLOSED": return "#f3f4f6";
      default: return "#f9fafb";
    }
  };

  const getActionButtons = (loan) => {
    switch (loan.status) {
      case "SUBMITTED":
        return (
          <div style={styles.actionButtons}>
            <button 
              style={styles.approveBtn} 
              onClick={() => handleApproveLoan(loan._id)}
              disabled={processingAction}
            >
              <span>✓</span> Approve
            </button>
            <button 
              style={styles.rejectBtn} 
              onClick={() => handleRejectLoan(loan._id)}
              disabled={processingAction}
            >
              <span>✗</span> Reject
            </button>
          </div>
        );
      case "APPROVED":
        return (
          <div style={styles.actionButtons}>
            <span style={styles.infoText}>
              📋 Awaiting funding
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
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Admin Dashboard
            <span style={styles.titleAccent}> | Loan Management</span>
          </h1>
          <p style={styles.subtitle}>
            Oversee loan applications, manage approvals, and track funding
          </p>
        </div>
        <div style={styles.finBadge}>
          <span style={styles.finIcon}>🏦</span>
          <span style={styles.finText}>Financial Inclusion</span>
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
            <h3 style={styles.statTitle}>Total Loans</h3>
            <p style={styles.statValue}>{stats.totalLoans}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#f59e0b"}}>
          <div style={styles.statIcon}>⏳</div>
          <div>
            <h3 style={styles.statTitle}>Pending Approvals</h3>
            <p style={{...styles.statValue, color: "#f59e0b"}}>{stats.pendingApprovals}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#2563eb"}}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <h3 style={styles.statTitle}>Approved</h3>
            <p style={{...styles.statValue, color: "#2563eb"}}>{stats.approvedLoans}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#ef4444"}}>
          <div style={styles.statIcon}>❌</div>
          <div>
            <h3 style={styles.statTitle}>Rejected</h3>
            <p style={{...styles.statValue, color: "#ef4444"}}>{stats.rejectedLoans}</p>
          </div>
        </div>
      </div>

      {/* Financial Stats */}
      <div style={styles.financialGrid}>
        <div style={styles.financialCard}>
          <div style={styles.financialIcon}>💰</div>
          <div>
            <p style={styles.financialLabel}>Total Requested</p>
            <p style={styles.financialValue}>LKR {stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
        
        <div style={styles.financialCard}>
          <div style={styles.financialIcon}>🤝</div>
          <div>
            <p style={styles.financialLabel}>Total Funded</p>
            <p style={styles.financialValue}>LKR {stats.fundedAmount.toLocaleString()}</p>
          </div>
        </div>
        
        <div style={styles.financialCard}>
          <div style={styles.financialIcon}>🚀</div>
          <div>
            <p style={styles.financialLabel}>Active/Funded</p>
            <p style={{...styles.financialValue, color: "#8b5cf6"}}>{stats.fundedLoans}</p>
          </div>
        </div>
        
        <div style={styles.financialCard}>
          <div style={styles.financialIcon}>📈</div>
          <div>
            <p style={styles.financialLabel}>Funding Rate</p>
            <p style={styles.financialValue}>
              {stats.totalAmount > 0 ? Math.round((stats.fundedAmount / stats.totalAmount) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      {submittedLoans.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              📋 Pending Approvals
              <span style={styles.badge}>{submittedLoans.length}</span>
            </h2>
            <p style={styles.sectionDesc}>Review and take action on loan requests</p>
          </div>
          
          <div style={styles.pendingGrid}>
            {submittedLoans.map((loan) => (
              <div key={loan._id} style={styles.pendingCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.loanTitle}>{loan.title}</h3>
                  <span style={{...styles.statusBadge, background: getStatusBgColor(loan.status), color: getStatusColor(loan.status)}}>
                    {loan.status}
                  </span>
                </div>
                
                <p style={styles.loanDescription}>{loan.description}</p>
                
                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Borrower ID</span>
                    <span style={styles.detailValue}>{loan.borrowerId?.slice(-8) || "Unknown"}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Amount</span>
                    <span style={styles.detailValue}>{loan.amount} {loan.currency}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Tenure</span>
                    <span style={styles.detailValue}>{loan.tenureMonths} months</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Category</span>
                    <span style={styles.detailValue}>{loan.businessCategory}</span>
                  </div>
                </div>
                
                <div style={styles.purposeBox}>
                  <span style={styles.purposeLabel}>Purpose:</span>
                  <span style={styles.purposeText}>{loan.purpose}</span>
                </div>
                
                <div style={styles.actionButtons}>
                  <button style={styles.approveBtn} onClick={() => handleApproveLoan(loan._id)} disabled={processingAction}>
                    ✓ Approve Loan
                  </button>
                  <button style={styles.rejectBtn} onClick={() => handleRejectLoan(loan._id)} disabled={processingAction}>
                    ✗ Reject Loan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Loans Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>📚 All Loans</h2>
          <p style={styles.sectionDesc}>Browse and filter all loan applications</p>
        </div>
        
        {/* Filters */}
        <div style={styles.filterBar}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by title, purpose, category, or borrower..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select
            style={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">📊 All Statuses</option>
            <option value="DRAFT">📝 DRAFT</option>
            <option value="SUBMITTED">⏳ SUBMITTED</option>
            <option value="APPROVED">✅ APPROVED</option>
            <option value="REJECTED">❌ REJECTED</option>
            <option value="FUNDED">💰 FUNDED</option>
            <option value="ACTIVE">🚀 ACTIVE</option>
            <option value="CLOSED">🔒 CLOSED</option>
          </select>
        </div>

        {filteredLoans.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🔍</span>
            <p style={styles.emptyText}>No loans match your search criteria</p>
            <button style={styles.clearBtn} onClick={() => { setSearch(""); setStatusFilter("ALL"); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={styles.loansGrid}>
            {filteredLoans.map((loan) => (
              <div key={loan._id} style={styles.loanCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.loanTitle}>{loan.title}</h3>
                  <span style={{...styles.statusBadge, background: getStatusBgColor(loan.status), color: getStatusColor(loan.status)}}>
                    {loan.status}
                  </span>
                </div>
                
                <p style={styles.loanDescription}>{loan.description}</p>
                
                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Borrower</span>
                    <span style={styles.detailValue}>{loan.borrowerId?.slice(-8) || "Unknown"}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Amount</span>
                    <span style={styles.detailValue}>{loan.amount} {loan.currency}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Tenure</span>
                    <span style={styles.detailValue}>{loan.tenureMonths}m</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Funded</span>
                    <span style={styles.detailValue}>{loan.fundedAmount || 0}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Category</span>
                    <span style={styles.detailValue}>{loan.businessCategory}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Purpose</span>
                    <span style={styles.detailValue}>{loan.purpose}</span>
                  </div>
                </div>
                
                {loan.rejectionReason && loan.status === "REJECTED" && (
                  <div style={styles.rejectionBox}>
                    <span style={styles.rejectionLabel}>Rejection reason:</span>
                    <span style={styles.rejectionText}>{loan.rejectionReason}</span>
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
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
    padding: "40px 24px",
  },
  
  heroSection: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  
  heroContent: {
    flex: 1,
  },
  
  title: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  
  titleAccent: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  
  subtitle: {
    color: "#4b5563",
    fontSize: "16px",
    margin: 0,
  },
  
  finBadge: {
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    padding: "12px 20px",
    borderRadius: "40px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
  },
  
  finIcon: {
    fontSize: "24px",
  },
  
  finText: {
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
  },
  
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  
  loadingText: {
    marginTop: "16px",
    color: "#6b7280",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
    cursor: "pointer",
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
    fontSize: "32px",
    fontWeight: "800",
    color: "#1f2937",
    margin: 0,
  },
  
  financialGrid: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  
  financialCard: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  financialIcon: {
    fontSize: "32px",
  },
  
  financialLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#6b7280",
    margin: "0 0 4px 0",
  },
  
  financialValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  section: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
  },
  
  sectionHeader: {
    marginBottom: "24px",
  },
  
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  
  sectionDesc: {
    color: "#6b7280",
    margin: 0,
    fontSize: "14px",
  },
  
  badge: {
    background: "#ef4444",
    color: "white",
    padding: "2px 10px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },
  
  filterBar: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "24px",
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  searchWrapper: {
    flex: 1,
    position: "relative",
    minWidth: "250px",
  },
  
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
  },
  
  searchInput: {
    width: "100%",
    padding: "12px 12px 12px 40px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  
  filterSelect: {
    padding: "12px 16px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
    background: "white",
  },
  
  pendingGrid: {
    display: "grid",
    gap: "20px",
  },
  
  loansGrid: {
    display: "grid",
    gap: "20px",
  },
  
  pendingCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.2s",
    border: "1px solid #fef3c7",
  },
  
  loanCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.2s",
  },
  
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  
  loanTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  
  loanDescription: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "16px",
  },
  
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  
  detailLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  
  detailValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  
  purposeBox: {
    background: "#f3f4f6",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  
  purposeLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    display: "block",
    marginBottom: "4px",
  },
  
  purposeText: {
    fontSize: "14px",
    color: "#374151",
  },
  
  rejectionBox: {
    background: "#fee2e2",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    borderLeft: "3px solid #ef4444",
  },
  
  rejectionLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#991b1b",
    display: "block",
    marginBottom: "4px",
  },
  
  rejectionText: {
    fontSize: "14px",
    color: "#7f1d1d",
  },
  
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
    flexWrap: "wrap",
  },
  
  approveBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "opacity 0.2s",
  },
  
  rejectBtn: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "opacity 0.2s",
  },
  
  infoText: {
    fontSize: "13px",
    color: "#8b5cf6",
    fontStyle: "italic",
    background: "#ede9fe",
    padding: "8px 16px",
    borderRadius: "8px",
  },
  
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "16px",
  },
  
  emptyIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "16px",
  },
  
  emptyText: {
    color: "#6b7280",
    fontSize: "16px",
    marginBottom: "16px",
  },
  
  clearBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
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