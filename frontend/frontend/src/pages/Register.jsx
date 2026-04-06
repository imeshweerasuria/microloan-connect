import { useState } from "react";
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
    confirmPassword: "", // ✅ added confirmPassword
    role: "BORROWER",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(""); // ✅ password strength state
  const [showPassword, setShowPassword] = useState(false); // ✅ show/hide password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // ✅ show/hide confirm password

  // ✅ Password strength validation function
  const isStrongPassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  // ✅ Password strength checker for live UI
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

    // ✅ check strength when typing password
    if (name === "password") {
      setStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ check password match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // ✅ check password strength
    if (!isStrongPassword(form.password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    try {
      setLoading(true);

      // ✅ remove confirmPassword before sending
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

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Create Account</h2>
        <p style={styles.sub}>
          Register as a borrower, lender, or admin to start using the platform.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label style={styles.label}>Password</label>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              style={styles.input}
              type={showPassword ? "text" : "password"} // ✅ toggle
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "13px",
                color: "#555",
                userSelect: "none",
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* ✅ Password rules hint */}
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px" }}>
            Password must include uppercase, lowercase, number, special character and be at least 8 characters.
          </p>

          {/* ✅ Live password strength indicator */}
          {form.password && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  height: "6px",
                  borderRadius: "4px",
                  background:
                    strength === "Weak"
                      ? "red"
                      : strength === "Medium"
                      ? "orange"
                      : "green",
                  width:
                    strength === "Weak"
                      ? "33%"
                      : strength === "Medium"
                      ? "66%"
                      : "100%",
                  transition: "0.3s",
                }}
              ></div>
              <p style={{ fontSize: "12px", marginTop: "4px" }}>
                Strength: <strong>{strength}</strong>
              </p>
            </div>
          )}

          <label style={styles.label}>Confirm Password</label>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <input
              style={styles.input}
              type={showConfirmPassword ? "text" : "password"} // ✅ toggle
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />

            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "13px",
                color: "#555",
                userSelect: "none",
              }}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* ✅ Live password match indicator */}
          {form.confirmPassword && (
            <p
              style={{
                fontSize: "12px",
                color: form.password === form.confirmPassword ? "green" : "red",
                marginBottom: "10px",
              }}
            >
              {form.password === form.confirmPassword
                ? "✓ Passwords match"
                : "✗ Passwords do not match"}
            </p>
          )}

          <label style={styles.label}>Role</label>
          <select
            style={styles.input}
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="BORROWER">Borrower</option>
            <option value="LENDER">Lender</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={styles.text}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7fb",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    background: "#fff",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  },
  heading: {
    marginBottom: "10px",
    textAlign: "center",
  },
  sub: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "0px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#16a34a",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  text: {
    marginTop: "16px",
    textAlign: "center",
    fontSize: "14px",
  },
};