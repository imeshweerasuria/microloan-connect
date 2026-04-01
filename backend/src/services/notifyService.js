const axios = require("axios");

const NOTIFYLK_BASE_URL =
 process.env.NOTIFYLK_BASE_URL || "https://app.notify.lk/api/v1/send";
const NOTIFYLK_USER_ID = process.env.NOTIFYLK_USER_ID;
const NOTIFYLK_API_KEY = process.env.NOTIFYLK_API_KEY;
const NOTIFYLK_SENDER_ID = process.env.NOTIFYLK_SENDER_ID || "NotifyDEMO";

function normalizeSriLankanPhone(rawPhone) {
 const digits = String(rawPhone || "").replace(/\D/g, "");

 if (!digits) return null;
 if (digits.startsWith("94") && digits.length === 11) return digits;
 if (digits.startsWith("0") && digits.length === 10) return `94${digits.slice(1)}`;
 if (digits.length === 9) return `94${digits}`;

 return null;
}

async function sendSms({ to, message }) {
 if (!NOTIFYLK_USER_ID || !NOTIFYLK_API_KEY) {
   return { skipped: true, reason: "NotifyLK credentials are missing" };
 }

 const normalizedTo = normalizeSriLankanPhone(to);
 if (!normalizedTo) {
   return { skipped: true, reason: "Invalid Sri Lankan phone number" };
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

   return response.data;
 } catch (error) {
   console.error("NotifyLK SMS failed:", error?.response?.data || error.message);
   return { skipped: true, reason: "NotifyLK request failed" };
 }
}

module.exports = {
 sendSms,
 normalizeSriLankanPhone,
};
