const axios = require("axios");
const AppError = require("../utils/AppError");

// Frankfurter public API (no key)
const FX_BASE_URL = process.env.EXCHANGE_API_BASE_URL || "https://api.frankfurter.dev/v1";

// simple in-memory cache to reduce calls
const cache = new Map(); // key = "LKR->USD", value = { rate, date, ts }
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

async function getRate(from, to) {
  const base = String(from || "").toUpperCase();
  const target = String(to || "").toUpperCase();
  if (!base || !target) throw new AppError("from/to currency required", 400);
  if (base === target) return { rate: 1, date: new Date().toISOString().slice(0, 10) };

  const key = `${base}->${target}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return { rate: cached.rate, date: cached.date };
  }

  try {
    const url = `${FX_BASE_URL}/latest?base=${encodeURIComponent(base)}&symbols=${encodeURIComponent(target)}`;
    const resp = await axios.get(url, { timeout: 8000 });

    const rate = resp.data?.rates?.[target];
    const date = resp.data?.date;

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
  return Math.round(converted * 100) / 100; // 2dp
}

module.exports = { getRate, convertAmount };
