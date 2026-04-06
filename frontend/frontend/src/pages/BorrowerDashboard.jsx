import { useEffect, useState } from "react";
import client from "../api/client";

export default function BorrowerDashboard() {
  const emptyForm = {
    title: "",
    description: "",
    amount: "",
    currency: "LKR",
    tenureMonths: "",
    purpose: "",
    businessCategory: "",
    povertyImpactPlanSnapshot: "",
  };

  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      const res = await client.get("/loans/me");
      setLoans(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        ["amount", "tenureMonths"].includes(name) && value !== ""
          ? Number(value)
          : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingLoanId(null);
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (editingLoanId) {
        await client.put(`/loans/${editingLoanId}`, form);
        setMessage("✅ Loan updated successfully");
      } else {
        await client.post("/loans", form);
        setMessage("✅ Loan created successfully");
      }

      resetForm();
      await fetchMyLoans();
    } catch (err) {
      setError(err.message || "Failed to save loan");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (loan) => {
    setEditingLoanId(loan._id);
    setForm({
      title: loan.title || "",
      description: loan.description || "",
      amount: loan.amount || "",
      currency: loan.currency || "LKR",
      tenureMonths: loan.tenureMonths || "",
      purpose: loan.purpose || "",
      businessCategory: loan.businessCategory || "",
      povertyImpactPlanSnapshot: loan.povertyImpactPlanSnapshot || "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (loanId) => {
    const ok = window.confirm("Delete this draft loan?");
    if (!ok) return;

    try {
      setError("");
      setMessage("");
      await client.delete(`/loans/${loanId}`);
      setMessage("✅ Loan deleted");
      await fetchMyLoans();
    } catch (err) {
      setError(err.message || "Failed to delete loan");
    }
  };

  const handleSubmitLoan = async (loan) => {
    try {
      setError("");
      setMessage("");
      await client.put(`/loans/${loan._id}`, { status: "SUBMITTED" });
      setMessage("✅ Loan submitted for admin review");
      await fetchMyLoans();
    } catch (err) {
      setError(err.message || "Failed to submit loan");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT": return "#f59e0b";
      case "SUBMITTED": return "#3b82f6";
      case "APPROVED": return "#2563eb";
      case "REJECTED": return "#ef4444";
      case "FUNDED": return "#8b5cf6";
      case "ACTIVE": return "#06b6d4";
      case "CLOSED": return "#6b7280";
      default: return "#374151";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "DRAFT": return "#fef3c7";
      case "SUBMITTED": return "#dbeafe";
      case "APPROVED": return "#e0e7ff";
      case "REJECTED": return "#fee2e2";
      case "FUNDED": return "#ede9fe";
      case "ACTIVE": return "#cffafe";
      case "CLOSED": return "#f3f4f6";
      default: return "#f9fafb";
    }
  };

  // Calculate stats
  const stats = {
    total: loans.length,
    submitted: loans.filter(l => l.status === "SUBMITTED").length,
    approved: loans.filter(l => l.status === "APPROVED").length,
    funded: loans.filter(l => ["FUNDED", "ACTIVE"].includes(l.status)).length,
    totalAmount: loans.reduce((sum, l) => sum + (l.amount || 0), 0),
    fundedAmount: loans.reduce((sum, l) => sum + (l.fundedAmount || 0), 0),
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading your loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Borrower Dashboard
            <span style={styles.titleAccent}> | Loan Management</span>
          </h1>
          <p style={styles.subtitle}>
            Create, manage, and submit loan requests to fund your growth
          </p>
        </div>
        <div style={styles.finBadge}>
          <span style={styles.finIcon}>🏦</span>
          <span style={styles.finText}>Financial Inclusion</span>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div style={styles.success}>
          <span style={styles.messageIcon}>✅</span>
          <span>{message}</span>
          <button onClick={() => setMessage("")} style={styles.closeBtn}>×</button>
        </div>
      )}
      {error && (
        <div style={styles.error}>
          <span style={styles.messageIcon}>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError("")} style={styles.closeBtn}>×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTopColor: "#3b82f6"}}>
          <div style={styles.statIcon}>📋</div>
          <div>
            <h3 style={styles.statTitle}>Total Loans</h3>
            <p style={styles.statValue}>{stats.total}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#f59e0b"}}>
          <div style={styles.statIcon}>⏳</div>
          <div>
            <h3 style={styles.statTitle}>Submitted</h3>
            <p style={{...styles.statValue, color: "#f59e0b"}}>{stats.submitted}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#2563eb"}}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <h3 style={styles.statTitle}>Approved</h3>
            <p style={{...styles.statValue, color: "#2563eb"}}>{stats.approved}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#8b5cf6"}}>
          <div style={styles.statIcon}>💰</div>
          <div>
            <h3 style={styles.statTitle}>Funded/Active</h3>
            <p style={{...styles.statValue, color: "#8b5cf6"}}>{stats.funded}</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div style={styles.financialCard}>
        <div style={styles.financialIcon}>📊</div>
        <div style={styles.financialContent}>
          <div>
            <p style={styles.financialLabel}>Total Requested</p>
            <p style={styles.financialValue}>LKR {stats.totalAmount.toLocaleString()}</p>
          </div>
          <div style={styles.financialDivider}></div>
          <div>
            <p style={styles.financialLabel}>Total Funded</p>
            <p style={styles.financialValue}>LKR {stats.fundedAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* Create/Edit Loan Form */}
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <span style={styles.formIcon}>{editingLoanId ? "✏️" : "➕"}</span>
            <h2 style={styles.formTitle}>
              {editingLoanId ? "Edit Your Loan" : "Create New Loan Request"}
            </h2>
          </div>
          
          <form onSubmit={handleCreateOrUpdate}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📝</span>
                Loan Title
              </label>
              <input
                style={styles.input}
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Business Expansion Loan"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📄</span>
                Description
              </label>
              <textarea
                style={styles.textarea}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your loan purpose in detail..."
                required
              />
            </div>

            <div style={styles.twoCol}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>💰</span>
                  Amount
                </label>
                <input
                  style={styles.input}
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🌍</span>
                  Currency
                </label>
                <input
                  style={styles.input}
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📅</span>
                Tenure (Months)
              </label>
              <input
                style={styles.input}
                type="number"
                name="tenureMonths"
                value={form.tenureMonths}
                onChange={handleChange}
                placeholder="12"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🎯</span>
                Loan Purpose
              </label>
              <input
                style={styles.input}
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="e.g., Business expansion, Equipment purchase"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🏢</span>
                Business Category
              </label>
              <input
                style={styles.input}
                name="businessCategory"
                value={form.businessCategory}
                onChange={handleChange}
                placeholder="e.g., retail, services, manufacturing"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📈</span>
                How will this support financial growth?
              </label>
              <textarea
                style={styles.textarea}
                name="povertyImpactPlanSnapshot"
                value={form.povertyImpactPlanSnapshot}
                onChange={handleChange}
                placeholder="Describe how this loan will help grow your business and create economic opportunity..."
                required
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.primaryBtn} disabled={saving}>
                {saving ? (
                  <span style={styles.btnContent}>
                    <span style={styles.spinner}></span>
                    Saving...
                  </span>
                ) : editingLoanId ? (
                  "✏️ Update Loan"
                ) : (
                  "➕ Create Loan"
                )}
              </button>

              {editingLoanId && (
                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* My Loans List */}
        <div style={styles.loansCard}>
          <div style={styles.loansHeader}>
            <span style={styles.loansIcon}>📚</span>
            <h2 style={styles.loansTitle}>My Loan Applications</h2>
          </div>

          {loans.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <p style={styles.emptyText}>No loan applications yet</p>
              <p style={styles.emptySubtext}>Create your first loan request using the form</p>
            </div>
          ) : (
            <div style={styles.loansList}>
              {loans.map((loan) => (
                <div key={loan._id} style={styles.loanItem}>
                  <div style={styles.loanHeader}>
                    <div>
                      <h3 style={styles.loanTitle}>{loan.title}</h3>
                      <p style={styles.loanDescription}>{loan.description}</p>
                    </div>
                    <span style={{...styles.statusBadge, background: getStatusBgColor(loan.status), color: getStatusColor(loan.status)}}>
                      {loan.status}
                    </span>
                  </div>
                  
                  <div style={styles.loanDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Amount</span>
                      <span style={styles.detailValue}>{loan.amount} {loan.currency}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Tenure</span>
                      <span style={styles.detailValue}>{loan.tenureMonths} months</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Funded</span>
                      <span style={styles.detailValue}>{loan.fundedAmount || 0}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Category</span>
                      <span style={styles.detailValue}>{loan.businessCategory}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Purpose</span>
                      <span style={styles.detailValue}>{loan.purpose}</span>
                    </div>
                  </div>

                  {loan.povertyImpactPlanSnapshot && (
                    <div style={styles.impactBox}>
                      <span style={styles.impactIcon}>📊</span>
                      <div>
                        <p style={styles.impactLabel}>Growth Impact Plan</p>
                        <p style={styles.impactText}>{loan.povertyImpactPlanSnapshot}</p>
                      </div>
                    </div>
                  )}
                  
                  <div style={styles.loanActions}>
                    {(loan.status === "DRAFT" || loan.status === "SUBMITTED") && (
                      <button style={styles.editBtn} onClick={() => handleEdit(loan)}>
                        ✏️ Edit
                      </button>
                    )}

                    {loan.status === "DRAFT" && (
                      <>
                        <button style={styles.submitBtn} onClick={() => handleSubmitLoan(loan)}>
                          📤 Submit for Review
                        </button>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(loan._id)}>
                          🗑️ Delete
                        </button>
                      </>
                    )}

                    {loan.status === "SUBMITTED" && (
                      <div style={styles.pendingMessage}>
                        ⏳ Pending admin review
                      </div>
                    )}

                    {loan.status === "APPROVED" && (
                      <div style={styles.approvedMessage}>
                        ✅ Approved! Waiting for funding
                      </div>
                    )}

                    {loan.status === "FUNDED" && (
                      <div style={styles.fundedMessage}>
                        💰 Funded! Start your journey
                      </div>
                    )}
                  </div>
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
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
    padding: "40px 24px",
  },
  
  heroSection: {
    maxWidth: "1200px",
    margin: "0 auto 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  
  heroContent: {
    flex: 1,
  },
  
  title: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  
  titleAccent: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  
  subtitle: {
    color: "#4b5563",
    fontSize: "16px",
    margin: 0,
  },
  
  finBadge: {
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    padding: "12px 20px",
    borderRadius: "40px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
  },
  
  finIcon: {
    fontSize: "24px",
  },
  
  finText: {
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
  },
  
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  
  loadingText: {
    marginTop: "16px",
    color: "#6b7280",
  },
  
  success: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    background: "#d1fae5",
    color: "#065f46",
    padding: "14px 20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderLeft: "4px solid #10b981",
  },
  
  error: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "14px 20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderLeft: "4px solid #ef4444",
  },
  
  messageIcon: {
    fontSize: "20px",
  },
  
  closeBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "inherit",
    padding: "0 8px",
  },
  
  statsGrid: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  
  statCard: {
    background: "white",
    padding: "24px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    borderTop: "4px solid",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  
  statIcon: {
    fontSize: "40px",
  },
  
  statTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#6b7280",
    margin: "0 0 8px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  
  statValue: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1f2937",
    margin: 0,
  },
  
  financialCard: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    background: "white",
    padding: "20px 24px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  financialIcon: {
    fontSize: "36px",
  },
  
  financialContent: {
    flex: 1,
    display: "flex",
    justifyContent: "space-around",
    gap: "20px",
  },
  
  financialDivider: {
    width: "1px",
    background: "#e5e7eb",
  },
  
  financialLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#6b7280",
    margin: "0 0 4px 0",
  },
  
  financialValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  mainGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
  },
  
  formCard: {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  
  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  
  formIcon: {
    fontSize: "28px",
  },
  
  formTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  formGroup: {
    marginBottom: "20px",
  },
  
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "14px",
  },
  
  labelIcon: {
    fontSize: "16px",
  },
  
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    transition: "border-color 0.2s",
    outline: "none",
    boxSizing: "border-box",
  },
  
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    outline: "none",
    boxSizing: "border-box",
  },
  
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  
  formActions: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
  },
  
  primaryBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  
  secondaryBtn: {
    padding: "12px 24px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "white",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  
  btnContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid white",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  
  loansCard: {
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  
  loansHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  
  loansIcon: {
    fontSize: "28px",
  },
  
  loansTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  loansList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxHeight: "600px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  
  loanItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    transition: "box-shadow 0.2s",
  },
  
  loanHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  
  loanTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px 0",
  },
  
  loanDescription: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.5",
  },
  
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  
  loanDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
    padding: "16px",
    background: "#f9fafb",
    borderRadius: "12px",
  },
  
  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  
  detailLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  
  detailValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  
  impactBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    background: "#eff6ff",
    borderRadius: "12px",
    marginBottom: "16px",
    borderLeft: "3px solid #3b82f6",
  },
  
  impactIcon: {
    fontSize: "20px",
  },
  
  impactLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#1e40af",
    margin: "0 0 4px 0",
  },
  
  impactText: {
    fontSize: "13px",
    color: "#1e3a8a",
    margin: 0,
    lineHeight: "1.5",
  },
  
  loanActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  
  editBtn: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  
  submitBtn: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  
  deleteBtn: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "white",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  
  pendingMessage: {
    padding: "8px 16px",
    background: "#dbeafe",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#1e40af",
  },
  
  approvedMessage: {
    padding: "8px 16px",
    background: "#e0e7ff",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#1e3a8a",
  },
  
  fundedMessage: {
    padding: "8px 16px",
    background: "#ede9fe",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#5b21b6",
  },
  
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  
  emptyIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "16px",
  },
  
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#374151",
    margin: "0 0 8px 0",
  },
  
  emptySubtext: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: 0,
  },
};

// Add animation keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);