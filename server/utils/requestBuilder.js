"use strict";

const crypto = require("crypto");
const { normalizeCustomerId } = require("./normalize");

/**
 * Build client request parameters for Payone API
 * @param {Object} settings - Payone settings
 * @param {Object} params - Request parameters
 * @param {Object|null} logger - Logger instance
 * @returns {Object} Built request parameters
 */
const buildClientRequestParams = (settings, params, logger = null) => {
  const requestParams = {
    request: params.request,
    aid: settings.aid,
    mid: settings.mid,
    portalid: settings.portalid,
    mode: settings.mode || "test",
    encoding: "UTF-8",
    ...params
  };

  // Generate MD5 hash key
  requestParams.key = crypto
    .createHash("md5")
    .update(settings.portalKey || settings.key)
    .digest("hex");

  // Normalize customer ID
  requestParams.customerid = normalizeCustomerId(
    requestParams.customerid,
    logger
  );

  // Set default values
  const defaults = {
    salutation: "Herr",
    gender: "m",
    telephonenumber: "01752345678",
    ip: "127.0.0.1",
    language: "de",
    customer_is_present: "yes"
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (!requestParams[key]) {
      requestParams[key] = value;
    }
  });

  return requestParams;
};

/**
 * Convert request parameters to form data
 * @param {Object} requestParams - Request parameters
 * @returns {URLSearchParams} Form data
 */
const toFormData = (requestParams) => {
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(requestParams)) {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  }
  return formData;
};

module.exports = {
  buildClientRequestParams,
  toFormData
};

