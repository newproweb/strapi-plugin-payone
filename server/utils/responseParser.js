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
    // Store both lowercase and original case
    response[key.toLowerCase()] = value;
    response[key] = value;
    
    // Also handle add_paydata fields with brackets
    // Payone returns: add_paydata[applepay_payment_session]=BASE64_STRING
    // URLSearchParams handles brackets, but we need to ensure we can access it
    if (key.includes('add_paydata') || key.includes('addPaydata')) {
      // Store with original key format
      response[key] = value;
      // Also try normalized versions
      const normalizedKey = key.replace(/\[/g, '_').replace(/\]/g, '');
      response[normalizedKey] = value;
    }
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
  const errorCode = data.errorcode || data.ErrorCode || data.Error?.ErrorCode;
  
  // Check for redirect URL in various possible fields
  const redirecturl = 
    data.redirecturl || 
    data.RedirectUrl || 
    data.redirect_url ||
    data.redirectUrl ||
    data.RedirectURL ||
    data.redirectURL ||
    data.url ||
    data.Url ||
    data.URL ||
    null;

  // 3DS required error codes (4219, etc.)
  const requires3DSErrorCodes = ["4219", 4219];
  const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);

  return (status === "REDIRECT" && !!redirecturl) || is3DSRequiredError;
};

/**
 * Check if response indicates an error
 * @param {Object} data - Response data
 * @returns {boolean} True if response indicates error
 */
const isErrorResponse = (data) => {
  const status = (data.status || data.Status || "").toUpperCase();
  const errorCode = data.errorcode || data.ErrorCode || data.Error?.ErrorCode;
  
  return status === "ERROR" || status === "INVALID" || !!errorCode;
};

/**
 * Extract 3D Secure redirect URL from response
 * @param {Object} data - Response data
 * @returns {string|null} Redirect URL
 */
const get3DSRedirectUrl = (data) => {
  // Check all possible redirect URL fields
  const redirecturl = 
    data.redirecturl || 
    data.RedirectUrl || 
    data.redirect_url ||
    data.redirectUrl ||
    data.RedirectURL ||
    data.redirectURL ||
    data.url ||
    data.Url ||
    data.URL ||
    data.redirect ||
    data.Redirect ||
    null;

  if (redirecturl) {
    return redirecturl;
  }

  // If 3DS required but no redirect URL, might need 3dscheck
  const errorCode = data.errorcode || data.ErrorCode || data.Error?.ErrorCode;
  const requires3DSErrorCodes = ["4219", 4219];
  if (requires3DSErrorCodes.includes(errorCode)) {
    // Return null - will need to handle 3dscheck separately
    return null;
  }

  return null;
};

module.exports = {
  parseResponse,
  extractTxId,
  requires3DSRedirect,
  get3DSRedirectUrl,
  isErrorResponse
};

