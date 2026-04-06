import { useEffect, useMemo, useState } from "react";
import client from "../api/client";

export default function Analytics() {
  const [summary, setSummary] = useState({
    totalFunding: 0,
    totalRepayment: 0,
    totalTransactions: 0
  });
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryRes, allLoansRes] = await Promise.all([
        client.get("/transactions/summary/analytics"),
        client.get("/loans")
      ]);

      setSummary(summaryRes.data);
      setLoans(allLoansRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const categoryCounts = useMemo(() => {
    return loans.reduce((acc, loan) => {
      const key = loan.businessCategory || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [loans]);

  const loanStatusCounts = useMemo(() => {
    return loans.reduce((acc, loan) => {
      const key = loan.status || "UNKNOWN";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [loans]);

  const totalLoanAmount = loans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
  const totalFundedAmountAcrossLoans = loans.reduce(
    (sum, loan) => sum + Number(loan.fundedAmount || 0),
    0
  );

  const fundingProgressPercent =
    totalLoanAmount > 0
      ? Math.round((totalFundedAmountAcrossLoans / totalLoanAmount) * 100)
      : 0;

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

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Analytics Dashboard
            <span style={styles.titleAccent}> | Performance Insights</span>
          </h1>
          <p style={styles.subtitle}>
            Track platform metrics, funding visibility, and loan portfolio performance
          </p>
        </div>
        <div style={styles.finBadge}>
          <span style={styles.finIcon}>📊</span>
          <span style={styles.finText}>Financial Analytics</span>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          <span style={styles.messageIcon}>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError("")} style={styles.closeBtn}>×</button>
        </div>
      )}

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, borderTopColor: "#2563eb"}}>
              <div style={styles.statIcon}>💰</div>
              <div>
                <h3 style={styles.statTitle}>Total Funded</h3>
                <p style={styles.statValue}>LKR {summary.totalFunding.toLocaleString()}</p>
              </div>
            </div>

            <div style={{...styles.statCard, borderTopColor: "#10b981"}}>
              <div style={styles.statIcon}>🔄</div>
              <div>
                <h3 style={styles.statTitle}>Total Repaid</h3>
                <p style={styles.statValue}>LKR {summary.totalRepayment.toLocaleString()}</p>
              </div>
            </div>

            <div style={{...styles.statCard, borderTopColor: "#8b5cf6"}}>
              <div style={styles.statIcon}>📊</div>
              <div>
                <h3 style={styles.statTitle}>Transactions</h3>
                <p style={styles.statValue}>{summary.totalTransactions.toLocaleString()}</p>
              </div>
            </div>

            <div style={{...styles.statCard, borderTopColor: "#f59e0b"}}>
              <div style={styles.statIcon}>📋</div>
              <div>
                <h3 style={styles.statTitle}>Active Loans</h3>
                <p style={styles.statValue}>{loans.length}</p>
              </div>
            </div>
          </div>

          {/* Funding Progress Section */}
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <h2 style={styles.sectionTitle}>📈 Overall Funding Progress</h2>
              <p style={styles.sectionDesc}>Track loan funding across the platform</p>
            </div>
            
            <div style={styles.progressCard}>
              <div style={styles.progressStats}>
                <div>
                  <p style={styles.progressLabel}>Total Requested</p>
                  <p style={styles.progressAmount}>LKR {totalLoanAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p style={styles.progressLabel}>Total Funded</p>
                  <p style={styles.progressAmount}>LKR {totalFundedAmountAcrossLoans.toLocaleString()}</p>
                </div>
                <div>
                  <p style={styles.progressLabel}>Funding Gap</p>
                  <p style={styles.progressAmount}>LKR {(totalLoanAmount - totalFundedAmountAcrossLoans).toLocaleString()}</p>
                </div>
              </div>
              
              <div style={styles.progressWrap}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${Math.min(fundingProgressPercent, 100)}%`,
                  }}
                />
              </div>
              <div style={styles.progressFooter}>
                <span style={styles.progressPercent}>{fundingProgressPercent}%</span>
                <span style={styles.progressText}>funded overall</span>
              </div>
            </div>
          </div>

          {/* Two Column Analytics */}
          <div style={styles.twoColGrid}>
            {/* Categories Section */}
            <div style={styles.analyticsCard}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>🏢</span>
                <h2 style={styles.cardTitle}>Loan Categories</h2>
              </div>
              {Object.keys(categoryCounts).length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>📭</span>
                  <p>No category data yet</p>
                </div>
              ) : (
                <div style={styles.categoryList}>
                  {Object.entries(categoryCounts).map(([category, count]) => (
                    <div key={category} style={styles.categoryItem}>
                      <span style={styles.categoryName}>{category}</span>
                      <span style={styles.categoryCount}>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Breakdown Section */}
            <div style={styles.analyticsCard}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>📊</span>
                <h2 style={styles.cardTitle}>Loan Status</h2>
              </div>
              {Object.keys(loanStatusCounts).length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>📭</span>
                  <p>No status data yet</p>
                </div>
              ) : (
                <div style={styles.statusList}>
                  {Object.entries(loanStatusCounts).map(([status, count]) => (
                    <div key={status} style={styles.statusItem}>
                      <div style={styles.statusInfo}>
                        <span style={{...styles.statusDot, background: getStatusColor(status)}}></span>
                        <span style={styles.statusName}>{status}</span>
                      </div>
                      <span style={styles.statusCount}>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Financial Inclusion Impact Section */}
          <div style={styles.impactSection}>
            <div style={styles.impactCard}>
              <div style={styles.impactHeader}>
                <span style={styles.impactLargeIcon}>🏦</span>
                <div>
                  <h2 style={styles.impactTitle}>Financial Inclusion Impact</h2>
                  <p style={styles.impactSubtitle}>Platform contribution to economic empowerment</p>
                </div>
              </div>
              
              <div style={styles.impactGrid}>
                <div style={styles.impactItem}>
                  <span style={styles.impactItemIcon}>🤝</span>
                  <div>
                    <h4 style={styles.impactItemTitle}>Peer-to-Peer Lending</h4>
                    <p style={styles.impactItemText}>Connecting lenders directly with borrowers</p>
                  </div>
                </div>
                
                <div style={styles.impactItem}>
                  <span style={styles.impactItemIcon}>📈</span>
                  <div>
                    <h4 style={styles.impactItemTitle}>Business Growth</h4>
                    <p style={styles.impactItemText}>Loans support small businesses and expansion</p>
                  </div>
                </div>
                
                <div style={styles.impactItem}>
                  <span style={styles.impactItemIcon}>🎓</span>
                  <div>
                    <h4 style={styles.impactItemTitle}>Education Access</h4>
                    <p style={styles.impactItemText}>Funds enable educational opportunities</p>
                  </div>
                </div>
                
                <div style={styles.impactItem}>
                  <span style={styles.impactItemIcon}>🏘️</span>
                  <div>
                    <h4 style={styles.impactItemTitle}>Community Development</h4>
                    <p style={styles.impactItemText}>Structured repayments build credit history</p>
                  </div>
                </div>
              </div>
              
              <p style={styles.impactDescription}>
                This platform enables financial inclusion by connecting borrowers with lenders, 
                facilitating transparent loan requests, funding, and repayments. Tracked business 
                categories and growth plans demonstrate how loans contribute to economic empowerment, 
                business sustainability, and community development.
              </p>
            </div>
          </div>
        </>
      )}
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
    fontSize: "28px",
    fontWeight: "800",
    color: "#1f2937",
    margin: 0,
  },
  
  progressSection: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
  },
  
  progressHeader: {
    marginBottom: "20px",
  },
  
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px 0",
  },
  
  sectionDesc: {
    color: "#6b7280",
    margin: 0,
    fontSize: "14px",
  },
  
  progressCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  progressStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  
  progressLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#6b7280",
    margin: "0 0 4px 0",
  },
  
  progressAmount: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  progressWrap: {
    width: "100%",
    height: "12px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #2563eb 0%, #1e40af 100%)",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },
  
  progressFooter: {
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  
  progressPercent: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#2563eb",
  },
  
  progressText: {
    fontSize: "14px",
    color: "#6b7280",
  },
  
  twoColGrid: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
  },
  
  analyticsCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  
  cardIcon: {
    fontSize: "28px",
  },
  
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  
  categoryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#f9fafb",
    borderRadius: "8px",
    transition: "background 0.2s",
  },
  
  categoryName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  
  categoryCount: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#3b82f6",
  },
  
  statusList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  
  statusItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    background: "#f9fafb",
    borderRadius: "8px",
    transition: "background 0.2s",
  },
  
  statusInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "inline-block",
  },
  
  statusName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  
  statusCount: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#8b5cf6",
  },
  
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#9ca3af",
  },
  
  emptyIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "12px",
  },
  
  impactSection: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  
  impactCard: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    borderRadius: "20px",
    padding: "32px",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  
  impactHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
  },
  
  impactLargeIcon: {
    fontSize: "48px",
  },
  
  impactTitle: {
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 4px 0",
  },
  
  impactSubtitle: {
    fontSize: "14px",
    opacity: 0.9,
    margin: 0,
  },
  
  impactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },
  
  impactItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
  },
  
  impactItemIcon: {
    fontSize: "28px",
  },
  
  impactItemTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 4px 0",
  },
  
  impactItemText: {
    fontSize: "13px",
    opacity: 0.9,
    margin: 0,
    lineHeight: "1.4",
  },
  
  impactDescription: {
    fontSize: "14px",
    lineHeight: "1.6",
    opacity: 0.95,
    margin: 0,
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.2)",
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