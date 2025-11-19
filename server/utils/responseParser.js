"use strict";

/**
 * Parse Payone API response
 * @param {string|Object} responseText - Response text or object
 * @param {Object} logger - Logger instance
 * @returns {Object} Parsed response
 */
const parseResponse = (responseText, logger) => {
  try {
    if (typeof responseText === "object") {
      return responseText;
    }
    if (responseText.trim().startsWith("{")) {
      return JSON.parse(responseText);
    }
  } catch (e) {
    if (logger) {
      logger.error("Payone parseResponse error:", e);
    }
  }

  // Parse URL-encoded response
  const params = new URLSearchParams(responseText);
  const response = {};
  for (const [key, value] of params) {
    response[key.toLowerCase()] = value;
    response[key] = value;
  }
  return response;
};

/**
 * Extract transaction ID from response
 * @param {Object} data - Response data
 * @returns {string|null} Transaction ID
 */
const extractTxId = (data) => {
  return (
    data.txid ||
    data.TxId ||
    data.tx_id ||
    data.transactionid ||
    data.transaction_id ||
    data.id ||
    null
  );
};

/**
 * Check if response requires 3D Secure redirect
 * @param {Object} data - Response data
 * @returns {boolean} True if 3DS redirect is required
 */
const requires3DSRedirect = (data) => {
  const status = (data.status || data.Status || "").toUpperCase();
  const redirecturl = data.redirecturl || data.RedirectUrl || data.redirect_url;

  return status === "REDIRECT" && !!redirecturl;
};

/**
 * Extract 3D Secure redirect URL from response
 * @param {Object} data - Response data
 * @returns {string|null} Redirect URL
 */
const get3DSRedirectUrl = (data) => {
  if (requires3DSRedirect(data)) {
    return data.redirecturl || data.RedirectUrl || data.redirect_url || null;
  }
  return null;
};

module.exports = {
  parseResponse,
  extractTxId,
  requires3DSRedirect,
  get3DSRedirectUrl
};

