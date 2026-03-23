import { useEffect, useState } from "react";
import client from "../api/client";
export default function BorrowerProfile() {
 const [form, setForm] = useState({
   phone: "",
   address: "",
   community: "",
   businessCategory: "",
   monthlyIncomeRange: "",
   householdSize: "",
   povertyImpactPlan: "",
 });

 const [profileExists, setProfileExists] = useState(false);
 const [verified, setVerified] = useState(false);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [message, setMessage] = useState("");
 const [error, setError] = useState("");

 const fetchProfile = async () => {
   try {
     setLoading(true);
     setError("");
     const res = await client.get("/borrowers/profile/me");

     setForm({
       phone: res.data.phone || "",
       address: res.data.address || "",
       community: res.data.community || "",
       businessCategory: res.data.businessCategory || "",
       monthlyIncomeRange: res.data.monthlyIncomeRange || "",
       householdSize: res.data.householdSize || "",
       povertyImpactPlan: res.data.povertyImpactPlan || "",
     });

     setVerified(Boolean(res.data.verified));
     setProfileExists(true);
   } catch (err) {
     setProfileExists(false);
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   fetchProfile();
 }, []);

 const handleChange = (e) => {
   setForm((prev) => ({
     ...prev,
     [e.target.name]:
       e.target.name === "householdSize"
         ? Number(e.target.value)
         : e.target.value,
   }));
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   setSaving(true);
   setMessage("");
   setError("");

   try {
     if (profileExists) {
       await client.put("/borrowers/profile/me", form);
       setMessage("✅ Profile updated successfully");
     } else {
       await client.post("/borrowers/profile", form);
       setMessage("✅ Profile created successfully");
       setProfileExists(true);
     }

     await fetchProfile();
   } catch (err) {
     setError(err.message || "Failed to save borrower profile");
   } finally {
     setSaving(false);
   }
 };

 if (loading) {
   return <div style={{ padding: "24px" }}>Loading borrower profile...</div>;
 }

 return (
   <div style={styles.wrapper}>
     <div style={styles.card}>
       <div style={styles.headerRow}>
         <div>
           <h2 style={{ marginBottom: "8px" }}>Borrower Profile</h2>
           <p style={{ color: "#666", marginTop: 0 }}>
             Complete your profile for loan eligibility and verification.
           </p>
         </div>

         <span
           style={{
             ...styles.badge,
             background: verified ? "#dcfce7" : "#fef3c7",
             color: verified ? "#166534" : "#92400e",
           }}
         >
           {verified ? "Verified" : "Pending Verification"}
         </span>
       </div>

       {message && <div style={styles.success}>{message}</div>}
       {error && <div style={styles.error}>{error}</div>}

       <form onSubmit={handleSubmit}>
         <div style={styles.grid}>
           <div>
             <label style={styles.label}>Phone</label>
             <input
               style={styles.input}
               name="phone"
               value={form.phone}
               onChange={handleChange}
               placeholder="e.g. 0771234567"
               required
             />
           </div>

           <div>
             <label style={styles.label}>Community</label>
             <input
               style={styles.input}
               name="community"
               value={form.community}
               onChange={handleChange}
               placeholder="Your community / area"
               required
             />
           </div>
         </div>

         <label style={styles.label}>Address</label>
         <input
           style={styles.input}
           name="address"
           value={form.address}
           onChange={handleChange}
           placeholder="Enter your full address"
           required
         />

         <div style={styles.grid}>
           <div>
             <label style={styles.label}>Business Category</label>
             <input
               style={styles.input}
               name="businessCategory"
               value={form.businessCategory}
               onChange={handleChange}
               placeholder="e.g. farming, tailoring, grocery"
               required
             />
           </div>

           <div>
             <label style={styles.label}>Monthly Income Range</label>
             <input
               style={styles.input}
               name="monthlyIncomeRange"
               value={form.monthlyIncomeRange}
               onChange={handleChange}
               placeholder="e.g. LKR 30,000 - 50,000"
               required
             />
           </div>
         </div>

         <label style={styles.label}>Household Size</label>
         <input
           style={styles.input}
           type="number"
           name="householdSize"
           value={form.householdSize}
           onChange={handleChange}
           min="1"
           required
         />

         <label style={styles.label}>Poverty Impact Plan</label>
         <textarea
           style={styles.textarea}
           name="povertyImpactPlan"
           value={form.povertyImpactPlan}
           onChange={handleChange}
           placeholder="Explain how this loan will reduce poverty or improve your family’s living conditions"
           required
         />

         <button type="submit" style={styles.button} disabled={saving}>
           {saving
             ? profileExists
               ? "Updating..."
               : "Saving..."
             : profileExists
             ? "Update Profile"
             : "Create Profile"}
         </button>
       </form>
     </div>
   </div>
 );
}

const styles = {
 wrapper: {
   background: "#f5f7fb",
   minHeight: "calc(100vh - 80px)",
   padding: "24px",
 },
 card: {
   maxWidth: "900px",
   margin: "0 auto",
   background: "#fff",
   borderRadius: "12px",
   padding: "32px",
   boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
 },
 headerRow: {
   display: "flex",
   justifyContent: "space-between",
   alignItems: "flex-start",
   gap: "16px",
   marginBottom: "20px",
 },
 badge: {
   padding: "8px 14px",
   borderRadius: "999px",
   fontSize: "14px",
   fontWeight: "600",
 },
 grid: {
   display: "grid",
   gridTemplateColumns: "1fr 1fr",
   gap: "16px",
 },
 label: {
   display: "block",
   marginBottom: "8px",
   marginTop: "10px",
   fontWeight: "600",
 },
 input: {
   width: "100%",
   padding: "12px",
   borderRadius: "8px",
   border: "1px solid #ccc",
   fontSize: "15px",
   boxSizing: "border-box",
 },
 textarea: {
   width: "100%",
   minHeight: "130px",
   padding: "12px",
   borderRadius: "8px",
   border: "1px solid #ccc",
   fontSize: "15px",
   boxSizing: "border-box",
   resize: "vertical",
 },
 button: {
   marginTop: "18px",
   padding: "12px 18px",
   border: "none",
   borderRadius: "8px",
   background: "#2563eb",
   color: "#fff",
   fontWeight: "600",
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
};
