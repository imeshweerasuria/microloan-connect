import { useEffect, useState } from "react";
import client from "../api/client";

export default function Analytics() {
 const [summary, setSummary] = useState({
   totalFunding: 0,
   totalRepayment: 0,
   totalTransactions: 0
 });
 const [loans, setLoans] = useState([]);
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(true);

 const fetchAnalytics = async () => {
   try {
     setLoading(true);
     setError("");

     const [summaryRes, allLoansRes] = await Promise.all([
       client.get("/transactions/summary/analytics"),
       client.get("/loans")
     ]);

     setSummary(summaryRes.data);
     setLoans(allLoansRes.data || []);
   } catch (err) {
     setError(err.message || "Failed to load analytics");
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   fetchAnalytics();
 }, []);

 const categoryCounts = loans.reduce((acc, loan) => {
   const key = loan.businessCategory || "Other";
   acc[key] = (acc[key] || 0) + 1;
   return acc;
 }, {});

 return (
   <div style={styles.page}>
     <h1>Analytics Dashboard</h1>
     <p style={styles.sub}>
       Platform insights and SDG 1 (No Poverty) evidence.
     </p>

     {error && <div style={styles.error}>{error}</div>}

     {loading ? (
       <p>Loading analytics...</p>
     ) : (
       <>
         <div style={styles.grid}>
           <div style={styles.card}>
             <h3>Total Funded Amount</h3>
             <p style={styles.big}>LKR {summary.totalFunding}</p>
           </div>

           <div style={styles.card}>
             <h3>Total Repaid Amount</h3>
             <p style={styles.big}>LKR {summary.totalRepayment}</p>
           </div>

           <div style={styles.card}>
             <h3>Total Transactions</h3>
             <p style={styles.big}>{summary.totalTransactions}</p>
           </div>

           <div style={styles.card}>
             <h3>Tracked Loans</h3>
             <p style={styles.big}>{loans.length}</p>
           </div>
         </div>

         <div style={styles.card}>
           <h2>Loan Categories (Poverty Impact Areas)</h2>

           {Object.keys(categoryCounts).length === 0 ? (
             <p>No category data yet.</p>
           ) : (
             <ul>
               {Object.entries(categoryCounts).map(([category, count]) => (
                 <li key={category}>
                   <strong>{category}</strong>: {count}
                 </li>
               ))}
             </ul>
           )}
         </div>

         <div style={styles.card}>
           <h2>SDG 1 - No Poverty Justification</h2>
           <p>
             This platform supports financial inclusion by enabling underserved borrowers
             to request loans, receive peer funding, and repay through structured installments.
             The tracked business categories and impact plans demonstrate how loans contribute
             to poverty reduction, income generation, education, healthcare, and community upliftment.
           </p>
         </div>
       </>
     )}
   </div>
 );
}

const styles = {
 page: {
   padding: "24px",
   maxWidth: "1100px",
   margin: "0 auto"
 },
 sub: {
   color: "#6b7280",
   marginBottom: "20px"
 },
 grid: {
   display: "grid",
   gridTemplateColumns: "repeat(4, 1fr)",
   gap: "16px",
   marginBottom: "20px"
 },
 card: {
   background: "#fff",
   borderRadius: "12px",
   padding: "20px",
   boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
   marginBottom: "20px"
 },
 big: {
   fontSize: "28px",
   fontWeight: "bold",
   margin: 0
 },
 error: {
   background: "#fee2e2",
   color: "#b91c1c",
   padding: "10px 12px",
   borderRadius: "8px",
   marginBottom: "16px"
 }
};
