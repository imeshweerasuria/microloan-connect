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
      case "PAID":
        return "#166534";
      case "PARTIAL":
        return "#92400e";
      case "OVERDUE":
        return "#b91c1c";
      default:
        return "#1d4ed8";
    }
  };

  return (
    <div style={styles.page}>
      <h1>Repayments</h1>
      <p style={styles.sub}>
        {isAdmin
          ? "Create, edit, and manage repayment schedules for the final demo."
          : "View your repayment schedule, pay manually, or use Stripe test checkout."}
      </p>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h3>Total Items</h3>
          <p style={styles.big}>{summary.total}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Paid</h3>
          <p style={styles.big}>{summary.paid}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Pending</h3>
          <p style={styles.big}>{summary.pending}</p>
        </div>
        <div style={styles.statCard}>
          <h3>Overdue</h3>
          <p style={styles.big}>{summary.overdue}</p>
        </div>
      </div>

      <div style={styles.card}>
        <label style={styles.label}>{isAdmin ? "Select Loan" : "Select My Loan"}</label>
        <select
          style={styles.input}
          value={selectedLoanId}
          onChange={(e) => setSelectedLoanId(e.target.value)}
        >
          <option value="">-- Select Loan --</option>
          {loans.map((loan) => (
            <option key={loan._id} value={loan._id}>
              {loan.title} | {loan.status} | {loan.amount} {loan.currency}
            </option>
          ))}
        </select>
      </div>

      {isAdmin && selectedLoanId && (
        <div style={styles.card}>
          <h2>Create Repayment Schedule Item</h2>

          <form onSubmit={handleCreateRepayment}>
            <div style={styles.payRow}>
              <input
                style={styles.smallInput}
                type="date"
                value={createForm.dueDate}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                required
              />
              <input
                style={styles.smallInput}
                type="number"
                min="1"
                placeholder="Amount Due"
                value={createForm.amountDue}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, amountDue: e.target.value }))
                }
                required
              />
              <button style={styles.payBtn} type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Repayment"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.card}>
        <h2>Repayment Schedule</h2>

        {loading ? (
          <p>Loading...</p>
        ) : selectedLoanId === "" ? (
          <p>Select a loan to view repayments.</p>
        ) : repayments.length === 0 ? (
          <p>No repayments found for this loan.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {repayments.map((rep) => {
              const remaining = rep.amountDue - rep.amountPaid;
              const draft = paymentDrafts[rep._id] || { amount: "", method: "CASH" };
              const adminDraft = adminDrafts[rep._id] || {
                dueDate: rep.dueDate ? new Date(rep.dueDate).toISOString().slice(0, 10) : "",
                amountDue: rep.amountDue || "",
                status: rep.status || "PENDING",
              };

              return (
                <div key={rep._id} style={styles.repCard}>
                  <div style={styles.repTop}>
                    <strong>Due: {new Date(rep.dueDate).toLocaleDateString()}</strong>
                    <span
                      style={{
                        ...styles.badge,
                        color: getStatusColor(rep.status),
                        borderColor: getStatusColor(rep.status),
                      }}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <p><strong>Amount Due:</strong> {rep.amountDue}</p>
                  <p><strong>Amount Paid:</strong> {rep.amountPaid}</p>
                  <p><strong>Remaining:</strong> {remaining}</p>

                  {rep.payments?.length > 0 && (
                    <div style={styles.historyBox}>
                      <strong>Payment History</strong>
                      {rep.payments.map((p, idx) => (
                        <div key={idx} style={styles.smallText}>
                          {p.amount} via {p.method} on {new Date(p.paidAt).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  )}

                  {!isAdmin && rep.status !== "PAID" && (
                    <>
                      <div style={styles.payRow}>
                        <input
                          style={styles.smallInput}
                          type="number"
                          min="1"
                          max={remaining}
                          value={draft.amount}
                          onChange={(e) => updateDraft(rep._id, "amount", e.target.value)}
                          placeholder="Amount"
                        />
                        <select
                          style={styles.smallInput}
                          value={draft.method}
                          onChange={(e) => updateDraft(rep._id, "method", e.target.value)}
                        >
                          <option value="CASH">CASH</option>
                          <option value="BANK">BANK</option>
                          <option value="ONLINE">ONLINE</option>
                        </select>
                        <button
                          style={styles.payBtn}
                          onClick={() => handlePay(rep._id)}
                          disabled={payingId === rep._id}
                        >
                          {payingId === rep._id ? "Paying..." : "Manual Pay"}
                        </button>
                      </div>

                      <div style={{ marginTop: "10px" }}>
                        <button
                          style={styles.stripeBtn}
                          onClick={() => handleStripeCheckout(rep._id)}
                          disabled={stripePayingId === rep._id}
                        >
                          {stripePayingId === rep._id
                            ? "Redirecting to Stripe..."
                            : "Pay by Stripe Test"}
                        </button>
                      </div>
                    </>
                  )}

                  {isAdmin && (
                    <div style={styles.adminBox}>
                      <h4 style={{ marginTop: 0 }}>Admin Controls</h4>

                      <div style={styles.payRow}>
                        <input
                          style={styles.smallInput}
                          type="date"
                          value={adminDraft.dueDate}
                          onChange={(e) => updateAdminDraft(rep._id, "dueDate", e.target.value)}
                        />
                        <input
                          style={styles.smallInput}
                          type="number"
                          min="1"
                          value={adminDraft.amountDue}
                          onChange={(e) => updateAdminDraft(rep._id, "amountDue", e.target.value)}
                        />
                        <select
                          style={styles.smallInput}
                          value={adminDraft.status}
                          onChange={(e) => updateAdminDraft(rep._id, "status", e.target.value)}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PARTIAL">PARTIAL</option>
                          <option value="PAID">PAID</option>
                          <option value="OVERDUE">OVERDUE</option>
                        </select>
                      </div>

                      <div style={styles.payRow}>
                        <button
                          style={styles.payBtn}
                          onClick={() => handleAdminSave(rep._id)}
                          disabled={savingAdminId === rep._id}
                        >
                          {savingAdminId === rep._id ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          style={styles.deleteBtn}
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
    padding: "24px",
    maxWidth: "1100px",
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
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
  },
  repCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px",
  },
  repTop: {
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
  historyBox: {
    marginTop: "10px",
    padding: "10px",
    background: "#f9fafb",
    borderRadius: "8px",
  },
  adminBox: {
    marginTop: "14px",
    padding: "12px",
    background: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
  },
  smallText: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  payRow: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
    flexWrap: "wrap",
  },
  smallInput: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },
  payBtn: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  stripeBtn: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
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
