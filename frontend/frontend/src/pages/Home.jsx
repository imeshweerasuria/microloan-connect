import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

// ============================================
// Home Component - Micro-Loan Connect Platform
// Professional, Modern, Animated Landing Page
// ============================================

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for real statistics from API
  const [stats, setStats] = useState({
    activeLoans: 0,
    fundedAmount: 0,
    borrowersServed: 0,
    lendersCount: 0,
    repaymentRate: 98,
  });

  const [loading, setLoading] = useState(true);
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    activeLoans: 0,
    fundedAmount: 0,
    borrowersServed: 0,
    lendersCount: 0,
  });

  // Fetch real data from API
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch loans data
      const loansRes = await client.get("/loans?status=APPROVED");
      const allLoans = loansRes.data || [];
      
      // Calculate real stats
      const activeLoansCount = allLoans.length;
      const totalFundedAmount = allLoans.reduce((sum, loan) => sum + Number(loan.fundedAmount || 0), 0);
      //const totalLoanAmount = allLoans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
      
      // Fetch unique borrowers
      const borrowersRes = await client.get("/users?role=BORROWER");
      const borrowersCount = borrowersRes.data?.length || 0;
      
      // Fetch unique lenders
      const lendersRes = await client.get("/users?role=LENDER");
      const lendersCount = lendersRes.data?.length || 0;
      
      // Calculate repayment rate (example calculation - you can adjust based on your data)
      const completedRepaymentsRes = await client.get("/repayments?status=COMPLETED");
      const totalRepaymentsRes = await client.get("/repayments");
      const repaymentRate = totalRepaymentsRes.data?.length > 0 
        ? Math.round((completedRepaymentsRes.data?.length / totalRepaymentsRes.data?.length) * 100)
        : 98;
      
      setStats({
        activeLoans: activeLoansCount,
        fundedAmount: totalFundedAmount,
        borrowersServed: borrowersCount,
        lendersCount: lendersCount,
        repaymentRate: repaymentRate,
      });
      
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      // Fallback to demo data if API fails
      setStats({
        activeLoans: 2847,
        fundedAmount: 1258000,
        borrowersServed: 1920,
        lendersCount: 1245,
        repaymentRate: 98,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Handle navigation based on user role
  const handleLoanNavigation = () => {
    if (!user) {
      navigate('/login', { state: { from: '/borrower/dashboard' } });
    } else if (user.role === 'BORROWER') {
      navigate('/borrower/dashboard');
    } else {
      alert('Please register as a borrower to access the loan dashboard');
      navigate('/register');
    }
  };

  const handleLendNavigation = () => {
    if (!user) {
      navigate('/login', { state: { from: '/lender/dashboard' } });
    } else if (user.role === 'LENDER') {
      navigate('/lender/dashboard');
    } else {
      alert('Please register as a lender to access the lending dashboard');
      navigate('/register');
    }
  };

  // Intersection Observer to trigger counter animation when stats section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated && !loading) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated, loading, stats]);

  // Animate counters from 0 to target values
  const animateCounters = () => {
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedStats({
          activeLoans: stats.activeLoans,
          fundedAmount: stats.fundedAmount,
          borrowersServed: stats.borrowersServed,
          lendersCount: stats.lendersCount,
        });
        clearInterval(interval);
      } else {
        setAnimatedStats({
          activeLoans: Math.floor(stats.activeLoans * (currentStep / steps)),
          fundedAmount: Math.floor(stats.fundedAmount * (currentStep / steps)),
          borrowersServed: Math.floor(stats.borrowersServed * (currentStep / steps)),
          lendersCount: Math.floor(stats.lendersCount * (currentStep / steps)),
        });
      }
    }, stepTime);
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `LKR ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `LKR ${(amount / 1000).toFixed(0)}K`;
    return `LKR ${amount.toLocaleString()}`;
  };

  const currentYear = new Date().getFullYear();

  return (
    <div style={styles.pageContainer}>
      {/* Animated Background Elements */}
      <div style={styles.bgOrb1}></div>
      <div style={styles.bgOrb2}></div>
      <div style={styles.bgGrid}></div>

      <div style={styles.container}>

        {/* Hero Section */}
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.heroBadge}>
              <span>✨</span> Financial Inclusion for All
            </div>
            <h1 style={styles.heroTitle}>
              Empower dreams, <br />
              <span style={styles.gradientText}>one micro-loan at a time</span>
            </h1>
            <p style={styles.heroDesc}>
              Micro-Loan Connect brings together compassionate lenders and determined borrowers
              to build resilient communities. Transparent, secure, and socially impactful.
            </p>
            <div style={styles.heroButtons}>
              <button onClick={handleLoanNavigation} style={styles.btnPrimary}>
                <span>📋</span> I need a loan
              </button>
              <button onClick={handleLendNavigation} style={styles.btnPrimary}>
                <span>🤝</span> I want to lend
              </button>
            </div>
            <div style={styles.heroStats}>
              <div>
                <span style={styles.heroStatNumber}>{stats.repaymentRate}%</span>
                <span style={styles.heroStatLabel}>Repayment Rate</span>
              </div>
              <div>
                <span style={styles.heroStatNumber}>{stats.borrowersServed}+</span>
                <span style={styles.heroStatLabel}>Lives Impacted</span>
              </div>
              <div>
                <span style={styles.heroStatNumber}>24/7</span>
                <span style={styles.heroStatLabel}>Support</span>
              </div>
            </div>
          </div>
          <div style={styles.heroVisual}>
            <div style={styles.floatingCard}>
              <span style={styles.floatingIcon}>🏦</span>
              <div style={styles.floatingChart}>
                <div style={styles.chartBar}></div>
                <div style={styles.chartBar}></div>
                <div style={styles.chartBar}></div>
                <div style={styles.chartBar}></div>
              </div>
              <p style={styles.floatingText}>Growing together 📈</p>
            </div>
          </div>
        </div>

        {/* Role Cards Section */}
        <div style={styles.rolesSection}>
          <h2 style={styles.sectionTitle}>Designed for two sides of impact</h2>
          <p style={styles.sectionSubtitle}>
            Whether you're seeking financial support or offering it, our platform provides
            transparency, trust, and real results.
          </p>

          <div style={styles.cardGrid}>
            {/* Borrower Card */}
            <div style={styles.roleCard}>
              <div style={styles.cardIcon}>👩‍🌾</div>
              <h3 style={styles.cardTitle}>Borrowers</h3>
              <p style={styles.cardDesc}>
                Create a profile, share your story, apply for affordable loans to start or grow
                a business, and track everything in one place.
              </p>
              <button style={styles.cardLink} onClick={handleLoanNavigation}>
                Learn more <span style={styles.arrowIcon}>→</span>
              </button>
            </div>

            {/* Lender Card */}
            <div style={styles.roleCard}>
              <div style={styles.cardIcon}>🤝</div>
              <h3 style={styles.cardTitle}>Lenders</h3>
              <p style={styles.cardDesc}>
                Fund vetted loan requests, directly support entrepreneurs, and measure your
                social impact while earning micro-returns.
              </p>
              <button style={styles.cardLink} onClick={handleLendNavigation}>
                Start lending <span style={styles.arrowIcon}>→</span>
              </button>
            </div>

            {/* Admin Card */}
            <div style={styles.roleCard}>
              <div style={styles.cardIcon}>🛡️</div>
              <h3 style={styles.cardTitle}>Admin Oversight</h3>
              <p style={styles.cardDesc}>
                Secure, verified, and compliant platform management ensures every loan request
                is reviewed with fairness and care.
              </p>
              <button style={styles.cardLink} onClick={() => navigate("/admin/dashboard")}>
                Platform integrity <span style={styles.arrowIcon}>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Animated Stats Section */}
        <div ref={statsRef} style={styles.statsSection}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{animatedStats.activeLoans.toLocaleString()}</div>
            <div style={styles.statLabel}>Active Loans</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{formatCurrency(animatedStats.fundedAmount)}</div>
            <div style={styles.statLabel}>Total Funded</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{animatedStats.borrowersServed.toLocaleString()}</div>
            <div style={styles.statLabel}>Borrowers Served</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{animatedStats.lendersCount.toLocaleString()}</div>
            <div style={styles.statLabel}>Active Lenders</div>
          </div>
        </div>

        {/* Detailed Information Section */}
        <div style={styles.infoSection}>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>📊</div>
            <h3 style={styles.infoTitle}>For Borrowers</h3>
            <p style={styles.infoText}>
              Micro-Loan Connect provides a trusted space to create a profile, explain your
              financial needs, submit loan requests, and track progress. Whether you want to
              start a small business, expand livelihood, or improve household stability —
              we're here to help.
            </p>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>💸</div>
            <h3 style={styles.infoTitle}>For Lenders</h3>
            <p style={styles.infoText}>
              Explore approved loan requests, review the purpose and background, and fund
              borrowers whose goals align with your values. A personal lending experience
              that goes beyond money, driving long-term community empowerment.
            </p>
          </div>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>⚖️</div>
            <h3 style={styles.infoTitle}>Transparency & Trust</h3>
            <p style={styles.infoText}>
              Our platform supports fairness, accountability and clear oversight.
              Administrators ensure loan requests are properly reviewed and the platform
              remains secure, reliable, and well managed for everyone.
            </p>
          </div>
        </div>

        {/* SDG Call to Action Section */}
        <div style={styles.sdgSection}>
          <div style={styles.sdgIcon}>🌍</div>
          <h3 style={styles.sdgTitle}>Inspired by UN SDG 1: No Poverty</h3>
          <p style={styles.sdgText}>
            By enabling responsible lending and improving access to small-scale financial support,
            we reduce barriers and encourage economic growth from the ground up. Every funded loan
            supports income generation, resilience, and quality of life.
          </p>
          <button style={styles.sdgButton} onClick={() => navigate("/register")}>
            <span>💚</span> Join the movement
          </button>
        </div>

        {/* Real Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerSection}>
              <div style={styles.footerLogo}>
                <span style={styles.footerLogoIcon}>🏦</span>
                <span style={styles.footerLogoText}>Micro-Loan Connect</span>
              </div>
              <p style={styles.footerDescription}>
                Bridging trust, technology & social impact for underserved communities worldwide.
              </p>
              <div style={styles.socialLinks}>
                <a href="#" style={styles.socialLink}>📘</a>
                <a href="#" style={styles.socialLink}>🐦</a>
                <a href="#" style={styles.socialLink}>📷</a>
                <a href="#" style={styles.socialLink}>🔗</a>
              </div>
            </div>
            
            <div style={styles.footerSection}>
              <h4 style={styles.footerHeading}>Platform</h4>
              <ul style={styles.footerList}>
                <li><button onClick={handleLoanNavigation} style={styles.footerLink}>Borrow</button></li>
                <li><button onClick={handleLendNavigation} style={styles.footerLink}>Lend</button></li>
                <li><button onClick={() => navigate("/admin/dashboard")} style={styles.footerLink}>Admin</button></li>
                <li><a href="#" style={styles.footerLink}>How it Works</a></li>
              </ul>
            </div>
            
            <div style={styles.footerSection}>
              <h4 style={styles.footerHeading}>Resources</h4>
              <ul style={styles.footerList}>
                <li><a href="#" style={styles.footerLink}>Impact Stories</a></li>
                <li><a href="#" style={styles.footerLink}>FAQ</a></li>
                <li><a href="#" style={styles.footerLink}>Blog</a></li>
                <li><a href="#" style={styles.footerLink}>Support Center</a></li>
              </ul>
            </div>
            
            <div style={styles.footerSection}>
              <h4 style={styles.footerHeading}>Legal</h4>
              <ul style={styles.footerList}>
                <li><a href="#" style={styles.footerLink}>Privacy Policy</a></li>
                <li><a href="#" style={styles.footerLink}>Terms of Service</a></li>
                <li><a href="#" style={styles.footerLink}>Cookie Policy</a></li>
                <li><a href="#" style={styles.footerLink}>Compliance</a></li>
              </ul>
            </div>
            
            <div style={styles.footerSection}>
              <h4 style={styles.footerHeading}>Contact</h4>
              <ul style={styles.footerList}>
                <li><span style={styles.contactInfo}>📧 hello@microloanconnect.com</span></li>
                <li><span style={styles.contactInfo}>📞 +1 (555) 123-4567</span></li>
                <li><span style={styles.contactInfo}>📍 Colombo, Sri Lanka</span></li>
              </ul>
            </div>
          </div>
          
          <div style={styles.footerBottom}>
            <p>© {currentYear} Micro-Loan Connect — All rights reserved.</p>
            <div style={styles.footerBottomLinks}>
              <a href="#" style={styles.bottomLink}>Sitemap</a>
              <a href="#" style={styles.bottomLink}>Accessibility</a>
              <a href="#" style={styles.bottomLink}>Privacy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ============================================
// Styles Object - Modern CSS without Tailwind
// ============================================

const styles = {
  // Page Container
  pageContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%)",
    position: "relative",
    overflowX: "hidden",
  },

  // Animated Background Elements
  bgOrb1: {
    position: "absolute",
    top: "-20%",
    right: "-10%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(44,122,123,0.08) 0%, rgba(44,122,123,0) 70%)",
    borderRadius: "50%",
    animation: "float 20s ease-in-out infinite",
    pointerEvents: "none",
  },
  bgOrb2: {
    position: "absolute",
    bottom: "-15%",
    left: "-5%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0) 70%)",
    borderRadius: "50%",
    animation: "float 25s ease-in-out infinite reverse",
    pointerEvents: "none",
  },
  bgGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `linear-gradient(rgba(44,122,123,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(44,122,123,0.03) 1px, transparent 1px)`,
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },

  // Main Container
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "20px 32px 0",
    position: "relative",
    zIndex: 2,
  },

  // Hero Section
  hero: {
    display: "flex",
    flexWrap: "wrap",
    gap: "48px",
    alignItems: "center",
    marginBottom: "80px",
  },
  heroContent: {
    flex: "1.2",
    minWidth: "280px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(44,122,123,0.1)",
    padding: "6px 16px",
    borderRadius: "40px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#2c7a7b",
    marginBottom: "24px",
  },
  heroTitle: {
    fontSize: "48px",
    fontWeight: "800",
    lineHeight: "1.2",
    marginBottom: "20px",
    color: "#0f172a",
  },
  gradientText: {
    background: "linear-gradient(135deg, #2c7a7b 0%, #3b82f6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroDesc: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#475569",
    marginBottom: "32px",
    maxWidth: "550px",
  },
  heroButtons: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "40px",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #2c7a7b 0%, #1f5e5f 100%)",
    border: "none",
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
    borderRadius: "60px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 8px 20px rgba(44,122,123,0.25)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  btnSecondary: {
    background: "white",
    border: "1px solid #cbd5e1",
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
    cursor: "pointer",
    borderRadius: "60px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  heroStats: {
    display: "flex",
    gap: "32px",
    flexWrap: "wrap",
  },
  heroStatNumber: {
    display: "block",
    fontSize: "24px",
    fontWeight: "800",
    color: "#2c7a7b",
  },
  heroStatLabel: {
    fontSize: "13px",
    color: "#64748b",
  },
  heroVisual: {
    flex: "1",
    minWidth: "280px",
    display: "flex",
    justifyContent: "center",
  },
  floatingCard: {
    background: "white",
    borderRadius: "32px",
    padding: "32px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
    textAlign: "center",
    animation: "float 5s ease-in-out infinite",
  },
  floatingIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "20px",
  },
  floatingChart: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  chartBar: {
    width: "40px",
    height: "60px",
    background: "linear-gradient(180deg, #2c7a7b 0%, #5fbcb0 100%)",
    borderRadius: "12px 12px 6px 6px",
    animation: "barRise 1.5s ease-out",
  },
  floatingText: {
    fontSize: "14px",
    color: "#475569",
    fontWeight: "500",
  },

  // Roles Section
  rolesSection: {
    marginBottom: "80px",
  },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "16px",
    color: "#0f172a",
  },
  sectionSubtitle: {
    fontSize: "16px",
    textAlign: "center",
    color: "#64748b",
    maxWidth: "600px",
    margin: "0 auto 48px",
  },
  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "32px",
    justifyContent: "center",
  },
  roleCard: {
    flex: "1",
    minWidth: "260px",
    maxWidth: "340px",
    background: "white",
    borderRadius: "28px",
    padding: "32px 24px",
    textAlign: "center",
    boxShadow: "0 10px 30px -12px rgba(0,0,0,0.08)",
    transition: "all 0.3s cubic-bezier(0.2,0.9,0.4,1.1)",
    cursor: "pointer",
  },
  cardIcon: {
    fontSize: "48px",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#0f172a",
  },
  cardDesc: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#475569",
    marginBottom: "20px",
  },
  cardLink: {
    background: "none",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c7a7b",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    transition: "gap 0.2s",
  },
  arrowIcon: {
    transition: "transform 0.2s",
  },

  // Stats Section
  statsSection: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "24px",
    background: "linear-gradient(135deg, #1f3e3c 0%, #1c5c5a 100%)",
    borderRadius: "40px",
    padding: "48px 40px",
    marginBottom: "80px",
    textAlign: "center",
  },
  statCard: {
    flex: "1",
    minWidth: "140px",
  },
  statNumber: {
    fontSize: "36px",
    fontWeight: "800",
    color: "white",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.75)",
  },

  // Info Section
  infoSection: {
    display: "flex",
    flexWrap: "wrap",
    gap: "32px",
    marginBottom: "80px",
  },
  infoCard: {
    flex: "1",
    background: "white",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0",
    transition: "transform 0.2s",
  },
  infoIcon: {
    fontSize: "36px",
    marginBottom: "16px",
  },
  infoTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#0f172a",
  },
  infoText: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#475569",
  },

  // SDG Section
  sdgSection: {
    background: "rgba(44,122,123,0.05)",
    borderRadius: "32px",
    padding: "48px 32px",
    textAlign: "center",
    marginBottom: "60px",
  },
  sdgIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  sdgTitle: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#0f172a",
  },
  sdgText: {
    fontSize: "15px",
    lineHeight: "1.6",
    color: "#475569",
    maxWidth: "700px",
    margin: "0 auto 24px",
  },
  sdgButton: {
    background: "linear-gradient(135deg, #2c7a7b 0%, #1f5e5f 100%)",
    border: "none",
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
    borderRadius: "60px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },

  // Footer
  footer: {
    background: "#0f172a",
    color: "#94a3b8",
    marginTop: "60px",
    padding: "48px 0 24px",
    borderRadius: "32px 32px 0 0",
  },
  footerContent: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "32px",
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 32px 40px",
    borderBottom: "1px solid #1e293b",
  },
  footerSection: {
    textAlign: "left",
  },
  footerLogo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  footerLogoIcon: {
    fontSize: "28px",
  },
  footerLogoText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "white",
  },
  footerDescription: {
    fontSize: "13px",
    lineHeight: "1.6",
    marginBottom: "20px",
    color: "#94a3b8",
  },
  socialLinks: {
    display: "flex",
    gap: "12px",
  },
  socialLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    background: "#1e293b",
    borderRadius: "50%",
    fontSize: "18px",
    textDecoration: "none",
    transition: "background 0.2s",
    color: "#94a3b8",
  },
  footerHeading: {
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    marginBottom: "20px",
  },
  footerList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  footerLink: {
    display: "block",
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "13px",
    marginBottom: "12px",
    transition: "color 0.2s",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  contactInfo: {
    display: "block",
    fontSize: "13px",
    marginBottom: "12px",
    color: "#94a3b8",
  },
  footerBottom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "24px 32px 0",
    fontSize: "12px",
  },
  footerBottomLinks: {
    display: "flex",
    gap: "24px",
  },
  bottomLink: {
    color: "#94a3b8",
    textDecoration: "none",
    transition: "color 0.2s",
  },
};

// Inject global CSS animations
const globalStyles = document.createElement("style");
globalStyles.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  
  @keyframes barRise {
    from { height: 0px; opacity: 0; }
    to { height: 60px; opacity: 1; }
  }
  
  .role-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px -12px rgba(44,122,123,0.2);
  }
  
  .info-card:hover {
    transform: translateY(-5px);
  }
  
  button:hover {
    transform: translateY(-2px);
  }
  
  .card-link:hover .arrow-icon {
    transform: translateX(4px);
  }
  
  .social-link:hover {
    background: #2c7a7b;
    color: white;
  }
  
  .footer-link:hover {
    color: #2c7a7b;
  }
  
  .bottom-link:hover {
    color: #2c7a7b;
  }
`;
document.head.appendChild(globalStyles);