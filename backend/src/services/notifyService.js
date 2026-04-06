const axios = require("axios");

const NOTIFYLK_BASE_URL =
  process.env.NOTIFYLK_BASE_URL || "https://app.notify.lk/api/v1/send";

// Check both env naming styles: NOTIFYLK_* first, then NOTIFY_LK_*
const NOTIFYLK_USER_ID = process.env.NOTIFYLK_USER_ID || process.env.NOTIFY_LK_USER_ID;
const NOTIFYLK_API_KEY = process.env.NOTIFYLK_API_KEY || process.env.NOTIFY_LK_API_KEY;
const NOTIFYLK_SENDER_ID = process.env.NOTIFYLK_SENDER_ID || process.env.NOTIFY_LK_SENDER_ID || "NotifyDEMO";

function normalizeSriLankanPhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");

  if (!digits) return null;
  if (digits.startsWith("94") && digits.length === 11) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `94${digits.slice(1)}`;
  if (digits.length === 9) return `94${digits}`;

  return null;
}

async function sendSms({ to, message }) {
  // Check credentials and return skipped result instead of crashing
  if (!NOTIFYLK_USER_ID || !NOTIFYLK_API_KEY) {
    return { success: false, skipped: true, reason: "NotifyLK credentials are missing" };
  }

  // Validate and normalize phone number
  const normalizedTo = normalizeSriLankanPhone(to);
  if (!normalizedTo) {
    return { success: false, skipped: true, reason: "Invalid Sri Lankan phone number" };
  }

  const safeMessage = String(message || "").slice(0, 620);

  try {
    const response = await axios.get(NOTIFYLK_BASE_URL, {
      params: {
        user_id: NOTIFYLK_USER_ID,
        api_key: NOTIFYLK_API_KEY,
        sender_id: NOTIFYLK_SENDER_ID,
        to: normalizedTo,
        message: safeMessage,
      },
      timeout: 10000,
    });

    // Return success with response data
    return { 
      success: true, 
      skipped: false, 
      data: response.data 
    };
  } catch (error) {
    console.error("NotifyLK SMS failed:", error?.response?.data || error.message);
    // Return skipped result instead of crashing
    return { 
      success: false, 
      skipped: true, 
      reason: "NotifyLK request failed",
      error: error?.response?.data || error.message 
    };
  }
}

module.exports = {
  sendSms,
  normalizeSriLankanPhone,
};