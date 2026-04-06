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
            <span style={styles.titleAccent}> | Investment Opportunities</span>
          </h1>
          <p style={styles.subtitle}>
            Browse approved loan requests, support borrowers, and track your portfolio
          </p>
        </div>
        <div style={styles.finBadge}>
          <span style={styles.finIcon}>🏦</span>
          <span style={styles.finText}>Financial Inclusion</span>
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
        
        <div style={{...styles.statCard, borderTopColor: "#2563eb"}}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <h3 style={styles.statTitle}>Available for Funding</h3>
            <p style={styles.statValue}>LKR {totalAvailableAmount.toLocaleString()}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#8b5cf6"}}>
          <div style={styles.statIcon}>📊</div>
          <div>
            <h3 style={styles.statTitle}>Your Investments</h3>
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
              <h4 style={styles.progressTitle}>Platform Funding Progress</h4>
              <p style={styles.progressSubtitle}>Track collective investment in approved loans</p>
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
            <h2 style={styles.sectionTitle}>Browse Investment Opportunities</h2>
            <p style={styles.sectionDesc}>Find borrowers that match your investment criteria</p>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder="Search by title or purpose."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div style={styles.filterWrapper}>
            <span style={styles.filterIcon}>📂</span>
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
          </div>

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
                    <span style={styles.investTag}>Ready for Investment</span>
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
                    <span style={styles.impactIcon}>📈</span>
                    <div>
                      <p style={styles.impactLabel}>Growth Impact Plan</p>
                      <p style={styles.impactText}>{loan.povertyImpactPlanSnapshot}</p>
                    </div>
                  </div>

                  <div style={styles.progressWrapSmall}>
                    <div style={{...styles.progressBar, width: `${Math.min(progress, 100)}%`}} />
                  </div>
                  <div style={styles.progressInfo}>
                    <span style={styles.progressPercent}>{progress}% funded</span>
                    <span style={styles.progressRemaining}>Needs {remaining} more</span>
                  </div>

                  <Link to={`/transactions?loanId=${loan._id}`} style={styles.fundBtn}>
                    <span>💰</span>
                    Invest Now
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Impact Section - Financial Empowerment */}
      <div style={styles.impactSection}>
        <div style={styles.impactCard}>
          <div style={styles.impactHeader}>
            <span style={styles.impactLargeIcon}>📊</span>
            <div>
              <h3 style={styles.impactTitle}>Your Investment Impact</h3>
              <p style={styles.impactSubtitle}>Every funded loan drives financial inclusion and economic growth</p>
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
              <span style={styles.impactStatLabel}>Total Invested</span>
            </div>
          </div>
          <p style={styles.impactDescription}>
            By funding micro-loans, you're directly contributing to economic empowerment,
            supporting small businesses, and helping create sustainable livelihoods.
          </p>
        </div>
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
    margin: "0 auto 30px",
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
    background: "linear-gradient(90deg, #2563eb 0%, #1e40af 100%)",
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
    alignItems: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  searchWrapper: {
    flex: "2",
    minWidth: "250px",
    position: "relative",
  },
  
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
    color: "#9ca3af",
    pointerEvents: "none",
  },
  
  searchInput: {
    width: "100%",
    padding: "12px 16px 12px 42px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "#f9fafb",
  },
  
  filterWrapper: {
    flex: "1",
    minWidth: "200px",
    position: "relative",
  },
  
  filterIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "18px",
    color: "#9ca3af",
    pointerEvents: "none",
    zIndex: 1,
  },
  
  filterSelect: {
    width: "100%",
    padding: "12px 16px 12px 42px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
    backgroundColor: "#f9fafb",
    transition: "all 0.2s",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundPosition: "right 12px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "20px",
  },
  
  clearBtn: {
    padding: "12px 24px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    color: "#374151",
    whiteSpace: "nowrap",
  },
  
  resultsCount: {
    marginBottom: "20px",
    fontSize: "14px",
    color: "#6b7280",
    padding: "0 4px",
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
  
  investTag: {
    padding: "4px 12px",
    background: "#dbeafe",
    color: "#1e40af",
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
    background: "#eff6ff",
    borderRadius: "12px",
    marginBottom: "16px",
    borderLeft: "3px solid #3b82f6",
  },
  
  impactIcon: {
    fontSize: "18px",
  },
  
  impactLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#1e40af",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
  },
  
  impactText: {
    fontSize: "13px",
    color: "#1e3a8a",
    margin: 0,
    lineHeight: "1.4",
  },
  
  progressWrapSmall: {
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
    color: "#2563eb",
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
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    color: "white",
    textDecoration: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "opacity 0.2s",
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
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
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