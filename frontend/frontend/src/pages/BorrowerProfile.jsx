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
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupPreview, setLookupPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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
    } catch {
      setProfileExists(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanPhone) {
      return "Phone number is required";
    }

    if (cleanPhone.length < 9 || cleanPhone.length > 10) {
      return "Phone number must be 9-10 digits";
    }

    const validPrefixes = ["07", "7", "011", "021", "031", "041", "051", "061", "081", "091"];
    const startsValid = validPrefixes.some((prefix) => phone.startsWith(prefix));

    if (!startsValid && phone.length > 0) {
      return "Please enter a valid phone number format";
    }

    return "";
  };

  const validateForm = () => {
    const errors = {};

    if (!form.phone.trim()) {
      errors.phone = "Phone number is required";
    } else {
      const phoneError = validatePhoneNumber(form.phone);
      if (phoneError) errors.phone = phoneError;
    }

    if (!form.address.trim()) {
      errors.address = "Address is required";
    }

    if (!form.community.trim()) {
      errors.community = "Community/Area is required";
    }

    if (!form.businessCategory.trim()) {
      errors.businessCategory = "Business category is required";
    }

    if (!form.monthlyIncomeRange.trim()) {
      errors.monthlyIncomeRange = "Monthly income range is required";
    }

    if (!form.householdSize || form.householdSize <= 0) {
      errors.householdSize = "Household size is required and must be at least 1";
    }

    if (!form.povertyImpactPlan.trim()) {
      errors.povertyImpactPlan = "Financial growth plan is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "householdSize" ? Number(value) : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (name === "phone") {
      const phoneError = validatePhoneNumber(value);
      if (phoneError && value.trim()) {
        setFieldErrors((prev) => ({
          ...prev,
          phone: phoneError,
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          phone: "",
        }));
      }
    }
  };

  const handleLookupCommunity = async () => {
    if (!form.address.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        address: "Please enter an address first",
      }));
      return;
    }

    try {
      setLookupLoading(true);
      setError("");
      setMessage("");
      setLookupPreview(null);

      const res = await client.get(
        `/borrowers/geocode/community?address=${encodeURIComponent(form.address)}`
      );

      setForm((prev) => ({
        ...prev,
        community: res.data.community || prev.community,
      }));

      setLookupPreview(res.data);

      if (res.data.matched && res.data.matchedCommunity?.name) {
        setMessage(
          `✅ Supported community matched: ${res.data.matchedCommunity.name}`
        );
      } else if (res.data.detectedCommunity) {
        setMessage(
          `✅ Detected area: ${res.data.detectedCommunity}. No admin-defined community matched, so you can review or edit it manually.`
        );
      } else {
        setMessage(
          "✅ Address lookup completed, but no clear community was found. You can enter it manually."
        );
      }
    } catch (err) {
      setError(err.message || "Failed to detect community from address");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill in all required fields correctly");

      const currentErrors = {};
      if (!form.phone.trim()) currentErrors.phone = true;
      else if (validatePhoneNumber(form.phone)) currentErrors.phone = true;
      if (!form.address.trim()) currentErrors.address = true;
      if (!form.community.trim()) currentErrors.community = true;
      if (!form.businessCategory.trim()) currentErrors.businessCategory = true;
      if (!form.monthlyIncomeRange.trim()) currentErrors.monthlyIncomeRange = true;
      if (!form.householdSize || form.householdSize <= 0) currentErrors.householdSize = true;
      if (!form.povertyImpactPlan.trim()) currentErrors.povertyImpactPlan = true;

      const firstErrorField = Object.keys(currentErrors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

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
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Borrower Profile
            <span style={styles.titleAccent}> | Financial Identity</span>
          </h1>
          <p style={styles.subtitle}>
            Complete your profile to unlock loan eligibility and build trust with lenders
          </p>
        </div>
        <div style={styles.finBadge}>
          <span style={styles.finIcon}>🏦</span>
          <span style={styles.finText}>Financial Profile</span>
        </div>
      </div>

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

      <div style={styles.profileCard}>
        <div style={styles.cardHeader}>
          <div style={styles.headerLeft}>
            <span style={styles.headerIcon}>👤</span>
            <div>
              <h2 style={styles.cardTitle}>Your Profile Information</h2>
              <p style={styles.cardSubtitle}>Help us understand your background to better serve you</p>
            </div>
          </div>

          <div style={styles.verificationBadge}>
            <span style={styles.badgeIcon}>{verified ? "✓" : "⏳"}</span>
            <span style={verified ? styles.badgeTextVerified : styles.badgeTextPending}>
              {verified ? "Verified Borrower" : "Pending Verification"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>📞</span>
              <h3 style={styles.sectionTitle}>Contact Information</h3>
            </div>

            <div style={styles.twoColGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>📱</span>
                  Phone Number <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  style={{ ...styles.input, borderColor: fieldErrors.phone ? "#ef4444" : "#e5e7eb" }}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g., 0771234567"
                  required
                />
                {fieldErrors.phone && (
                  <span style={styles.fieldError}>{fieldErrors.phone}</span>
                )}
                <span style={styles.helperText}>Enter a valid Sri Lankan phone number (9-10 digits)</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🏘️</span>
                  Community / Area <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  style={{ ...styles.input, borderColor: fieldErrors.community ? "#ef4444" : "#e5e7eb" }}
                  name="community"
                  value={form.community}
                  onChange={handleChange}
                  placeholder="Your community or area name"
                  required
                />
                {fieldErrors.community && (
                  <span style={styles.fieldError}>{fieldErrors.community}</span>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📍</span>
                Full Address <span style={styles.requiredStar}>*</span>
              </label>
              <input
                style={{ ...styles.input, borderColor: fieldErrors.address ? "#ef4444" : "#e5e7eb" }}
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your complete address"
                required
              />
              {fieldErrors.address && (
                <span style={styles.fieldError}>{fieldErrors.address}</span>
              )}
            </div>

            <button
              type="button"
              style={styles.lookupBtn}
              onClick={handleLookupCommunity}
              disabled={lookupLoading}
            >
              <span style={styles.btnIcon}>🔍</span>
              {lookupLoading ? "Detecting..." : "Detect and match community from address"}
            </button>

            {lookupPreview && (
              <div style={styles.previewBox}>
                <div style={styles.previewHeader}>
                  <span style={styles.previewIcon}>📍</span>
                  <h4 style={styles.previewTitle}>Detected Location Details</h4>
                </div>
                <div style={styles.previewGrid}>
                  <div>
                    <p style={styles.previewLabel}>Saved Community</p>
                    <p style={styles.previewValue}>{lookupPreview.community || "Not clear"}</p>
                  </div>
                  <div>
                    <p style={styles.previewLabel}>Detected Area</p>
                    <p style={styles.previewValue}>{lookupPreview.detectedCommunity || "Not clear"}</p>
                  </div>
                  <div>
                    <p style={styles.previewLabel}>Supported Match</p>
                    <p style={styles.previewValue}>
                      {lookupPreview.matchedCommunity?.name || "No admin-defined match"}
                    </p>
                  </div>
                  <div>
                    <p style={styles.previewLabel}>Detected From</p>
                    <p style={styles.previewValue}>
                      {lookupPreview.matchedFrom
                        ? lookupPreview.matchedFrom.replace(/_/g, " ")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p style={styles.previewLabel}>Display Name</p>
                    <p style={styles.previewValue}>{lookupPreview.displayName || "N/A"}</p>
                  </div>
                  <div>
                    <p style={styles.previewLabel}>Latitude</p>
                    <p style={styles.previewValue}>{lookupPreview.latitude || "N/A"}</p>
                  </div>
                  <div>
                    <p style={styles.previewLabel}>Longitude</p>
                    <p style={styles.previewValue}>{lookupPreview.longitude || "N/A"}</p>
                  </div>
                  <div>
                    <p style={styles.previewLabel}>Supported Community Count</p>
                    <p style={styles.previewValue}>{lookupPreview.supportedCommunitiesCount ?? 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>💼</span>
              <h3 style={styles.sectionTitle}>Business & Financial Information</h3>
            </div>

            <div style={styles.twoColGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🏢</span>
                  Business Category <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  style={{ ...styles.input, borderColor: fieldErrors.businessCategory ? "#ef4444" : "#e5e7eb" }}
                  name="businessCategory"
                  value={form.businessCategory}
                  onChange={handleChange}
                  placeholder="e.g., retail, services, manufacturing"
                  required
                />
                {fieldErrors.businessCategory && (
                  <span style={styles.fieldError}>{fieldErrors.businessCategory}</span>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>💰</span>
                  Monthly Income Range <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  style={{ ...styles.input, borderColor: fieldErrors.monthlyIncomeRange ? "#ef4444" : "#e5e7eb" }}
                  name="monthlyIncomeRange"
                  value={form.monthlyIncomeRange}
                  onChange={handleChange}
                  placeholder="e.g., LKR 30,000 - 50,000"
                  required
                />
                {fieldErrors.monthlyIncomeRange && (
                  <span style={styles.fieldError}>{fieldErrors.monthlyIncomeRange}</span>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>👨‍👩‍👧‍👦</span>
                Household Size <span style={styles.requiredStar}>*</span>
              </label>
              <input
                style={{ ...styles.input, borderColor: fieldErrors.householdSize ? "#ef4444" : "#e5e7eb" }}
                type="number"
                name="householdSize"
                value={form.householdSize}
                onChange={handleChange}
                min="1"
                placeholder="Number of family members"
                required
              />
              {fieldErrors.householdSize && (
                <span style={styles.fieldError}>{fieldErrors.householdSize}</span>
              )}
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>📈</span>
              <h3 style={styles.sectionTitle}>Financial Growth Plan</h3>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                How will this loan support your business growth and financial stability? <span style={styles.requiredStar}>*</span>
              </label>
              <textarea
                style={{ ...styles.textarea, borderColor: fieldErrors.povertyImpactPlan ? "#ef4444" : "#e5e7eb" }}
                name="povertyImpactPlan"
                value={form.povertyImpactPlan}
                onChange={handleChange}
                placeholder="Describe your plan to use this loan for business expansion, income generation, skill development, or improving household financial security..."
                required
              />
              {fieldErrors.povertyImpactPlan && (
                <span style={styles.fieldError}>{fieldErrors.povertyImpactPlan}</span>
              )}
            </div>
          </div>

          <div style={styles.formActions}>
            <button type="submit" style={styles.submitBtn} disabled={saving}>
              {saving ? (
                <span style={styles.btnContent}>
                  <span style={styles.spinner}></span>
                  {profileExists ? "Updating..." : "Saving..."}
                </span>
              ) : (
                <span style={styles.btnContent}>
                  {profileExists ? "✏️ Update Profile" : "✅ Create Profile"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      <div style={styles.helpSection}>
        <div style={styles.helpCard}>
          <span style={styles.helpIcon}>💡</span>
          <div>
            <h4 style={styles.helpTitle}>Why complete your profile?</h4>
            <p style={styles.helpText}>
              A complete profile helps lenders understand your financial needs, increases trust,
              and improves your chances of loan approval. Your information is kept confidential
              and used only for loan assessment purposes.
            </p>
          </div>
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
    maxWidth: "1000px",
    margin: "0 auto 30px",
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
    maxWidth: "1000px",
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
    maxWidth: "1000px",
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

  profileCard: {
    maxWidth: "1000px",
    margin: "0 auto",
    background: "white",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "32px",
    paddingBottom: "20px",
    borderBottom: "2px solid #eff6ff",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  headerIcon: {
    fontSize: "48px",
  },

  cardTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 4px 0",
  },

  cardSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },

  verificationBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "40px",
    background: "#f3f4f6",
  },

  badgeIcon: {
    fontSize: "16px",
    fontWeight: "700",
  },

  badgeTextVerified: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#059669",
  },

  badgeTextPending: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#d97706",
  },

  section: {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "1px solid #f3f4f6",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },

  sectionIcon: {
    fontSize: "28px",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },

  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
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

  requiredStar: {
    color: "#ef4444",
    marginLeft: "4px",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
  },

  fieldError: {
    display: "block",
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "4px",
  },

  helperText: {
    display: "block",
    color: "#6b7280",
    fontSize: "11px",
    marginTop: "4px",
  },

  lookupBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.2s",
    marginTop: "8px",
  },

  btnIcon: {
    fontSize: "16px",
  },

  previewBox: {
    marginTop: "16px",
    padding: "16px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
  },

  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },

  previewIcon: {
    fontSize: "20px",
  },

  previewTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e40af",
    margin: 0,
  },

  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },

  previewLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#3b82f6",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  previewValue: {
    fontSize: "13px",
    color: "#1e3a8a",
    margin: 0,
    fontWeight: "500",
    wordBreak: "break-word",
  },

  formActions: {
    marginTop: "24px",
  },

  submitBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },

  btnContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid white",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },

  helpSection: {
    maxWidth: "1000px",
    margin: "30px auto 0",
  },

  helpCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "20px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
  },

  helpIcon: {
    fontSize: "32px",
  },

  helpTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px 0",
  },

  helpText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.5",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);