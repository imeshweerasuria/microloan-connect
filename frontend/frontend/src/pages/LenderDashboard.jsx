import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function LenderDashboard() {
  const [loans, setLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [loansRes, txRes] = await Promise.all([
        client.get("/loans?status=APPROVED"),
        client.get("/transactions/me")
      ]);

      setLoans(loansRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load lender dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const categories = [...new Set(loans.map((loan) => loan.businessCategory).filter(Boolean))];

  const filteredLoans = useMemo(() => {
    const q = search.trim().toLowerCase();

    return loans.filter((loan) => {
      const matchesCategory = category ? loan.businessCategory === category : true;
      const matchesSearch =
        !q ||
        String(loan.title || "").toLowerCase().includes(q) ||
        String(loan.purpose || "").toLowerCase().includes(q) ||
        String(loan.businessCategory || "").toLowerCase().includes(q) ||
        String(loan.povertyImpactPlanSnapshot || "").toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [loans, category, search]);

  const totalAvailableAmount = loans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
  const totalFundedAmount = loans.reduce((sum, loan) => sum + Number(loan.fundedAmount || 0), 0);
  const fundingProgressPercent = totalAvailableAmount > 0 
    ? Math.round((totalFundedAmount / totalAvailableAmount) * 100) 
    : 0;

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading available loans...</p>
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
            Lender Dashboard
            <span style={styles.titleAccent}> | Empower Communities</span>
          </h1>
          <p style={styles.subtitle}>
            Browse approved loan requests, support underserved borrowers, and track your impact
          </p>
        </div>
        <div style={styles.sdgBadge}>
          <span style={styles.sdgIcon}>🎯</span>
          <span style={styles.sdgText}>SDG Goal 1: No Poverty</span>
        </div>
      </div>

      {/* Error Message */}
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
          <div style={styles.statIcon}>📋</div>
          <div>
            <h3 style={styles.statTitle}>Approved Loans</h3>
            <p style={styles.statValue}>{loans.length}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#10b981"}}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <h3 style={styles.statTitle}>Available for Funding</h3>
            <p style={styles.statValue}>LKR {totalAvailableAmount.toLocaleString()}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#8b5cf6"}}>
          <div style={styles.statIcon}>📊</div>
          <div>
            <h3 style={styles.statTitle}>Your Transactions</h3>
            <p style={styles.statValue}>{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Overall Funding Progress */}
      <div style={styles.progressSection}>
        <div style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <span style={styles.progressIcon}>📈</span>
            <div>
              <h4 style={styles.progressTitle}>Overall Community Funding Progress</h4>
              <p style={styles.progressSubtitle}>Track how we're collectively supporting borrowers</p>
            </div>
          </div>
          <div style={styles.progressWrap}>
            <div style={{...styles.progressBar, width: `${fundingProgressPercent}%`}} />
          </div>
          <div style={styles.progressStats}>
            <span>LKR {totalFundedAmount.toLocaleString()} funded</span>
            <span>{fundingProgressPercent}% of total</span>
            <span>LKR {(totalAvailableAmount - totalFundedAmount).toLocaleString()} remaining</span>
          </div>
        </div>
      </div>

      {/* Browse Loans Section */}
      <div style={styles.browseSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionIcon}>🔍</span>
          <div>
            <h2 style={styles.sectionTitle}>Browse Loan Opportunities</h2>
            <p style={styles.sectionDesc}>Find borrowers who match your lending goals</p>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by title, purpose, category, or impact plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select
            style={styles.filterSelect}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {(search || category) && (
            <button
              style={styles.clearBtn}
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div style={styles.resultsCount}>
          Found <strong>{filteredLoans.length}</strong> loan{filteredLoans.length !== 1 ? 's' : ''} matching your criteria
        </div>

        {/* Loan Grid */}
        {filteredLoans.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📭</span>
            <p style={styles.emptyText}>No loans match your search criteria</p>
            <p style={styles.emptySubtext}>Try adjusting your filters or check back later for new opportunities</p>
          </div>
        ) : (
          <div style={styles.loanGrid}>
            {filteredLoans.map((loan) => {
              const funded = Number(loan.fundedAmount || 0);
              const amount = Number(loan.amount || 0);
              const remaining = amount - funded;
              const progress = amount > 0 ? Math.round((funded / amount) * 100) : 0;

              return (
                <div key={loan._id} style={styles.loanCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.loanTitle}>{loan.title}</h3>
                    <span style={styles.impactTag}>Impact Ready</span>
                  </div>

                  <div style={styles.loanPurpose}>
                    <span style={styles.purposeIcon}>🎯</span>
                    <div>
                      <p style={styles.purposeLabel}>Purpose</p>
                      <p style={styles.purposeText}>{loan.purpose}</p>
                    </div>
                  </div>

                  <div style={styles.detailsGrid}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Category</span>
                      <span style={styles.detailValue}>{loan.businessCategory}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Amount</span>
                      <span style={styles.detailValue}>{loan.amount} {loan.currency}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Funded So Far</span>
                      <span style={styles.detailValue}>{loan.fundedAmount || 0}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Remaining</span>
                      <span style={{...styles.detailValue, color: "#f59e0b", fontWeight: "700"}}>
                        {remaining}
                      </span>
                    </div>
                  </div>

                  <div style={styles.impactBox}>
                    <span style={styles.impactIcon}>🌱</span>
                    <div>
                      <p style={styles.impactLabel}>Poverty Impact Plan</p>
                      <p style={styles.impactText}>{loan.povertyImpactPlanSnapshot}</p>
                    </div>
                  </div>

                  <div style={styles.progressWrap}>
                    <div style={{...styles.progressBar, width: `${Math.min(progress, 100)}%`}} />
                  </div>
                  <div style={styles.progressInfo}>
                    <span style={styles.progressPercent}>{progress}% funded</span>
                    <span style={styles.progressRemaining}>Needs {remaining} more</span>
                  </div>

                  <Link to={`/transactions?loanId=${loan._id}`} style={styles.fundBtn}>
                    <span>💚</span>
                    Fund This Loan
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Impact Section */}
      <div style={styles.impactSection}>
        <div style={styles.impactCard}>
          <div style={styles.impactHeader}>
            <span style={styles.impactLargeIcon}>🌟</span>
            <div>
              <h3 style={styles.impactTitle}>Your Impact Matters</h3>
              <p style={styles.impactSubtitle}>Every loan you fund helps achieve SDG Goal 1: No Poverty</p>
            </div>
          </div>
          <div style={styles.impactStats}>
            <div style={styles.impactStat}>
              <span style={styles.impactStatValue}>{transactions.length}</span>
              <span style={styles.impactStatLabel}>Loans Funded</span>
            </div>
            <div style={styles.impactDivider}></div>
            <div style={styles.impactStat}>
              <span style={styles.impactStatValue}>
                LKR {transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}
              </span>
              <span style={styles.impactStatLabel}>Total Contributed</span>
            </div>
          </div>
          <p style={styles.impactDescription}>
            By funding micro-loans, you're directly contributing to poverty reduction, 
            supporting small businesses, and creating sustainable livelihoods in underserved communities.
          </p>
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
    cursor: "pointer",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    },
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
  
  progressCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  progressHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  
  progressIcon: {
    fontSize: "28px",
  },
  
  progressTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 4px 0",
  },
  
  progressSubtitle: {
    fontSize: "13px",
    color: "#6b7280",
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
    background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },
  
  progressStats: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "12px",
    fontSize: "13px",
    color: "#6b7280",
  },
  
  browseSection: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
  },
  
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  
  sectionIcon: {
    fontSize: "32px",
  },
  
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 4px 0",
  },
  
  sectionDesc: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  
  filterBar: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "20px",
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
    ":focus": {
      borderColor: "#3b82f6",
    },
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
  
  clearBtn: {
    padding: "12px 20px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
    ":hover": {
      background: "#e5e7eb",
    },
  },
  
  resultsCount: {
    marginBottom: "20px",
    fontSize: "14px",
    color: "#6b7280",
  },
  
  loanGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "24px",
  },
  
  loanCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.2s",
    ":hover": {
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      transform: "translateY(-4px)",
    },
  },
  
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  
  loanTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  impactTag: {
    padding: "4px 12px",
    background: "#d1fae5",
    color: "#065f46",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  
  loanPurpose: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    background: "#f9fafb",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  
  purposeIcon: {
    fontSize: "20px",
  },
  
  purposeLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#9ca3af",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
  },
  
  purposeText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    margin: 0,
  },
  
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
  
  impactBox: {
    display: "flex",
    gap: "12px",
    padding: "12px",
    background: "#f0fdf4",
    borderRadius: "12px",
    marginBottom: "16px",
    borderLeft: "3px solid #10b981",
  },
  
  impactIcon: {
    fontSize: "18px",
  },
  
  impactLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#059669",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
  },
  
  impactText: {
    fontSize: "13px",
    color: "#065f46",
    margin: 0,
    lineHeight: "1.4",
  },
  
  progressWrap: {
    width: "100%",
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    marginBottom: "16px",
  },
  
  progressPercent: {
    color: "#10b981",
    fontWeight: "600",
  },
  
  progressRemaining: {
    color: "#6b7280",
  },
  
  fundBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    textDecoration: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "transform 0.1s",
    ":active": {
      transform: "scale(0.98)",
    },
  },
  
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "16px",
  },
  
  emptyIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "16px",
  },
  
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 8px 0",
  },
  
  emptySubtext: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: 0,
  },
  
  impactSection: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  
  impactCard: {
    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    borderRadius: "20px",
    padding: "32px",
    color: "white",
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
    fontSize: "22px",
    fontWeight: "700",
    margin: "0 0 4px 0",
  },
  
  impactSubtitle: {
    fontSize: "14px",
    opacity: 0.9,
    margin: 0,
  },
  
  impactStats: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "32px",
    marginBottom: "24px",
    padding: "20px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "16px",
  },
  
  impactStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  
  impactStatValue: {
    fontSize: "28px",
    fontWeight: "800",
  },
  
  impactStatLabel: {
    fontSize: "13px",
    opacity: 0.9,
  },
  
  impactDivider: {
    width: "1px",
    height: "40px",
    background: "rgba(255,255,255,0.3)",
  },
  
  impactDescription: {
    fontSize: "14px",
    lineHeight: "1.6",
    opacity: 0.95,
    margin: 0,
    textAlign: "center",
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