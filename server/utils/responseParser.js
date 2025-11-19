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

module.exports = {
  parseResponse,
  extractTxId
};

