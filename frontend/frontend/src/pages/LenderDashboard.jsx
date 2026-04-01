import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function LenderDashboard() {
 const [loans, setLoans] = useState([]);
 const [transactions, setTransactions] = useState([]);
 const [category, setCategory] = useState("");
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
   if (!category) return loans;
   return loans.filter((loan) => loan.businessCategory === category);
 }, [loans, category]);

 return (
   <div style={styles.page}>
     <h1>Lender Dashboard</h1>
     <p style={styles.sub}>
       Browse approved loan requests, review impact plans, and move quickly to funding.
     </p>

     {error && <div style={styles.error}>{error}</div>}

     <div style={styles.statsRow}>
       <div style={styles.statCard}>
         <h3>Approved Loans</h3>
         <p style={styles.big}>{loans.length}</p>
       </div>
       <div style={styles.statCard}>
         <h3>My Transactions</h3>
         <p style={styles.big}>{transactions.length}</p>
       </div>
     </div>

     <div style={styles.card}>
       <div style={styles.toolbar}>
         <h2 style={{ margin: 0 }}>Browse Loans</h2>

         <select
           style={styles.select}
           value={category}
           onChange={(e) => setCategory(e.target.value)}
         >
           <option value="">All categories</option>
           {categories.map((item) => (
             <option key={item} value={item}>
               {item}
             </option>
           ))}
         </select>
       </div>

       {loading ? (
         <p>Loading approved loans...</p>
       ) : filteredLoans.length === 0 ? (
         <p>No approved loans found.</p>
       ) : (
         <div style={styles.loanGrid}>
           {filteredLoans.map((loan) => {
             const remaining =
               Number(loan.amount || 0) - Number(loan.fundedAmount || 0);

             return (
               <div key={loan._id} style={styles.loanCard}>
                 <div style={styles.rowBetween}>
                   <strong>{loan.title}</strong>
                   <span style={styles.badge}>{loan.status}</span>
                 </div>

                 <p><strong>Purpose:</strong> {loan.purpose}</p>
                 <p><strong>Category:</strong> {loan.businessCategory}</p>
                 <p><strong>Amount:</strong> {loan.amount} {loan.currency}</p>
                 <p><strong>Already Funded:</strong> {loan.fundedAmount || 0}</p>
                 <p><strong>Remaining Needed:</strong> {remaining}</p>
                 <p><strong>Impact Plan:</strong> {loan.povertyImpactPlanSnapshot}</p>

                 <div style={styles.btnRow}>
                   <Link to={`/transactions?loanId=${loan._id}`} style={styles.linkBtn}>
                     Fund This Loan
                   </Link>
                 </div>
               </div>
             );
           })}
         </div>
       )}
     </div>
   </div>
 );
}

const styles = {
 page: {
   padding: "24px",
   maxWidth: "1200px",
   margin: "0 auto"
 },
 sub: {
   color: "#6b7280",
   marginBottom: "20px"
 },
 statsRow: {
   display: "grid",
   gridTemplateColumns: "1fr 1fr",
   gap: "16px",
   marginBottom: "20px"
 },
 statCard: {
   background: "#fff",
   borderRadius: "12px",
   padding: "20px",
   boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
 },
 big: {
   fontSize: "32px",
   fontWeight: "bold",
   margin: 0
 },
 card: {
   background: "#fff",
   borderRadius: "12px",
   padding: "20px",
   boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
 },
 toolbar: {
   display: "flex",
   justifyContent: "space-between",
   alignItems: "center",
   gap: "12px",
   marginBottom: "16px"
 },
 select: {
   padding: "10px",
   borderRadius: "8px",
   border: "1px solid #d1d5db"
 },
 loanGrid: {
   display: "grid",
   gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
   gap: "16px"
 },
 loanCard: {
   border: "1px solid #e5e7eb",
   borderRadius: "10px",
   padding: "16px"
 },
 rowBetween: {
   display: "flex",
   justifyContent: "space-between",
   alignItems: "center",
   gap: "10px"
 },
 badge: {
   border: "1px solid #2563eb",
   color: "#2563eb",
   borderRadius: "999px",
   padding: "4px 10px",
   fontSize: "12px",
   fontWeight: "600"
 },
 btnRow: {
   display: "flex",
   gap: "10px",
   marginTop: "12px"
 },
 linkBtn: {
   textDecoration: "none",
   background: "#2563eb",
   color: "#fff",
   padding: "10px 14px",
   borderRadius: "8px",
   fontWeight: "600"
 },
 error: {
   background: "#fee2e2",
   color: "#b91c1c",
   padding: "10px 12px",
   borderRadius: "8px",
   marginBottom: "16px"
 }
};
