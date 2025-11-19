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

  if (logger) {
    logger.info("3DS Configuration Check:", {
      isCreditCard,
      enable3DSecure,
      requestType: params.request,
      settingsEnable3DSecure: settings.enable3DSecure,
      params3dsecure: params["3dsecure"],
      paramsEnable3DSecure: params.enable3DSecure
    });
  }

  if (isCreditCard && enable3DSecure && (params.request === "preauthorization" || params.request === "authorization")) {
    // 3D Secure is enabled for credit card payments
    requestParams["3dsecure"] = "yes";
    requestParams.ecommercemode = params.ecommercemode || "internet";

    // Ensure redirect URLs are provided for 3DS (required by Payone)
    if (!requestParams.successurl) {
      requestParams.successurl = params.successurl || "https://www.example.com/success";
      if (logger) {
        logger.warn("3DS enabled but successurl not provided, using default");
      }
    }
    if (!requestParams.errorurl) {
      requestParams.errorurl = params.errorurl || "https://www.example.com/error";
      if (logger) {
        logger.warn("3DS enabled but errorurl not provided, using default");
      }
    }
    if (!requestParams.backurl) {
      requestParams.backurl = params.backurl || "https://www.example.com/back";
      if (logger) {
        logger.warn("3DS enabled but backurl not provided, using default");
      }
    }

    if (logger) {
      logger.info("✅ 3D Secure ENABLED for credit card payment", {
        "3dsecure": requestParams["3dsecure"],
        ecommercemode: requestParams.ecommercemode,
        successurl: requestParams.successurl,
        errorurl: requestParams.errorurl,
        backurl: requestParams.backurl
      });
    }
  } else if (isCreditCard && !enable3DSecure) {
    // Explicitly disable 3DS if setting is false
    requestParams["3dsecure"] = "no";
    // Remove redirect URLs if not needed (they're not required for non-3DS credit card payments)
    // But keep them if they were provided (might be needed for other reasons)
    if (logger) {
      logger.info("❌ 3D Secure DISABLED for credit card payment - redirect URLs not required", {
        "3dsecure": requestParams["3dsecure"]
      });
    }
  } else if (isCreditCard && (params.request === "preauthorization" || params.request === "authorization")) {
    // Credit card but 3DS not enabled in settings
    if (logger) {
      logger.info("⚠️ Credit card payment but 3DS not enabled in settings", {
        enable3DSecure,
        settingsEnable3DSecure: settings.enable3DSecure
      });
    }
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

