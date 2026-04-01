import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkStyle = {
 textDecoration: "none",
 color: "#111827",
 fontWeight: "500",
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

 const handleLogout = () => {
   logout();
   navigate("/login");
 };

 return (
   <nav
     style={{
       display: "flex",
       gap: "20px",
       alignItems: "center",
       justifyContent: "space-between",
       padding: "16px 24px",
       borderBottom: "1px solid #e5e7eb",
       background: "#ffffff",
       position: "sticky",
       top: 0,
       zIndex: 100,
     }}
   >
     <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
       <Link
         to={user ? roleHome(user.role) : "/"}
         style={{ textDecoration: "none", fontWeight: "700", fontSize: "20px", color: "#111827" }}
       >
         Micro-Loan Connect
       </Link>

       <Link to="/" style={linkStyle}>Home</Link>

       {user?.role === "BORROWER" && (
         <>
           <Link to="/borrower/dashboard" style={linkStyle}>Borrower Dashboard</Link>
           <Link to="/borrower/profile" style={linkStyle}>Borrower Profile</Link>
           <Link to="/repayments" style={linkStyle}>Repayments</Link>
         </>
       )}

       {user?.role === "LENDER" && (
         <>
           <Link to="/lender/dashboard" style={linkStyle}>Lender Dashboard</Link>
           <Link to="/transactions" style={linkStyle}>Transactions</Link>
           <Link to="/fx" style={linkStyle}>FX Converter</Link>
         </>
       )}

       {user?.role === "ADMIN" && (
         <>
           <Link to="/admin/dashboard" style={linkStyle}>Admin Dashboard</Link>
           <Link to="/admin/analytics" style={linkStyle}>Analytics</Link>
           <Link to="/repayments" style={linkStyle}>Repayments</Link>
           <Link to="/transactions" style={linkStyle}>Transactions</Link>
           <Link to="/fx" style={linkStyle}>FX Converter</Link>
         </>
       )}
     </div>

     <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
       {!user ? (
         <>
           <Link to="/login" style={linkStyle}>Login</Link>
           <Link to="/register" style={linkStyle}>Register</Link>
         </>
       ) : (
         <>
           <span
             style={{
               background: "#f3f4f6",
               padding: "8px 12px",
               borderRadius: "999px",
               fontSize: "14px",
               color: "#374151",
             }}
           >
             {user.role} | {user.email}
           </span>
           <button
             onClick={handleLogout}
             style={{
               padding: "8px 16px",
               cursor: "pointer",
               borderRadius: "8px",
               border: "none",
               background: "#111827",
               color: "#fff",
             }}
           >
             Logout
           </button>
         </>
       )}
     </div>
   </nav>
 );
}
