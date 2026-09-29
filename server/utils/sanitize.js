"use strict";

const { SENSITIVE_KEYS } = require("../constants");

const maskValue = (value) => "*".repeat(Math.min(value.length, 20));

/** Recursively masks every value whose key is listed in SENSITIVE_KEYS (compared lower-cased). */
const sanitizeSensitive = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeSensitive);

  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase()) && value != null) {
      out[key] = maskValue(String(value));
    } else if (value != null && typeof value === "object" && !Array.isArray(value)) {
      out[key] = sanitizeSensitive(value);
    } else {
      out[key] = value;
    }
  }
  return out;
};

module.exports = { sanitizeSensitive };
