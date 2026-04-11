import { useState } from "react";
import client from "../api/client";

export default function FxConverter() {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("LKR");
  const [to, setTo] = useState("USD");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const commonCurrencies = ["USD", "EUR", "GBP", "LKR", "INR", "JPY", "CAD", "AUD", "CNY", "SGD"];

  const convertCurrency = async (amountValue, fromCode, toCode) => {
    if (!amountValue || Number(amountValue) <= 0) {
      setError("Please enter a valid amount");
      setResult(null);
      return;
    }

    if (!fromCode || !toCode) {
      setError("Please enter both currency codes");
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await client.get(
        `/fx/convert?amount=${encodeURIComponent(amountValue)}&from=${encodeURIComponent(
          fromCode
        )}&to=${encodeURIComponent(toCode)}`
      );

      setResult(res.data);
    } catch (err) {
      setError(err.message || "Failed to convert currency");
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    await convertCurrency(amount, from, to);
  };

  const handleQuickConvert = async (currency) => {
    if (!amount) {
      setError("Please enter an amount first");
      return;
    }

    setTo(currency);
    await convertCurrency(amount, from, currency);
  };

  const handleSwap = async () => {
    const nextFrom = to;
    const nextTo = from;

    setFrom(nextFrom);
    setTo(nextTo);
    setResult(null);
    setError("");
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Currency Converter
            <span style={styles.titleAccent}> | FX Exchange Tool</span>
          </h1>
          <p style={styles.subtitle}>
            Real-time exchange rates to help you understand international loan values
          </p>
        </div>
        <div style={styles.finBadge}>
          <span style={styles.finIcon}>💱</span>
          <span style={styles.finText}>Live Exchange Rates</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.error}>
          <span style={styles.messageIcon}>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError("")} style={styles.closeBtn}>×</button>
        </div>
      )}

      {/* Main Converter Card */}
      <div style={styles.converterCard}>
        <div style={styles.cardHeader}>
          <span style={styles.headerIcon}>💱</span>
          <div>
            <h2 style={styles.cardTitle}>Currency Exchange</h2>
            <p style={styles.cardSubtitle}>Convert between different currencies using live rates</p>
          </div>
        </div>

        <form onSubmit={handleConvert}>
          {/* Amount Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>💰</span>
              Amount to Convert
            </label>
            <div style={styles.amountInputWrapper}>
              <span style={styles.currencySymbol}>{from}</span>
              <input
                style={styles.amountInput}
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          {/* Currency Selection */}
          <div style={styles.twoColGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📤</span>
                From Currency
              </label>
              <input
                style={styles.currencyInput}
                value={from}
                onChange={(e) => setFrom(e.target.value.toUpperCase())}
                placeholder="e.g., LKR, USD, EUR"
                required
                list="currencies"
              />
              <datalist id="currencies">
                {commonCurrencies.map((currency) => (
                  <option key={currency} value={currency} />
                ))}
              </datalist>
              <p style={styles.helperText}>
                💡 Try: LKR, USD, EUR, GBP, INR
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📥</span>
                To Currency
              </label>
              <input
                style={styles.currencyInput}
                value={to}
                onChange={(e) => setTo(e.target.value.toUpperCase())}
                placeholder="e.g., USD, EUR, GBP"
                required
                list="currencies"
              />
              <p style={styles.helperText}>
                💡 Convert to major global currencies
              </p>
            </div>
          </div>

          {/* Swap Button */}
          <div style={styles.swapContainer}>
            <button
              type="button"
              style={styles.swapBtn}
              onClick={handleSwap}
            >
              <span style={styles.swapIcon}>🔄</span>
              Swap Currencies
            </button>
          </div>

          {/* Submit Button */}
          <button type="submit" style={styles.convertBtn} disabled={loading}>
            {loading ? (
              <span style={styles.btnContent}>
                <span style={styles.spinner}></span>
                Converting...
              </span>
            ) : (
              <span style={styles.btnContent}>
                <span>💱</span>
                Convert Currency
              </span>
            )}
          </button>
        </form>

        {/* Result Display */}
        {result && (
          <div style={styles.resultContainer}>
            <div style={styles.resultHeader}>
              <span style={styles.resultIcon}>📊</span>
              <h3 style={styles.resultTitle}>Conversion Result</h3>
            </div>

            <div style={styles.resultMain}>
              <div style={styles.resultAmount}>
                <span style={styles.resultFromAmount}>
                  {result.amount} {result.from}
                </span>
                <span style={styles.resultArrow}>→</span>
                <span style={styles.resultToAmount}>
                  {result.converted} {result.to}
                </span>
              </div>
            </div>

            <div style={styles.resultDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Exchange Rate</span>
                <span style={styles.detailValue}>
                  1 {result.from} = {result.rate} {result.to}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Conversion Date</span>
                <span style={styles.detailValue}>
                  {new Date(result.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={styles.infoSection}>
        <div style={styles.infoCard}>
          <span style={styles.infoIcon}>🌍</span>
          <div>
            <h4 style={styles.infoTitle}>Why currency conversion matters</h4>
            <p style={styles.infoText}>
              Understanding exchange rates helps borrowers and lenders make informed decisions
              about cross-border loans, international funding, and fair value assessment.
              This tool provides transparent rate information for better financial planning.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div style={styles.quickRefSection}>
        <div style={styles.quickRefHeader}>
          <span style={styles.quickRefIcon}>⚡</span>
          <h3 style={styles.quickRefTitle}>Quick Reference</h3>
        </div>
        <div style={styles.currencyGrid}>
          {commonCurrencies.map((currency) => (
            <button
              key={currency}
              type="button"
              style={styles.currencyChip}
              onClick={() => handleQuickConvert(currency)}
              disabled={loading}
            >
              {currency}
            </button>
          ))}
        </div>
        <p style={styles.quickRefNote}>
          Click any currency to convert your current amount instantly
        </p>
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
    maxWidth: "900px",
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

  error: {
    maxWidth: "900px",
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

  converterCard: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "white",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "32px",
    paddingBottom: "20px",
    borderBottom: "2px solid #eff6ff",
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

  formGroup: {
    marginBottom: "24px",
  },

  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    marginBottom: "10px",
    color: "#374151",
    fontSize: "14px",
  },

  labelIcon: {
    fontSize: "16px",
  },

  amountInputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },

  currencySymbol: {
    padding: "12px 16px",
    background: "#f9fafb",
    borderRight: "1px solid #e5e7eb",
    fontWeight: "600",
    color: "#374151",
    fontSize: "16px",
  },

  amountInput: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    fontSize: "16px",
    outline: "none",
  },

  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  currencyInput: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "15px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    boxSizing: "border-box",
  },

  helperText: {
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "6px",
  },

  swapContainer: {
    display: "flex",
    justifyContent: "center",
    margin: "16px 0",
  },

  swapBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  swapIcon: {
    fontSize: "16px",
  },

  convertBtn: {
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
    marginTop: "8px",
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

  resultContainer: {
    marginTop: "32px",
    padding: "24px",
    background: "#eff6ff",
    borderRadius: "16px",
    border: "1px solid #bfdbfe",
  },

  resultHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },

  resultIcon: {
    fontSize: "24px",
  },

  resultTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e40af",
    margin: 0,
  },

  resultMain: {
    textAlign: "center",
    marginBottom: "24px",
  },

  resultAmount: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  resultFromAmount: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
  },

  resultArrow: {
    fontSize: "28px",
    color: "#3b82f6",
  },

  resultToAmount: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#2563eb",
  },

  resultDetails: {
    borderTop: "1px solid #bfdbfe",
    paddingTop: "20px",
  },

  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },

  detailLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e40af",
  },

  detailValue: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1e3a8a",
  },

  infoSection: {
    maxWidth: "900px",
    margin: "30px auto 0",
  },

  infoCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "20px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
  },

  infoIcon: {
    fontSize: "32px",
  },

  infoTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px 0",
  },

  infoText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.5",
  },

  quickRefSection: {
    maxWidth: "900px",
    margin: "20px auto 0",
    padding: "20px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  quickRefHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },

  quickRefIcon: {
    fontSize: "20px",
  },

  quickRefTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },

  currencyGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "12px",
  },

  currencyChip: {
    padding: "8px 16px",
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    borderRadius: "40px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  quickRefNote: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "12px 0 0 0",
    textAlign: "center",
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);