"use strict";

const SENSITIVE_KEYS = [
  "cardpan",
  "cardexpiredate",
  "cardcvc2",
  "iban",
  "bic",
  "bankaccount",
  "bankcode",
  "bankaccountholder",
  "key",
  "accesscode",
  "accessname",
  "token",
  "redirecturl",
  "Identifier",
  "pseudocardpan",
  "aid",
  "mid",
  "portalid",
  "portalId",
  "creditcardtoken",
  "creditcardtokenid",
  "creditcardtokenvalue",
  "creditcardtokentype",
  "creditcardtokenexpiry",
  "creditcardtokencvv",
  "creditcardtokenholder",
  "creditcardtokenbank",
];

const maskValue = (val) => {
  if (typeof val !== "string") return val;
  return "*".repeat(Math.min(val.length, 20));
};

const sanitizeSensitive = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeSensitive);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const keyLower = k.toLowerCase();
    if (SENSITIVE_KEYS.includes(keyLower) && v != null) {
      out[k] = maskValue(String(v));
    } else if (v != null && typeof v === "object" && !Array.isArray(v)) {
      out[k] = sanitizeSensitive(v);
    } else {
      out[k] = v;
    }
  }
  return out;
};

module.exports = { sanitizeSensitive };
