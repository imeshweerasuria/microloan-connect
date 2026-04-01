import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Transactions() {
 const { user } = useAuth();

 const [transactions, setTransactions] = useState([]);
 const [loans, setLoans] = useState([]);
 const [selectedLoanId, setSelectedLoanId] = useState("");
 const [amount, setAmount] = useState("");
 const [currency, setCurrency] = useState("LKR");
 const [note, setNote] = useState("");
 const [loading, setLoading] = useState(true);
 const [funding, setFunding] = useState(false);
 const [message, setMessage] = useState("");
 const [error, setError] = useState("");

 const fetchTransactions = async () => {
   try {
     const res = await client.get("/transactions/me");
     setTransactions(res.data || []);
   } catch (err) {
     setError(err.message || "Failed to load transactions");
   }
 };

 const fetchLoans = async () => {
   try {
     const res = await client.get("/loans?status=APPROVED");
     setLoans(res.data || []);
   } catch (err) {
     setError(err.message || "Failed to load approved loans");
   }
 };

 useEffect(() => {
   const load = async () => {
     try {
       setLoading(true);
       await Promise.all([fetchTransactions(), fetchLoans()]);
     } finally {
       setLoading(false);
     }
   };
   load();
 }, []);

 const selectedLoan = loans.find((l) => l._id === selectedLoanId);

 const handleCreateFunding = async (e) => {
   e.preventDefault();
   if (!selectedLoan) {
     setError("Please select a loan");
     return;
   }

   try {
     setFunding(true);
     setError("");
     setMessage("");

     await client.post("/transactions", {
       type: "FUNDING",
       loanId: selectedLoan._id,
       fromUserId: user.id,
       toUserId: selectedLoan.borrowerId,
       amount: Number(amount),
       currency,
       note,
     });

     setMessage("✅ Funding transaction created successfully");
     setAmount("");
     setNote("");
     setSelectedLoanId("");

     await Promise.all([fetchTransactions(), fetchLoans()]);
   } catch (err) {
     setError(err.message || "Failed to create transaction");
   } finally {
     setFunding(false);
   }
 };

 return (
   <div style={styles.page}>
     <h1>Transactions Ledger</h1>
     <p style={styles.sub}>
       Fund approved loans and track all your transaction records.
     </p>

     {message && <div style={styles.success}>{message}</div>}
     {error && <div style={styles.error}>{error}</div>}

     <div style={styles.grid}>
       <div style={styles.card}>
         <h2>Create Funding Transaction</h2>

         <form onSubmit={handleCreateFunding}>
           <label style={styles.label}>Select Approved Loan</label>
           <select
             style={styles.input}
             value={selectedLoanId}
             onChange={(e) => setSelectedLoanId(e.target.value)}
             required
           >
             <option value="">-- Select Loan --</option>
             {loans.map((loan) => (
               <option key={loan._id} value={loan._id}>
                 {loan.title} | {loan.amount} {loan.currency} | funded: {loan.fundedAmount || 0}
               </option>
             ))}
           </select>

           {selectedLoan && (
             <div style={styles.loanInfo}>
               <p><strong>Borrower ID:</strong> {selectedLoan.borrowerId}</p>
               <p><strong>Category:</strong> {selectedLoan.businessCategory}</p>
               <p><strong>Poverty Impact:</strong> {selectedLoan.povertyImpactPlanSnapshot}</p>
             </div>
           )}

           <label style={styles.label}>Amount</label>
           <input
             style={styles.input}
             type="number"
             value={amount}
             onChange={(e) => setAmount(e.target.value)}
             required
           />

           <label style={styles.label}>Currency</label>
           <input
             style={styles.input}
             value={currency}
             onChange={(e) => setCurrency(e.target.value)}
             required
           />

           <label style={styles.label}>Note</label>
           <textarea
             style={styles.textarea}
             value={note}
             onChange={(e) => setNote(e.target.value)}
             placeholder="Optional note"
           />

           <button type="submit" style={styles.primaryBtn} disabled={funding}>
             {funding ? "Processing..." : "Create Funding"}
           </button>
         </form>
       </div>

       <div style={styles.card}>
         <h2>My Transactions</h2>

         {loading ? (
           <p>Loading transactions...</p>
         ) : transactions.length === 0 ? (
           <p>No transactions found.</p>
         ) : (
           <div style={{ display: "grid", gap: "12px" }}>
             {transactions.map((tx) => (
               <div key={tx._id} style={styles.txCard}>
                 <div style={styles.row}>
                   <strong>{tx.type}</strong>
                   <span style={styles.badge}>{tx.status}</span>
                 </div>

                 <p><strong>Loan ID:</strong> {tx.loanId}</p>
                 <p><strong>Amount:</strong> {tx.amount} {tx.currency}</p>

                 {tx.amountConverted && (
                   <p>
                     <strong>Converted:</strong> {tx.amountConverted} {tx.convertedCurrency}
                   </p>
                 )}

                 {tx.fxRate && (
                   <p><strong>FX Rate:</strong> {tx.fxRate}</p>
                 )}

                 {tx.note && <p><strong>Note:</strong> {tx.note}</p>}

                 <p style={styles.smallText}>
                   Created: {new Date(tx.createdAt).toLocaleString()}
                 </p>
               </div>
             ))}
           </div>
         )}
       </div>
     </div>
   </div>
 );
}

const styles = {
 page: {
   padding: "24px",
   maxWidth: "1200px",
   margin: "0 auto",
 },
 sub: {
   color: "#6b7280",
   marginBottom: "20px",
 },
 grid: {
   display: "grid",
   gridTemplateColumns: "1fr 1fr",
   gap: "20px",
 },
 card: {
   background: "#fff",
   padding: "20px",
   borderRadius: "12px",
   boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
 },
 label: {
   display: "block",
   fontWeight: "600",
   marginTop: "12px",
   marginBottom: "6px",
 },
 input: {
   width: "100%",
   padding: "10px",
   borderRadius: "8px",
   border: "1px solid #d1d5db",
   boxSizing: "border-box",
 },
 textarea: {
   width: "100%",
   minHeight: "80px",
   padding: "10px",
   borderRadius: "8px",
   border: "1px solid #d1d5db",
   boxSizing: "border-box",
 },
 primaryBtn: {
   marginTop: "16px",
   padding: "10px 16px",
   borderRadius: "8px",
   border: "none",
   background: "#2563eb",
   color: "#fff",
   cursor: "pointer",
 },
 success: {
   background: "#dcfce7",
   color: "#166534",
   padding: "10px 12px",
   borderRadius: "8px",
   marginBottom: "16px",
 },
 error: {
   background: "#fee2e2",
   color: "#b91c1c",
   padding: "10px 12px",
   borderRadius: "8px",
   marginBottom: "16px",
 },
 loanInfo: {
   background: "#f9fafb",
   border: "1px solid #e5e7eb",
   borderRadius: "10px",
   padding: "10px 12px",
   marginTop: "12px",
 },
 txCard: {
   border: "1px solid #e5e7eb",
   borderRadius: "10px",
   padding: "12px",
 },
 row: {
   display: "flex",
   justifyContent: "space-between",
   alignItems: "center",
 },
 badge: {
   padding: "4px 10px",
   borderRadius: "999px",
   border: "1px solid #2563eb",
   color: "#2563eb",
   fontSize: "12px",
   fontWeight: "600",
 },
 smallText: {
   fontSize: "12px",
   color: "#6b7280",
 },
};
