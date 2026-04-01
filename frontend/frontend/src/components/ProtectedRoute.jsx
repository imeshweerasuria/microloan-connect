import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function roleHome(role) {
 if (role === "BORROWER") return "/borrower/dashboard";
 if (role === "LENDER") return "/lender/dashboard";
 if (role === "ADMIN") return "/admin/dashboard";
 return "/";
}

export default function ProtectedRoute({ children, roles = [] }) {
 const { user, loading } = useAuth();
 const location = useLocation();

 if (loading) {
   return (
     <div style={{ padding: "32px", textAlign: "center" }}>
       Loading your session...
     </div>
   );
 }

 if (!user) {
   return <Navigate to="/login" replace state={{ from: location.pathname }} />;
 }

 if (roles.length > 0 && !roles.includes(user.role)) {
   return <Navigate to={roleHome(user.role)} replace />;
 }

 return children;
}
