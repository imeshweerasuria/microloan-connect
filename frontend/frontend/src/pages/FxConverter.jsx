import { useState } from "react";
import client from "../api/client";

export default function FxConverter() {
 const [amount, setAmount] = useState("");
 const [from, setFrom] = useState("LKR");
 const [to, setTo] = useState("USD");
 const [result, setResult] = useState(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const handleConvert = async (e) => {
   e.preventDefault();
   setError("");
   setResult(null);

   try {
     setLoading(true);

     const res = await client.get(
       `/fx/convert?amount=${amount}&from=${from}&to=${to}`
     );

     setResult(res.data);
   } catch (err) {
     setError(err.message || "Failed to convert currency");
   } finally {
     setLoading(false);
   }
 };

 return (
   <div style={styles.page}>
     <h1>FX Converter</h1>
     <p style={styles.sub}>
       Third-party exchange rate feature used as additional integration proof for Evaluation 02.
     </p>

     {error && <div style={styles.error}>{error}</div>}

     <div style={styles.card}>
       <form onSubmit={handleConvert}>
         <label style={styles.label}>Amount</label>
         <input
           style={styles.input}
           type="number"
           min="1"
           value={amount}
           onChange={(e) => setAmount(e.target.value)}
           required
         />

         <div style={styles.twoCol}>
           <div>
             <label style={styles.label}>From</label>
             <input
               style={styles.input}
               value={from}
               onChange={(e) => setFrom(e.target.value.toUpperCase())}
               required
             />
           </div>

           <div>
             <label style={styles.label}>To</label>
             <input
               style={styles.input}
               value={to}
               onChange={(e) => setTo(e.target.value.toUpperCase())}
               required
             />
           </div>
         </div>

         <button type="submit" style={styles.primaryBtn} disabled={loading}>
           {loading ? "Converting..." : "Convert"}
         </button>
       </form>

       {result && (
         <div style={styles.resultBox}>
           <h3>Conversion Result</h3>
           <p>
             <strong>{result.amount}</strong> {result.from} ={" "}
             <strong>{result.converted}</strong> {result.to}
           </p>
           <p><strong>Rate:</strong> {result.rate}</p>
           <p><strong>Date:</strong> {result.date}</p>
         </div>
       )}
     </div>
   </div>
 );
}

const styles = {
 page: {
   padding: "24px",
   maxWidth: "900px",
   margin: "0 auto",
 },
 sub: {
   color: "#6b7280",
   marginBottom: "20px",
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
 twoCol: {
   display: "grid",
   gridTemplateColumns: "1fr 1fr",
   gap: "12px",
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
 resultBox: {
   marginTop: "20px",
   padding: "16px",
   background: "#f9fafb",
   borderRadius: "10px",
   border: "1px solid #e5e7eb",
 },
 error: {
   background: "#fee2e2",
   color: "#b91c1c",
   padding: "10px 12px",
   borderRadius: "8px",
   marginBottom: "16px",
 },
};
