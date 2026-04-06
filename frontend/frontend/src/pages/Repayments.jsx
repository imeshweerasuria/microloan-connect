import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Repayments() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [repayments, setRepayments] = useState([]);
  const [paymentDrafts, setPaymentDrafts] = useState({});
  const [adminDrafts, setAdminDrafts] = useState({});
  const [createForm, setCreateForm] = useState({
    dueDate: "",
    amountDue: "",
  });
  const [creating, setCreating] = useState(false);
  const [payingId, setPayingId] = useState("");
  const [stripePayingId, setStripePayingId] = useState("");
  const [savingAdminId, setSavingAdminId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const fetchLoans = async () => {
    try {
      const res = isAdmin ? await client.get("/loans") : await client.get("/loans/me");
      setLoans(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load loans");
    }
  };

  const fetchRepaymentsByLoan = async (loanId) => {
    if (!loanId) return;
    try {
      const res = await client.get(`/repayments/loan/${loanId}`);
      const list = res.data || [];
      setRepayments(list);

      const nextDrafts = {};
      list.forEach((rep) => {
        nextDrafts[rep._id] = {
          dueDate: rep.dueDate ? new Date(rep.dueDate).toISOString().slice(0, 10) : "",
          amountDue: rep.amountDue || "",
          status: rep.status || "PENDING",
        };
      });
      setAdminDrafts(nextDrafts);
    } catch (err) {
      setError(err.message || "Failed to load repayments");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        await fetchLoans();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  useEffect(() => {
    const loanIdFromQuery = searchParams.get("loan_id");
    if (loanIdFromQuery) {
      setSelectedLoanId(loanIdFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedLoanId) {
      fetchRepaymentsByLoan(selectedLoanId);
    } else {
      setRepayments([]);
    }
  }, [selectedLoanId]);

  useEffect(() => {
    const stripeSuccess = searchParams.get("stripe_success");
    const stripeCancel = searchParams.get("stripe_cancel");
    const repaymentId = searchParams.get("repayment_id");
    const sessionId = searchParams.get("session_id");
    const loanId = searchParams.get("loan_id");

    if (stripeCancel === "1") {
      setMessage("ℹ️ Stripe checkout was cancelled.");
      setSearchParams(loanId ? { loan_id: loanId } : {});
      return;
    }

    if (!isAdmin && stripeSuccess === "1" && repaymentId && sessionId) {
      (async () => {
        try {
          setError("");
          setMessage("Confirming Stripe payment...");
          await client.post(`/repayments/${repaymentId}/confirm-stripe-session`, {
            sessionId
          });

          if (loanId) {
            setSelectedLoanId(loanId);
            await fetchRepaymentsByLoan(loanId);
          }

          setMessage("✅ Stripe payment confirmed and repayment updated.");
        } catch (err) {
          setError(err.message || "Failed to confirm Stripe payment");
        } finally {
          setSearchParams(loanId ? { loan_id: loanId } : {});
        }
      })();
    }
  }, [searchParams, isAdmin, setSearchParams]);

  const selectedLoan = useMemo(
    () => loans.find((loan) => loan._id === selectedLoanId),
    [loans, selectedLoanId]
  );

  const selectedBorrowerId =
    selectedLoan?.borrowerId?._id || selectedLoan?.borrowerId || "";

  const summary = useMemo(() => {
    return {
      total: repayments.length,
      paid: repayments.filter((rep) => rep.status === "PAID").length,
      partial: repayments.filter((rep) => rep.status === "PARTIAL").length,
      pending: repayments.filter((rep) => rep.status === "PENDING").length,
      overdue: repayments.filter((rep) => rep.status === "OVERDUE").length,
    };
  }, [repayments]);

  const updateDraft = (repaymentId, field, value) => {
    setPaymentDrafts((prev) => ({
      ...prev,
      [repaymentId]: {
        amount: prev[repaymentId]?.amount || "",
        method: prev[repaymentId]?.method || "CASH",
        [field]: value,
      },
    }));
  };

  const updateAdminDraft = (repaymentId, field, value) => {
    setAdminDrafts((prev) => ({
      ...prev,
      [repaymentId]: {
        dueDate: prev[repaymentId]?.dueDate || "",
        amountDue: prev[repaymentId]?.amountDue || "",
        status: prev[repaymentId]?.status || "PENDING",
        [field]: value,
      },
    }));
  };

  const handlePay = async (repaymentId) => {
    const draft = paymentDrafts[repaymentId] || { amount: "", method: "CASH" };

    try {
      setError("");
      setMessage("");
      setPayingId(repaymentId);

      await client.post(`/repayments/${repaymentId}/pay`, {
        amount: Number(draft.amount),
        method: draft.method,
      });

      setMessage("✅ Repayment recorded successfully");
      setPaymentDrafts((prev) => ({
        ...prev,
        [repaymentId]: { amount: "", method: "CASH" },
      }));
      await fetchRepaymentsByLoan(selectedLoanId);
    } catch (err) {
      setError(err.message || "Failed to make repayment");
    } finally {
      setPayingId("");
    }
  };

  const handleStripeCheckout = async (repaymentId) => {
    try {
      setError("");
      setMessage("");
      setStripePayingId(repaymentId);

      const res = await client.post(`/repayments/${repaymentId}/stripe-checkout-session`);
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.message || "Failed to start Stripe checkout");
      setStripePayingId("");
    }
  };

  const handleCreateRepayment = async (e) => {
    e.preventDefault();

    if (!selectedLoanId || !selectedBorrowerId) {
      setError("Please select a valid loan first");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      await client.post("/repayments", {
        loanId: selectedLoanId,
        borrowerId: selectedBorrowerId,
        dueDate: createForm.dueDate,
        amountDue: Number(createForm.amountDue),
      });

      setMessage("✅ Repayment schedule item created successfully");
      setCreateForm({ dueDate: "", amountDue: "" });
      await fetchRepaymentsByLoan(selectedLoanId);
    } catch (err) {
      setError(err.message || "Failed to create repayment");
    } finally {
      setCreating(false);
    }
  };

  const handleAdminSave = async (repaymentId) => {
    const draft = adminDrafts[repaymentId];
    if (!draft) return;

    try {
      setSavingAdminId(repaymentId);
      setError("");
      setMessage("");

      await client.put(`/repayments/${repaymentId}`, {
        dueDate: draft.dueDate,
        amountDue: Number(draft.amountDue),
        status: draft.status,
      });

      setMessage("✅ Repayment updated successfully");
      await fetchRepaymentsByLoan(selectedLoanId);
    } catch (err) {
      setError(err.message || "Failed to update repayment");
    } finally {
      setSavingAdminId("");
    }
  };

  const handleDeleteRepayment = async (repaymentId) => {
    const ok = window.confirm("Delete this repayment item?");
    if (!ok) return;

    try {
      setDeletingId(repaymentId);
      setError("");
      setMessage("");

      await client.delete(`/repayments/${repaymentId}`);
      setMessage("✅ Repayment deleted successfully");
      await fetchRepaymentsByLoan(selectedLoanId);
    } catch (err) {
      setError(err.message || "Failed to delete repayment");
    } finally {
      setDeletingId("");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID": return "#10b981";
      case "PARTIAL": return "#f59e0b";
      case "OVERDUE": return "#ef4444";
      default: return "#3b82f6";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "PAID": return "#d1fae5";
      case "PARTIAL": return "#fef3c7";
      case "OVERDUE": return "#fee2e2";
      default: return "#dbeafe";
    }
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Repayments
            <span style={styles.titleAccent}> | Track Your Progress</span>
          </h1>
          <p style={styles.subtitle}>
            {isAdmin
              ? "Manage repayment schedules and track borrower payments"
              : "View your repayment schedule, make payments, and build credit history"}
          </p>
        </div>
        <div style={styles.sdgBadge}>
          <span style={styles.sdgIcon}>🎯</span>
          <span style={styles.sdgText}>SDG Goal 1: No Poverty</span>
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

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTopColor: "#3b82f6"}}>
          <div style={styles.statIcon}>📋</div>
          <div>
            <h3 style={styles.statTitle}>Total Items</h3>
            <p style={styles.statValue}>{summary.total}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#10b981"}}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <h3 style={styles.statTitle}>Paid</h3>
            <p style={{...styles.statValue, color: "#10b981"}}>{summary.paid}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#f59e0b"}}>
          <div style={styles.statIcon}>⏳</div>
          <div>
            <h3 style={styles.statTitle}>Pending</h3>
            <p style={{...styles.statValue, color: "#f59e0b"}}>{summary.pending}</p>
          </div>
        </div>
        
        <div style={{...styles.statCard, borderTopColor: "#ef4444"}}>
          <div style={styles.statIcon}>⚠️</div>
          <div>
            <h3 style={styles.statTitle}>Overdue</h3>
            <p style={{...styles.statValue, color: "#ef4444"}}>{summary.overdue}</p>
          </div>
        </div>
      </div>

      {/* Loan Selection Card */}
      <div style={styles.selectionCard}>
        <div style={styles.selectionHeader}>
          <span style={styles.selectionIcon}>🏦</span>
          <h2 style={styles.selectionTitle}>
            {isAdmin ? "Select Loan to Manage" : "Select Your Loan"}
          </h2>
        </div>
        <select
          style={styles.loanSelect}
          value={selectedLoanId}
          onChange={(e) => setSelectedLoanId(e.target.value)}
        >
          <option value="">-- Choose a loan --</option>
          {loans.map((loan) => (
            <option key={loan._id} value={loan._id}>
              {loan.title} | {loan.status} | {loan.amount} {loan.currency}
            </option>
          ))}
        </select>
      </div>

      {/* Admin Create Repayment Section */}
      {isAdmin && selectedLoanId && (
        <div style={styles.createCard}>
          <div style={styles.createHeader}>
            <span style={styles.createIcon}>➕</span>
            <h2 style={styles.createTitle}>Create Repayment Schedule Item</h2>
          </div>
          <form onSubmit={handleCreateRepayment}>
            <div style={styles.createRow}>
              <div style={styles.createField}>
                <label style={styles.fieldLabel}>Due Date</label>
                <input
                  style={styles.dateInput}
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                  required
                />
              </div>
              <div style={styles.createField}>
                <label style={styles.fieldLabel}>Amount Due</label>
                <input
                  style={styles.amountInput}
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={createForm.amountDue}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, amountDue: e.target.value }))
                  }
                  required
                />
              </div>
              <button style={styles.createBtn} type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Repayment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Repayments List */}
      <div style={styles.repaymentsCard}>
        <div style={styles.repaymentsHeader}>
          <span style={styles.repaymentsIcon}>📅</span>
          <h2 style={styles.repaymentsTitle}>Repayment Schedule</h2>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p>Loading repayment schedule...</p>
          </div>
        ) : selectedLoanId === "" ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🏦</span>
            <p>Select a loan to view repayment schedule</p>
          </div>
        ) : repayments.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📭</span>
            <p>No repayments found for this loan</p>
            {isAdmin && <p style={styles.emptySubtext}>Create a repayment schedule using the form above</p>}
          </div>
        ) : (
          <div style={styles.repaymentsList}>
            {repayments.map((rep) => {
              const remaining = rep.amountDue - rep.amountPaid;
              const draft = paymentDrafts[rep._id] || { amount: "", method: "CASH" };
              const adminDraft = adminDrafts[rep._id] || {
                dueDate: rep.dueDate ? new Date(rep.dueDate).toISOString().slice(0, 10) : "",
                amountDue: rep.amountDue || "",
                status: rep.status || "PENDING",
              };

              return (
                <div key={rep._id} style={styles.repaymentItem}>
                  <div style={styles.itemHeader}>
                    <div>
                      <span style={styles.calendarIcon}>📅</span>
                      <strong style={styles.dueDate}>
                        Due: {new Date(rep.dueDate).toLocaleDateString()}
                      </strong>
                    </div>
                    <span style={{...styles.statusBadge, background: getStatusBgColor(rep.status), color: getStatusColor(rep.status)}}>
                      {rep.status}
                    </span>
                  </div>

                  <div style={styles.amountGrid}>
                    <div>
                      <p style={styles.amountLabel}>Amount Due</p>
                      <p style={styles.amountValue}>LKR {rep.amountDue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={styles.amountLabel}>Amount Paid</p>
                      <p style={styles.amountValue}>LKR {rep.amountPaid.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={styles.amountLabel}>Remaining</p>
                      <p style={{...styles.amountValue, color: remaining > 0 ? "#ef4444" : "#10b981"}}>
                        LKR {remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {rep.payments?.length > 0 && (
                    <div style={styles.historyBox}>
                      <div style={styles.historyHeader}>
                        <span>📜</span>
                        <strong>Payment History</strong>
                      </div>
                      {rep.payments.map((p, idx) => (
                        <div key={idx} style={styles.historyItem}>
                          <span>💰 LKR {p.amount}</span>
                          <span>via {p.method}</span>
                          <span>on {new Date(p.paidAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Borrower Payment Section */}
                  {!isAdmin && rep.status !== "PAID" && (
                    <div style={styles.paymentSection}>
                      <div style={styles.paymentRow}>
                        <input
                          style={styles.paymentAmount}
                          type="number"
                          min="1"
                          max={remaining}
                          value={draft.amount}
                          onChange={(e) => updateDraft(rep._id, "amount", e.target.value)}
                          placeholder="Enter amount"
                        />
                        <select
                          style={styles.paymentMethod}
                          value={draft.method}
                          onChange={(e) => updateDraft(rep._id, "method", e.target.value)}
                        >
                          <option value="CASH">💵 Cash</option>
                          <option value="BANK">🏦 Bank Transfer</option>
                          <option value="ONLINE">💳 Online Payment</option>
                        </select>
                        <button
                          style={styles.manualPayBtn}
                          onClick={() => handlePay(rep._id)}
                          disabled={payingId === rep._id}
                        >
                          {payingId === rep._id ? "Processing..." : "Manual Pay"}
                        </button>
                      </div>
                      <button
                        style={styles.stripePayBtn}
                        onClick={() => handleStripeCheckout(rep._id)}
                        disabled={stripePayingId === rep._id}
                      >
                        {stripePayingId === rep._id ? "Redirecting..." : "💳 Pay with Stripe"}
                      </button>
                    </div>
                  )}

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div style={styles.adminSection}>
                      <div style={styles.adminHeader}>
                        <span>⚙️</span>
                        <strong>Admin Controls</strong>
                      </div>
                      <div style={styles.adminRow}>
                        <input
                          style={styles.adminInput}
                          type="date"
                          value={adminDraft.dueDate}
                          onChange={(e) => updateAdminDraft(rep._id, "dueDate", e.target.value)}
                        />
                        <input
                          style={styles.adminInput}
                          type="number"
                          min="1"
                          placeholder="Amount"
                          value={adminDraft.amountDue}
                          onChange={(e) => updateAdminDraft(rep._id, "amountDue", e.target.value)}
                        />
                        <select
                          style={styles.adminSelect}
                          value={adminDraft.status}
                          onChange={(e) => updateAdminDraft(rep._id, "status", e.target.value)}
                        >
                          <option value="PENDING">⏳ PENDING</option>
                          <option value="PARTIAL">🟡 PARTIAL</option>
                          <option value="PAID">✅ PAID</option>
                          <option value="OVERDUE">🔴 OVERDUE</option>
                        </select>
                      </div>
                      <div style={styles.adminActions}>
                        <button
                          style={styles.saveBtn}
                          onClick={() => handleAdminSave(rep._id)}
                          disabled={savingAdminId === rep._id}
                        >
                          {savingAdminId === rep._id ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          style={styles.deleteAdminBtn}
                          onClick={() => handleDeleteRepayment(rep._id)}
                          disabled={deletingId === rep._id}
                        >
                          {deletingId === rep._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
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
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "40px 24px",
  },
  
  heroSection: {
    maxWidth: "1200px",
    margin: "0 auto 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  },
  
  heroContent: {
    flex: 1,
  },
  
  title: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  
  titleAccent: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  
  subtitle: {
    color: "#6b7280",
    fontSize: "16px",
    margin: 0,
  },
  
  sdgBadge: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    padding: "12px 20px",
    borderRadius: "40px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
  },
  
  sdgIcon: {
    fontSize: "24px",
  },
  
  sdgText: {
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
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
  
  selectionCard: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  selectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  
  selectionIcon: {
    fontSize: "28px",
  },
  
  selectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  loanSelect: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
  },
  
  createCard: {
    maxWidth: "1200px",
    margin: "0 auto 20px",
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  createHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  
  createIcon: {
    fontSize: "28px",
  },
  
  createTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  createRow: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  
  createField: {
    flex: 1,
    minWidth: "150px",
  },
  
  fieldLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: "6px",
  },
  
  dateInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  
  amountInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  
  createBtn: {
    padding: "10px 24px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  
  repaymentsCard: {
    maxWidth: "1200px",
    margin: "0 auto",
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  
  repaymentsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  
  repaymentsIcon: {
    fontSize: "28px",
  },
  
  repaymentsTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  loadingContainer: {
    textAlign: "center",
    padding: "40px",
  },
  
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #e5e7eb",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#9ca3af",
  },
  
  emptyIcon: {
    fontSize: "64px",
    display: "block",
    marginBottom: "16px",
  },
  
  emptySubtext: {
    fontSize: "13px",
    marginTop: "8px",
  },
  
  repaymentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  
  repaymentItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    transition: "box-shadow 0.2s",
  },
  
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  
  calendarIcon: {
    marginRight: "8px",
  },
  
  dueDate: {
    fontSize: "16px",
  },
  
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  
  amountGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    padding: "16px",
    background: "#f9fafb",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  
  amountLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#9ca3af",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
  },
  
  amountValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  
  historyBox: {
    padding: "12px",
    background: "#f0fdf4",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  
  historyHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  
  historyItem: {
    display: "flex",
    gap: "16px",
    fontSize: "13px",
    color: "#065f46",
    padding: "4px 0",
  },
  
  paymentSection: {
    marginTop: "16px",
  },
  
  paymentRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  
  paymentAmount: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  
  paymentMethod: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  
  manualPayBtn: {
    padding: "10px 20px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  
  stripePayBtn: {
    width: "100%",
    padding: "10px 20px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  
  adminSection: {
    marginTop: "16px",
    padding: "16px",
    background: "#f9fafb",
    borderRadius: "12px",
  },
  
  adminHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  
  adminRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  
  adminInput: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "13px",
  },
  
  adminSelect: {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "13px",
  },
  
  adminActions: {
    display: "flex",
    gap: "12px",
  },
  
  saveBtn: {
    padding: "8px 16px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  
  deleteAdminBtn: {
    padding: "8px 16px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
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