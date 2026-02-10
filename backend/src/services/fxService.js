const axios = require("axios");
const AppError = require("../utils/AppError");

const FX_BASE_URL = process.env.EXCHANGE_API_BASE_URL || "https://api.currencyapi.com/v3/latest";
const FX_API_KEY = process.env.EXCHANGE_API_KEY;

// cache
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

async function getRate(from, to) {
  const base = String(from || "").trim().toUpperCase();
  const target = String(to || "").trim().toUpperCase();

  if (!base || !target) throw new AppError("from/to currency required", 400);
  if (base === target) return { rate: 1, date: new Date().toISOString().slice(0, 10) };

  if (!FX_API_KEY) throw new AppError("FX API key missing (EXCHANGE_API_KEY)", 500);

  const key = `${base}->${target}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return { rate: cached.rate, date: cached.date };
  }

  try {
    // CurrencyAPI format:
    // GET https://api.currencyapi.com/v3/latest?apikey=KEY&base_currency=LKR&currencies=USD
    const resp = await axios.get(FX_BASE_URL, {
      params: {
        apikey: FX_API_KEY,
        base_currency: base,
        currencies: target
      },
      timeout: 8000
    });

    // CurrencyAPI response shape: { data: { USD: { value: 0.0031 } }, meta: { last_updated_at: ... } }
    const rate = resp.data?.data?.[target]?.value;
    const dateRaw = resp.data?.meta?.last_updated_at || new Date().toISOString();
    const date = String(dateRaw).slice(0, 10);

    if (!rate) throw new AppError("FX rate not available", 502);

    cache.set(key, { rate, date, ts: Date.now() });
    return { rate, date };
  } catch (err) {
    throw new AppError("FX service unavailable", 503);
  }
}

function convertAmount(amount, rate) {
  const n = Number(amount);
  const r = Number(rate);
  const converted = n * r;
  return Math.round(converted * 100) / 100;
}

module.exports = { getRate, convertAmount };