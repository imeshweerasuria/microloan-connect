import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function roleHome(role) {
  if (role === "BORROWER") return "/borrower/dashboard";
  if (role === "LENDER") return "/lender/dashboard";
  if (role === "ADMIN") return "/admin/dashboard";
  return "/";
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "BORROWER",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Password strength validation function
  const isStrongPassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // Password strength checker for live UI
  const checkPasswordStrength = (password) => {
    if (!password) return "";
    
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) return "Weak";
    if (score <= 4) return "Medium";
    return "Strong";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check strength when typing password
    if (name === "password") {
      setStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    // Check password match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check password strength
    if (!isStrongPassword(form.password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&)"
      );
      return;
    }

    try {
      setLoading(true);

      // Remove confirmPassword before sending
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...dataToSend } = form;

      const res = await register(dataToSend);
      navigate(roleHome(res.user.role));
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const styleId = "register-page-animations";

    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement("style");
      styleSheet.id = styleId;
      styleSheet.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  return (
    <div style={styles.page}>
      {/* Background Decorative Elements */}
      <div style={styles.bgDecoration1}></div>
      <div style={styles.bgDecoration2}></div>
      
      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Logo/Brand Section */}
          <div style={styles.brandSection}>
            <div style={styles.logoIcon}>🏦</div>
            <h1 style={styles.brandName}>Micro-Loan Connect</h1>
            <p style={styles.tagline}>Financial Inclusion Platform</p>
          </div>

          {/* Financial Badge */}
          <div style={styles.finBadge}>
            <span style={styles.finIcon}>📊</span>
            <span style={styles.finText}>Join the Network</span>
          </div>

          <h2 style={styles.heading}>Create Account</h2>
          <p style={styles.sub}>
            Join our community of lenders and borrowers driving financial inclusion
          </p>

          {error && (
            <div style={styles.error}>
              <span style={styles.messageIcon}>⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError("")} style={styles.closeBtn}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>👤</span>
                Full Name
              </label>
              <input
                style={styles.input}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📧</span>
                Email Address
              </label>
              <input
                style={styles.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field with Strength Indicator */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔒</span>
                Password
              </label>
              <div style={styles.passwordWrapper}>
                <input
                  style={styles.passwordInput}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              
              {/* Password Requirements Hint */}
              <p style={styles.passwordHint}>
                Password must include uppercase, lowercase, number, and special character (@$!%*?&)
              </p>

              {/* Live Password Strength Indicator */}
              {form.password && (
                <div style={styles.strengthContainer}>
                  <div
                    style={{
                      ...styles.strengthBar,
                      background:
                        strength === "Weak"
                          ? "#ef4444"
                          : strength === "Medium"
                          ? "#f59e0b"
                          : "#2563eb",
                      width:
                        strength === "Weak"
                          ? "33%"
                          : strength === "Medium"
                          ? "66%"
                          : "100%",
                    }}
                  ></div>
                  <p style={styles.strengthText}>
                    Strength: <strong style={{ color: 
                      strength === "Weak" ? "#ef4444" : 
                      strength === "Medium" ? "#f59e0b" : 
                      "#2563eb"
                    }}>{strength}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>✓</span>
                Confirm Password
              </label>
              <div style={styles.passwordWrapper}>
                <input
                  style={styles.passwordInput}
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Live Password Match Indicator */}
              {form.confirmPassword && (
                <p style={{
                  ...styles.matchIndicator,
                  color: form.password === form.confirmPassword ? "#2563eb" : "#ef4444"
                }}>
                  {form.password === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🎭</span>
                I want to join as a
              </label>
              <div style={styles.roleCards}>
                <div
                  style={{
                    ...styles.roleCard,
                    ...(form.role === "BORROWER" && styles.roleCardActive),
                  }}
                  onClick={() => setForm({ ...form, role: "BORROWER" })}
                >
                  <span style={styles.roleIcon}>📝</span>
                  <div>
                    <strong>Borrower</strong>
                    <p style={styles.roleDesc}>Request loans for your needs</p>
                  </div>
                </div>
                <div
                  style={{
                    ...styles.roleCard,
                    ...(form.role === "LENDER" && styles.roleCardActive),
                  }}
                  onClick={() => setForm({ ...form, role: "LENDER" })}
                >
                  <span style={styles.roleIcon}>💰</span>
                  <div>
                    <strong>Lender</strong>
                    <p style={styles.roleDesc}>Fund loans and earn returns</p>
                  </div>
                </div>
                {/* ADMIN Role Card - Remove this block if admin self-registration should not be allowed */}
                <div
                  style={{
                    ...styles.roleCard,
                    ...(form.role === "ADMIN" && styles.roleCardActive),
                    gridColumn: "1 / -1",
                  }}
                  onClick={() => setForm({ ...form, role: "ADMIN" })}
                >
                  <span style={styles.roleIcon}>🛡️</span>
                  <div>
                    <strong>Admin</strong>
                    <p style={styles.roleDesc}>Manage loans, users, and approvals</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div style={styles.termsGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>
                  I agree to the <Link to="/terms" style={styles.termsLink}>Terms & Conditions</Link> and{" "}
                  <Link to="/privacy" style={styles.termsLink}>Privacy Policy</Link>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? (
                <span style={styles.btnContent}>
                  <span style={styles.spinner}></span>
                  Creating account...
                </span>
              ) : (
                <span style={styles.btnContent}>
                  <span>🚀</span>
                  Join the Platform
                </span>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>Already have an account?</span>
            <span style={styles.dividerLine}></span>
          </div>

          <div style={styles.loginSection}>
            <Link to="/login" style={styles.loginLink}>
              Sign In Here
            </Link>
            <p style={styles.loginText}>
              Welcome back! Login to continue your journey
            </p>
          </div>

          {/* Impact Info */}
          <div style={styles.impactInfo}>
            <div style={styles.impactHeader}>
              <span style={styles.impactIcon}>📈</span>
              <span style={styles.impactTitle}>Why Join Us?</span>
            </div>
            <div style={styles.impactGrid}>
              <div style={styles.impactPoint}>
                <span>✓</span>
                <span>Zero platform fees</span>
              </div>
              <div style={styles.impactPoint}>
                <span>✓</span>
                <span>Direct impact tracking</span>
              </div>
              <div style={styles.impactPoint}>
                <span>✓</span>
                <span>Community support</span>
              </div>
              <div style={styles.impactPoint}>
                <span>✓</span>
                <span>Transparent process</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    position: "relative",
    overflow: "hidden",
  },
  
  bgDecoration1: {
    position: "absolute",
    top: "-50%",
    right: "-30%",
    width: "80%",
    height: "80%",
    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  
  bgDecoration2: {
    position: "absolute",
    bottom: "-50%",
    left: "-30%",
    width: "80%",
    height: "80%",
    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    zIndex: 1,
  },
  
  card: {
    width: "100%",
    maxWidth: "560px",
    background: "white",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    animation: "slideUp 0.5s ease-out",
  },
  
  brandSection: {
    textAlign: "center",
    marginBottom: "24px",
  },
  
  logoIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  
  brandName: {
    fontSize: "24px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 4px 0",
  },
  
  tagline: {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0,
  },
  
  finBadge: {
    background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
    padding: "8px 16px",
    borderRadius: "40px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 auto 24px",
    width: "fit-content",
    boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
  },
  
  finIcon: {
    fontSize: "16px",
  },
  
  finText: {
    color: "white",
    fontWeight: "600",
    fontSize: "12px",
  },
  
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px 0",
    textAlign: "center",
  },
  
  sub: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 28px 0",
    textAlign: "center",
  },
  
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    borderLeft: "3px solid #ef4444",
  },
  
  messageIcon: {
    fontSize: "18px",
  },
  
  closeBtn: {
    marginLeft: "auto",
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#991b1b",
    padding: "0 4px",
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
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    boxSizing: "border-box",
  },
  
  passwordWrapper: {
    position: "relative",
  },
  
  passwordInput: {
    width: "100%",
    padding: "12px 14px",
    paddingRight: "44px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    boxSizing: "border-box",
  },
  
  passwordToggle: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    padding: "4px",
  },
  
  passwordHint: {
    fontSize: "11px",
    color: "#9ca3af",
    marginTop: "6px",
  },
  
  strengthContainer: {
    marginTop: "8px",
  },
  
  strengthBar: {
    height: "4px",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
  
  strengthText: {
    fontSize: "11px",
    marginTop: "4px",
    color: "#6b7280",
  },
  
  matchIndicator: {
    fontSize: "11px",
    marginTop: "6px",
  },
  
  roleCards: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  
  roleCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  
  roleCardActive: {
    borderColor: "#2563eb",
    background: "#eff6ff",
  },
  
  roleIcon: {
    fontSize: "28px",
  },
  
  roleDesc: {
    fontSize: "11px",
    color: "#6b7280",
    margin: "4px 0 0 0",
  },
  
  termsGroup: {
    marginBottom: "24px",
  },
  
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#6b7280",
    cursor: "pointer",
  },
  
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  
  termsLink: {
    color: "#3b82f6",
    textDecoration: "none",
  },
  
  button: {
    width: "100%",
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    color: "white",
    border: "none",
    padding: "14px",
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
  
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    margin: "24px 0",
  },
  
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e5e7eb",
  },
  
  dividerText: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  
  loginSection: {
    textAlign: "center",
  },
  
  loginLink: {
    display: "inline-block",
    padding: "12px 24px",
    background: "#f3f4f6",
    color: "#374151",
    textDecoration: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.2s",
    marginBottom: "12px",
  },
  
  loginText: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: 0,
  },
  
  impactInfo: {
    marginTop: "24px",
    padding: "16px",
    background: "#eff6ff",
    borderRadius: "12px",
    border: "1px solid #bfdbfe",
  },
  
  impactHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  
  impactIcon: {
    fontSize: "18px",
  },
  
  impactTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e40af",
  },
  
  impactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
  },
  
  impactPoint: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#1e3a8a",
  },
};