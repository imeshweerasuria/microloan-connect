import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const linkStyle = {
  textDecoration: "none",
  color: "#4b5563",
  fontWeight: "500",
  fontSize: "14px",
  transition: "color 0.2s",
  padding: "8px 4px",
};

const activeLinkStyle = {
  ...linkStyle,
  color: "#3b82f6",
  borderBottom: "2px solid #3b82f6",
};

function roleHome(role) {
  if (role === "BORROWER") return "/borrower/dashboard";
  if (role === "LENDER") return "/lender/dashboard";
  if (role === "ADMIN") return "/admin/dashboard";
  return "/";
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getCurrentPath = () => window.location.pathname;

  const isActive = (path) => getCurrentPath() === path;

  return (
    <>
      <nav
        style={{
          background: "white",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Logo Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🏦
            </div>
            <Link
              to={user ? roleHome(user.role) : "/"}
              style={{
                textDecoration: "none",
                fontWeight: "800",
                fontSize: "20px",
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Micro-Loan Connect
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/"
              style={isActive("/") ? activeLinkStyle : linkStyle}
              onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
              onMouseLeave={(e) => (e.target.style.color = isActive("/") ? "#3b82f6" : "#4b5563")}
            >
              🏠 Home
            </Link>

            {user?.role === "BORROWER" && (
              <>
                <Link
                  to="/borrower/dashboard"
                  style={isActive("/borrower/dashboard") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/borrower/dashboard") ? "#3b82f6" : "#4b5563")}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/borrower/profile"
                  style={isActive("/borrower/profile") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/borrower/profile") ? "#3b82f6" : "#4b5563")}
                >
                  👤 Profile
                </Link>
                <Link
                  to="/repayments"
                  style={isActive("/repayments") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/repayments") ? "#3b82f6" : "#4b5563")}
                >
                  📅 Repayments
                </Link>
              </>
            )}

            {user?.role === "LENDER" && (
              <>
                <Link
                  to="/lender/dashboard"
                  style={isActive("/lender/dashboard") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/lender/dashboard") ? "#3b82f6" : "#4b5563")}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/transactions"
                  style={isActive("/transactions") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/transactions") ? "#3b82f6" : "#4b5563")}
                >
                  📜 Transactions
                </Link>
                <Link
                  to="/fx"
                  style={isActive("/fx") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/fx") ? "#3b82f6" : "#4b5563")}
                >
                  💱 FX Converter
                </Link>
              </>
            )}

            {user?.role === "ADMIN" && (
              <>
                <Link
                  to="/admin/dashboard"
                  style={isActive("/admin/dashboard") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/admin/dashboard") ? "#3b82f6" : "#4b5563")}
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/admin/analytics"
                  style={isActive("/admin/analytics") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/admin/analytics") ? "#3b82f6" : "#4b5563")}
                >
                  📈 Analytics
                </Link>
                <Link
                  to="/repayments"
                  style={isActive("/repayments") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/repayments") ? "#3b82f6" : "#4b5563")}
                >
                  📅 Repayments
                </Link>
                <Link
                  to="/transactions"
                  style={isActive("/transactions") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/transactions") ? "#3b82f6" : "#4b5563")}
                >
                  📜 Transactions
                </Link>
                <Link
                  to="/fx"
                  style={isActive("/fx") ? activeLinkStyle : linkStyle}
                  onMouseEnter={(e) => (e.target.style.color = "#3b82f6")}
                  onMouseLeave={(e) => (e.target.style.color = isActive("/fx") ? "#3b82f6" : "#4b5563")}
                >
                  💱 FX Converter
                </Link>
              </>
            )}
          </div>

          {/* User Section */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            {!user ? (
              <>
                <Link
                  to="/login"
                  style={{
                    padding: "8px 16px",
                    textDecoration: "none",
                    color: "#3b82f6",
                    fontWeight: "600",
                    fontSize: "14px",
                    borderRadius: "8px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#eff6ff")}
                  onMouseLeave={(e) => (e.target.style.background = "transparent")}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                    color: "white",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "14px",
                    borderRadius: "8px",
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#f3f4f6",
                    padding: "6px 12px",
                    borderRadius: "40px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      color: "white",
                    }}
                  >
                    {user.role === "BORROWER" && "👤"}
                    {user.role === "LENDER" && "💰"}
                    {user.role === "ADMIN" && "⚙️"}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                    <div>{user.name || user.email?.split("@")[0]}</div>
                    <div style={{ fontSize: "10px", color: "#2563eb", fontWeight: "600" }}>
                      {user.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    borderRadius: "8px",
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "background 0.2s, transform 0.1s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#dc2626")}
                  onMouseLeave={(e) => (e.target.style.background = "#ef4444")}
                  onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
                  onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "8px",
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Financial Inclusion Banner */}
        <div
          style={{
            background: "linear-gradient(90deg, #eff6ff 0%, #dbeafe 100%)",
            padding: "6px 16px",
            textAlign: "center",
            fontSize: "11px",
            fontWeight: "500",
            color: "#1e40af",
            borderTop: "1px solid #bfdbfe",
          }}
        >
          🏦 Financial Inclusion Platform | Empowering Communities Through Accessible Credit
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "73px",
            left: 0,
            right: 0,
            background: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "16px",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
          className="mobile-menu"
        >
          <Link to="/" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
            🏠 Home
          </Link>

          {user?.role === "BORROWER" && (
            <>
              <Link to="/borrower/dashboard" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/borrower/profile" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                👤 Profile
              </Link>
              <Link to="/repayments" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                📅 Repayments
              </Link>
            </>
          )}

          {user?.role === "LENDER" && (
            <>
              <Link to="/lender/dashboard" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/transactions" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                📜 Transactions
              </Link>
              <Link to="/fx" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                💱 FX Converter
              </Link>
            </>
          )}

          {user?.role === "ADMIN" && (
            <>
              <Link to="/admin/dashboard" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/admin/analytics" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                📈 Analytics
              </Link>
              <Link to="/repayments" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                📅 Repayments
              </Link>
              <Link to="/transactions" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                📜 Transactions
              </Link>
              <Link to="/fx" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                💱 FX Converter
              </Link>
            </>
          )}

          {!user && (
            <>
              <Link to="/login" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" style={linkStyle} onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: block !important;
          }
          nav > div:first-child > div:nth-child(2) {
            display: none !important;
          }
          .mobile-menu {
            display: flex !important;
          }
        }
        @media (min-width: 1025px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}