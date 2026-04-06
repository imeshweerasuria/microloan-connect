import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function roleHome(role) {
  if (role === "BORROWER") return "/borrower/dashboard";
  if (role === "LENDER") return "/lender/dashboard";
  if (role === "ADMIN") return "/admin/dashboard";
  return "/";
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fromPath = location.state?.from || "";

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await login(form);

      if (fromPath) {
        navigate(fromPath);
        return;
      }

      navigate(roleHome(res.user.role));
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background Decorative Elements */}
      <div style={styles.bgDecoration1}></div>
      <div style={styles.bgDecoration2}></div>
      
      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Logo/Brand Section */}
          <div style={styles.brandSection}>
            <div style={styles.logoIcon}>💰</div>
            <h1 style={styles.brandName}>Micro-Loan Connect</h1>
            <p style={styles.tagline}>Empowering Communities, Ending Poverty</p>
          </div>

          {/* SDG Badge */}
          <div style={styles.sdgBadge}>
            <span style={styles.sdgIcon}>🎯</span>
            <span style={styles.sdgText}>SDG Goal 1: No Poverty</span>
          </div>

          <h2 style={styles.heading}>Welcome Back</h2>
          <p style={styles.sub}>
            Sign in to continue your journey in financial inclusion
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
                  placeholder="Enter your password"
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
            </div>

            <div style={styles.formOptions}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" style={styles.checkbox} />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? (
                <span style={styles.btnContent}>
                  <span style={styles.spinner}></span>
                  Logging in...
                </span>
              ) : (
                <span style={styles.btnContent}>
                  <span>🚀</span>
                  Login to Dashboard
                </span>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>New to our platform?</span>
            <span style={styles.dividerLine}></span>
          </div>

          <div style={styles.registerSection}>
            <Link to="/register" style={styles.registerLink}>
              Create an Account
            </Link>
            <p style={styles.registerText}>
              Join our community of changemakers fighting poverty through micro-loans
            </p>
          </div>

          {/* Demo Credentials Info */}
          <div style={styles.demoInfo}>
            <p style={styles.demoTitle}>Demo Credentials</p>
            <div style={styles.demoGrid}>
              <div>
                <strong>Borrower:</strong><br />
                borrower@example.com<br />
                <span style={styles.demoPass}>password123</span>
              </div>
              <div>
                <strong>Lender:</strong><br />
                lender@example.com<br />
                <span style={styles.demoPass}>password123</span>
              </div>
              <div>
                <strong>Admin:</strong><br />
                admin@example.com<br />
                <span style={styles.demoPass}>password123</span>
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
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    maxWidth: "480px",
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
    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 4px 0",
  },
  
  tagline: {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0,
  },
  
  sdgBadge: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    padding: "8px 16px",
    borderRadius: "40px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: "0 auto 24px",
    width: "fit-content",
    boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
  },
  
  sdgIcon: {
    fontSize: "16px",
  },
  
  sdgText: {
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
    ":focus": {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59,130,246,0.1)",
    },
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
    ":focus": {
      borderColor: "#3b82f6",
      boxShadow: "0 0 0 3px rgba(59,130,246,0.1)",
    },
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
  
  formOptions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#6b7280",
    cursor: "pointer",
  },
  
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  
  forgotLink: {
    fontSize: "13px",
    color: "#3b82f6",
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline",
    },
  },
  
  button: {
    width: "100%",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.1s",
    ":active": {
      transform: "scale(0.98)",
    },
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
  
  registerSection: {
    textAlign: "center",
  },
  
  registerLink: {
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
    ":hover": {
      background: "#e5e7eb",
    },
  },
  
  registerText: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: 0,
  },
  
  demoInfo: {
    marginTop: "28px",
    padding: "16px",
    background: "#f9fafb",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  
  demoTitle: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    margin: "0 0 12px 0",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  
  demoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    fontSize: "11px",
    color: "#374151",
    textAlign: "center",
  },
  
  demoPass: {
    color: "#10b981",
    fontFamily: "monospace",
    fontSize: "10px",
  },
};

// Add animation keyframes
const styleSheet = document.createElement("style");
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