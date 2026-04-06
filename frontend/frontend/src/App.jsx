import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import BorrowerDashboard from "./pages/BorrowerDashboard";
import BorrowerProfile from "./pages/BorrowerProfile";
import LenderDashboard from "./pages/LenderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Repayments from "./pages/Repayments";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import FxConverter from "./pages/FxConverter";

function Home() {
 return (
   <div style={{ padding: "32px", maxWidth: "1100px", margin: "0 auto" }}>
     <div
       style={{
         background: "#fff",
         borderRadius: "16px",
         padding: "32px",
         boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
         marginBottom: "24px",
       }}
     >
       <h1 style={{ marginTop: 0 }}>Micro-Loan Connect</h1>
       <p style={{ color: "#4b5563", fontSize: "16px" }}>
         A peer-to-peer microloan platform for underserved communities, focused on
         financial inclusion and SDG 1 - No Poverty.
       </p>

       <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
         <Link to="/register" style={btnPrimary}>Get Started</Link>
         <Link to="/login" style={btnSecondary}>Login</Link>
       </div>
     </div>

     <div style={grid}>
       <div style={card}>
         <h3>Borrowers</h3>
         <p>Create a profile, submit loan requests, and manage repayments.</p>
       </div>
       <div style={card}>
         <h3>Lenders</h3>
         <p>Browse approved loans, fund requests, and track transactions.</p>
       </div>
       <div style={card}>
         <h3>Admins</h3>
         <p>Review loans, monitor analytics, and manage repayment schedules.</p>
       </div>
     </div>
   </div>
 );
}

function NotFound() {
 return (
   <div style={{ padding: "32px", textAlign: "center" }}>
     <h2>Page not found</h2>
     <Link to="/">Go back home</Link>
   </div>
 );
}

const grid = {
 display: "grid",
 gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
 gap: "18px",
};

const card = {
 background: "#fff",
 borderRadius: "14px",
 padding: "24px",
 boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
};

const btnPrimary = {
 textDecoration: "none",
 background: "#2563eb",
 color: "#fff",
 padding: "10px 16px",
 borderRadius: "8px",
 fontWeight: "600",
};

const btnSecondary = {
 textDecoration: "none",
 background: "#fff",
 color: "#111827",
 padding: "10px 16px",
 borderRadius: "8px",
 border: "1px solid #d1d5db",
 fontWeight: "600",
};

export default function App() {
 return (
   <BrowserRouter>
     <Navbar />
     <Routes>
       <Route path="/" element={<Navigate to="/login" replace />} />

       <Route path="/login" element={<Login />} />
       <Route path="/register" element={<Register />} />

       <Route
         path="/borrower/dashboard"
         element={
           <ProtectedRoute roles={["BORROWER"]}>
             <BorrowerDashboard />
           </ProtectedRoute>
         }
       />

       <Route
         path="/borrower/profile"
         element={
           <ProtectedRoute roles={["BORROWER"]}>
             <BorrowerProfile />
           </ProtectedRoute>
         }
       />

       <Route
         path="/lender/dashboard"
         element={
           <ProtectedRoute roles={["LENDER"]}>
             <LenderDashboard />
           </ProtectedRoute>
         }
       />

       <Route
         path="/transactions"
         element={
           <ProtectedRoute roles={["LENDER", "ADMIN"]}>
             <Transactions />
           </ProtectedRoute>
         }
       />

       <Route
         path="/fx"
         element={
           <ProtectedRoute roles={["LENDER", "ADMIN"]}>
             <FxConverter />
           </ProtectedRoute>
         }
       />

       <Route
         path="/repayments"
         element={
           <ProtectedRoute roles={["BORROWER", "ADMIN"]}>
             <Repayments />
           </ProtectedRoute>
         }
       />

       <Route
         path="/admin/dashboard"
         element={
           <ProtectedRoute roles={["ADMIN"]}>
             <AdminDashboard />
           </ProtectedRoute>
         }
       />

       <Route
         path="/admin/analytics"
         element={
           <ProtectedRoute roles={["ADMIN"]}>
             <Analytics />
           </ProtectedRoute>
         }
       />

       <Route path="*" element={<NotFound />} />
     </Routes>
   </BrowserRouter>
 );
}
