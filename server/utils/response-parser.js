"use strict";

const { REDIRECT_URL_KEYS, THREE_DS_REQUIRED_ERROR_CODES, TX_ID_KEYS } = require("../constants");

const firstValue = (data, keys) => keys.map((key) => data[key]).find(Boolean) || null;

const errorCodeOf = (data) => data.errorcode || data.ErrorCode || data.Error?.ErrorCode;

const isThreeDSRequiredCode = (errorCode) => THREE_DS_REQUIRED_ERROR_CODES.includes(errorCode);

/** Parses a `{…}` string as JSON; returns null for anything else or when parsing fails. */
const parseJsonBody = (text, onError) => {
  try {
    return text.trim().startsWith("{") ? JSON.parse(text) : null;
  } catch (e) {
    if (onError) onError(e);
    return null;
  }
};

/**
 * Parses a Payone post-gateway response. Objects pass through, JSON strings are parsed, and
 * `key=value&…` bodies are stored under both the original and the lower-cased key.
 */
const parseResponse = (responseText, logger) => {
  if (typeof responseText === "object") return responseText;

  const json = parseJsonBody(responseText, (e) => logger && logger.error("Payone parseResponse error:", e));
  if (json) return json;

  const response = {};
  for (const [key, value] of new URLSearchParams(responseText)) {
    response[key.toLowerCase()] = value;
    response[key] = value;
    if (key.includes("add_paydata") || key.includes("addPaydata")) {
      response[key.replace(/\[/g, "_").replace(/\]/g, "")] = value;
    }
  }
  return response;
};

/**
 * Parses the Apple Pay `genericpayment` response. URL-encoded bodies also get a lower-cased
 * `add_paydata_…` alias; objects get `add_paydata.applepay_payment_session` mirrored.
 */
const parseApplePayResponse = (responseData) => {
  if (typeof responseData === "string") {
    const json = parseJsonBody(responseData);
    if (json) return json;

    const parsed = {};
    for (const [key, value] of new URLSearchParams(responseData).entries()) {
      parsed[key] = value;
      const normalizedKey = key.toLowerCase().replace(/\[/g, "_").replace(/\]/g, "");
      if (normalizedKey !== key.toLowerCase()) parsed[normalizedKey] = value;
    }
    return parsed;
  }

  if (typeof responseData === "object" && responseData !== null) {
    const result = { ...responseData };
    if (result["add_paydata[applepay_payment_session]"]) {
      result.add_paydata = result.add_paydata || {};
      result.add_paydata.applepay_payment_session = result["add_paydata[applepay_payment_session]"];
    }
    return result;
  }

  return responseData;
};

const extractTxId = (data) => firstValue(data, TX_ID_KEYS);

const requires3DSRedirect = (data) => {
  const status = (data.status || data.Status || "").toUpperCase();
  const redirectUrl = firstValue(data, REDIRECT_URL_KEYS);
  return (status === "REDIRECT" && !!redirectUrl) || isThreeDSRequiredCode(errorCodeOf(data));
};

const get3DSRedirectUrl = (data) => firstValue(data, [...REDIRECT_URL_KEYS, "redirect", "Redirect"]);

module.exports = {
  parseResponse,
  parseApplePayResponse,
  extractTxId,
  requires3DSRedirect,
  get3DSRedirectUrl,
  isThreeDSRequiredCode
};
