import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navStyle = {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid #ddd",
    background: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 100,
  };

  const leftStyle = {
    display: "flex",
    gap: "28px",
    alignItems: "center",
  };

  const rightStyle = {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  };

  return (
    <nav style={navStyle}>
      <div style={leftStyle}>
        <Link to="/" style={{ fontWeight: "bold", fontSize: "20px", textDecoration: "none" }}>
          LoanPlatform
        </Link>

        <Link to="/" style={{ textDecoration: "none", color: "#111" }}>
          Home
        </Link>

        {user?.role === "BORROWER" && (
          <>
            <Link to="/borrower/dashboard" style={{ textDecoration: "none", color: "#111" }}>
              Borrower Dashboard
            </Link>
            <Link to="/borrower/profile" style={{ textDecoration: "none", color: "#111" }}>
              Borrower Profile
            </Link>
            <Link to="/repayments" style={{ textDecoration: "none", color: "#111" }}>
              Repayments
            </Link>
          </>
        )}

        {user?.role === "LENDER" && (
          <>
            <Link to="/lender/dashboard" style={{ textDecoration: "none", color: "#111" }}>
              Lender Dashboard
            </Link>
            <Link to="/transactions" style={{ textDecoration: "none", color: "#111" }}>
              Transactions
            </Link>
            <Link to="/fx" style={{ textDecoration: "none", color: "#111" }}>
              FX Converter
            </Link>
          </>
        )}

        {user?.role === "ADMIN" && (
          <>
            <Link to="/admin/dashboard" style={{ textDecoration: "none", color: "#111" }}>
              Admin Dashboard
            </Link>
            <Link to="/admin/analytics" style={{ textDecoration: "none", color: "#111" }}>
              Analytics
            </Link>
          </>
        )}
      </div>

      <div style={rightStyle}>
        {!user ? (
          <>
            <Link to="/login" style={{ textDecoration: "none", color: "#111" }}>
              Login
            </Link>
            <Link to="/register" style={{ textDecoration: "none", color: "#111" }}>
              Register
            </Link>
          </>
        ) : (
          <>
            <span
              style={{
                background: "#f3f4f6",
                padding: "8px 12px",
                borderRadius: "20px",
                fontSize: "14px",
              }}
            >
              {user.role} | {user.email}
            </span>
            <button onClick={handleLogout} style={{ padding: "8px 16px", cursor: "pointer" }}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}