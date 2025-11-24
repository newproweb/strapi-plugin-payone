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

  // Add 3D Secure parameters if enabled and for credit card payments
  const isCreditCard = requestParams.clearingtype === "cc";
  // Enable 3DS if setting is true or not explicitly false (default to enabled if not set)
  const enable3DSecure = settings.enable3DSecure !== false;

  if (isCreditCard && enable3DSecure && (params.request === "preauthorization" || params.request === "authorization")) {
    requestParams["3dsecure"] = "yes";
    requestParams.ecommercemode = params.ecommercemode || "internet";

    // Ensure redirect URLs are always provided for 3DS
    // These are required for 3DS authentication flow
    if (!requestParams.successurl) {
      requestParams.successurl = params.successurl || "https://www.example.com/success";
    }
    if (!requestParams.errorurl) {
      requestParams.errorurl = params.errorurl || "https://www.example.com/error";
    }
    if (!requestParams.backurl) {
      requestParams.backurl = params.backurl || "https://www.example.com/back";
    }

    // Log redirect URLs for debugging
    if (logger) {
      logger.info("3DS Redirect URLs:", {
        successurl: requestParams.successurl,
        errorurl: requestParams.errorurl,
        backurl: requestParams.backurl
      });
    }
  } else if (isCreditCard && !enable3DSecure) {
    requestParams["3dsecure"] = "no";
  }

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

  // Remove cardtype if clearingtype is wallet payment
  if (requestParams.clearingtype === "wlt" && requestParams.cardtype) {
    delete requestParams.cardtype;
  }

  // Ensure wallettype is set for wallet payments
  if (requestParams.clearingtype === "wlt" && !requestParams.wallettype) {
    if (requestParams["add_paydata[paymentmethod_token_data]"]) {
      requestParams.wallettype = "GGP";
    } else {
      requestParams.wallettype = "PPE";
    }
  }

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

