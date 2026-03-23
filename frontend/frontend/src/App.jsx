import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    <div style={{ padding: "32px" }}>
      <h1>Micro-Loan Connect</h1>
      <p>Peer-to-peer microloan platform for underserved communities and financial inclusion.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

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
      </Routes>
    </BrowserRouter>
  );
}