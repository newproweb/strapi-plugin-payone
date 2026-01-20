"use strict";

const normalizeReference = (input, fallbackPrefix = "REF") => {
  try {
    const raw = input == null ? "" : String(input);
    let normalized = raw.replace(/[^A-Za-z0-9]/g, "");

    if (!normalized) {
      normalized = `${fallbackPrefix}${Date.now()}`;
    }

    return normalized.length > 20 ? normalized.slice(0, 20) : normalized;
  } catch (_) {
    const fallback = `${fallbackPrefix}${Date.now()}`;
    return fallback.slice(0, 20);
  }
};

const normalizeCustomerId = (customerid, logger = null) => {
  if (!customerid) {
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${timestamp}${random}`.slice(0, 17);
  }

  const normalized = String(customerid).slice(0, 17);
  if (customerid.length > 17 && logger) {
    logger.warn(
      `customerid exceeds 17 characters: ${customerid.length}, truncated to: ${normalized}`
    );
  }
  return normalized;
};

module.exports = {
  normalizeReference,
  normalizeCustomerId
};

