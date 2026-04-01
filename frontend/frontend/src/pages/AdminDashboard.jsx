import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMyLoans = async () => {
    try {
      setLoading(true);
      setError("");
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

  const stats = useMemo(() => {
    return {
      total: loans.length,
      submitted: loans.filter((l) => l.status === "SUBMITTED").length,
      approved: loans.filter((l) => l.status === "APPROVED").length,
      active: loans.filter((l) => ["FUNDED", "ACTIVE"].includes(l.status)).length,
    };
  }, [loans]);

  const filteredLoans = useMemo(() => {
    const q = search.trim().toLowerCase();

    return loans.filter((loan) => {
      const matchesStatus = statusFilter === "ALL" ? true : loan.status === statusFilter;
      const matchesSearch =
        !q ||
        String(loan.title || "").toLowerCase().includes(q) ||
        String(loan.purpose || "").toLowerCase().includes(q) ||
        String(loan.businessCategory || "").toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [loans, statusFilter, search]);

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
      case "DRAFT":
        return "#92400e";
      case "SUBMITTED":
        return "#1d4ed8";
      case "APPROVED":
        return "#166534";
      case "REJECTED":
        return "#b91c1c";
      case "FUNDED":
      case "ACTIVE":
        return "#7c3aed";
      case "CLOSED":
        return "#374151";
      default:
        return "#111827";
    }
  };

  return (
    <div style={styles.page}>
      <h1>Borrower Dashboard</h1>
      <p style={styles.sub}>
        Create, manage, filter, and submit your loan requests with a cleaner final-demo experience.
      </p>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h3>Total Loans</h3>
          <p style={styles.big}>{stats.total}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Submitted</h3>
          <p style={styles.big}>{stats.submitted}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Approved</h3>
          <p style={styles.big}>{stats.approved}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Active/Funded</h3>
          <p style={styles.big}>{stats.active}</p>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <Link to="/borrower/profile" style={styles.profileLink}>
          Go to Borrower Profile
        </Link>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>{editingLoanId ? "Edit Loan" : "Create New Loan"}</h2>

          <form onSubmit={handleCreateOrUpdate}>
            <label style={styles.label}>Title</label>
            <input style={styles.input} name="title" value={form.title} onChange={handleChange} required />

            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} name="description" value={form.description} onChange={handleChange} required />

            <div style={styles.twoCol}>
              <div>
                <label style={styles.label}>Amount</label>
                <input style={styles.input} type="number" name="amount" value={form.amount} onChange={handleChange} required />
              </div>

              <div>
                <label style={styles.label}>Currency</label>
                <input style={styles.input} name="currency" value={form.currency} onChange={handleChange} required />
              </div>
            </div>

            <label style={styles.label}>Tenure (Months)</label>
            <input style={styles.input} type="number" name="tenureMonths" value={form.tenureMonths} onChange={handleChange} required />

            <label style={styles.label}>Purpose</label>
            <input style={styles.input} name="purpose" value={form.purpose} onChange={handleChange} required />

            <label style={styles.label}>Business Category</label>
            <input
              style={styles.input}
              name="businessCategory"
              value={form.businessCategory}
              onChange={handleChange}
              placeholder="e.g. farming, tailoring, grocery"
              required
            />

            <label style={styles.label}>How will this reduce poverty?</label>
            <textarea
              style={styles.textarea}
              name="povertyImpactPlanSnapshot"
              value={form.povertyImpactPlanSnapshot}
              onChange={handleChange}
              required
            />

            <div style={styles.actions}>
              <button type="submit" style={styles.primaryBtn} disabled={saving}>
                {saving ? "Saving..." : editingLoanId ? "Update Loan" : "Create Loan"}
              </button>

              {editingLoanId && (
                <button type="button" style={styles.secondaryBtn} onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={styles.card}>
          <div style={styles.filterToolbar}>
            <h2 style={{ margin: 0 }}>My Loans</h2>

            <div style={styles.filterRow}>
              <input
                style={styles.searchInput}
                placeholder="Search loans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                style={styles.select}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="FUNDED">FUNDED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading loans...</p>
          ) : filteredLoans.length === 0 ? (
            <p>No loans match your filter.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px", marginTop: "14px" }}>
              {filteredLoans.map((loan) => (
                <div key={loan._id} style={styles.loanCard}>
                  <div style={styles.loanTop}>
                    <strong>{loan.title}</strong>
                    <span
                      style={{
                        ...styles.badge,
                        color: getStatusColor(loan.status),
                        borderColor: getStatusColor(loan.status),
                      }}
                    >
                      {loan.status}
                    </span>
                  </div>

                  <p style={{ margin: "8px 0" }}>{loan.description}</p>

                  <div style={styles.meta}>
                    <span><strong>Amount:</strong> {loan.amount} {loan.currency}</span>
                    <span><strong>Tenure:</strong> {loan.tenureMonths} months</span>
                  </div>

                  <div style={styles.meta}>
                    <span><strong>Funded:</strong> {loan.fundedAmount || 0}</span>
                    <span><strong>Category:</strong> {loan.businessCategory}</span>
                  </div>

                  <div style={styles.loanBtns}>
                    {(loan.status === "DRAFT" || loan.status === "SUBMITTED") && (
                      <button style={styles.smallBtn} onClick={() => handleEdit(loan)}>
                        Edit
                      </button>
                    )}

                    {loan.status === "DRAFT" && (
                      <>
                        <button style={styles.smallBtn} onClick={() => handleSubmitLoan(loan)}>
                          Submit
                        </button>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(loan._id)}>
                          Delete
                        </button>
                      </>
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
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  sub: {
    color: "#6b7280",
    marginBottom: "20px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },
  big: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
  },
  profileLink: {
    textDecoration: "none",
    background: "#111827",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "8px",
    fontWeight: "600",
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
    minHeight: "90px",
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
  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },
  primaryBtn: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
  },
  filterToolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  filterRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    minWidth: "200px",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
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
  loanCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px",
  },
  loanTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: "600",
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "14px",
    color: "#374151",
    marginTop: "6px",
    flexWrap: "wrap",
  },
  loanBtns: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  },
  smallBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#dc2626",
    color: "#fff",
    cursor: "pointer",
  },
};
