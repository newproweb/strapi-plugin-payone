"use strict";

const axios = require("axios");
const { buildClientRequestParams, toFormData } = require("../utils/requestBuilder");
const { getSettings, validateSettings } = require("./settingsService");

const POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";

/**
 * Initialize Apple Pay session with Payone
 * According to Payone documentation:
 * https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev
 * 
 * Request: genericpayment
 * Required parameters:
 * - request="genericpayment"
 * - clearingtype="wlt"
 * - wallettype="APL"
 * - add_paydata[action]="init_applepay_session"
 * - add_paydata[display_name]="Store Name"
 * - add_paydata[domain_name]="yourdomain.com"
 */
const initializeApplePaySession = async (strapi, params) => {
  try {
    strapi.log.info("[Apple Pay] Initializing Apple Pay session with Payone");
    strapi.log.info("[Apple Pay] Request params:", JSON.stringify(params, null, 2));

    const settings = await getSettings(strapi);

    if (!validateSettings(settings)) {
      strapi.log.error("[Apple Pay] Payone settings not configured");
      throw new Error("Payone settings not configured");
    }

    strapi.log.info("[Apple Pay] Settings loaded:", {
      mode: settings.mode,
      mid: settings.mid,
      portalid: settings.portalid,
      hasKey: !!settings.key
    });

    const {
      displayName,
      domainName,
      mid,
      portalid
    } = params;

    // Get merchant data from settings (test or live mode)
    const merchantName = displayName || settings.merchantName || settings.displayName || "Test Store";
    const merchantId = mid || settings.mid || settings.merchantIdentifier;
    const portalId = portalid || settings.portalid;
    const accountId = settings.aid;
    const apiKey = settings.key;
    const mode = settings.mode || "test"; // test or live

    // Get domain from params or settings or server config
    const domain = domainName || settings.domainName ||
      (strapi.config.get("server.url") ? new URL(strapi.config.get("server.url")).hostname : null) ||
      "localhost";

    // Build request parameters for Apple Pay session initialization
    // According to Payone documentation: request="genericpayment"
    const requestParams = {
      request: "genericpayment",
      mid: merchantId,
      aid: accountId,
      portalid: portalId,
      key: apiKey,
      mode: mode, // Use test or live mode from settings
      clearingtype: "wlt",
      wallettype: "APL",
      currency: "EUR", // Default, can be overridden
      "add_paydata[action]": "init_applepay_session",
      "add_paydata[display_name]": merchantName,
      "add_paydata[domain_name]": domain
    };

    strapi.log.info("[Apple Pay] Sending request to Payone:", {
      url: POST_GATEWAY_URL,
      mode: mode,
      merchantName: merchantName,
      domain: domain,
      merchantId: merchantId,
      portalId: portalId
    });

    const formData = toFormData(requestParams);

    strapi.log.info("[Apple Pay] Sending request to Payone API:", {
      url: POST_GATEWAY_URL,
      params: {
        ...requestParams,
        key: "***HIDDEN***" // Hide API key in logs
      }
    });

    let response;
    try {
      response = await axios.post(POST_GATEWAY_URL, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 30000
      });
    } catch (axiosError) {
      strapi.log.error("[Apple Pay] Payone API request failed:", {
        message: axiosError.message,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method
        }
      });
      throw axiosError;
    }

    strapi.log.info("[Apple Pay] Payone response received:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });

    // Parse response
    const responseData = parseResponse(response.data, strapi.log);

    strapi.log.info("[Apple Pay] Session initialization response:", JSON.stringify(responseData, null, 2));
    strapi.log.info("[Apple Pay] Response status:", responseData.status || responseData.Status);

    if (responseData.errorcode || responseData.ErrorCode) {
      strapi.log.warn("[Apple Pay] Response contains error:", {
        errorcode: responseData.errorcode || responseData.ErrorCode,
        errormessage: responseData.errormessage || responseData.ErrorMessage
      });
    }

    return responseData;
  } catch (error) {
    strapi.log.error("[Apple Pay] Session initialization error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Validate Apple Pay merchant with Payone
 * This is called when Apple Pay requests merchant validation
 */
const validateApplePayMerchant = async (strapi, params) => {
  try {
    strapi.log.info("[Apple Pay] Validating merchant with Payone");
    strapi.log.info("[Apple Pay] Validation params:", JSON.stringify({
      validationURL: params.validationURL,
      domain: params.domain,
      displayName: params.displayName,
      mid: params.mid,
      portalid: params.portalid
    }, null, 2));

    const settings = await getSettings(strapi);

    if (!validateSettings(settings)) {
      strapi.log.error("[Apple Pay] Payone settings not configured for merchant validation");
      throw new Error("Payone settings not configured");
    }

    const {
      validationURL,
      mid,
      portalid,
      domain,
      displayName
    } = params;

    // Get merchant data from settings (test or live mode)
    const merchantName = displayName || settings.merchantName || settings.displayName || "Test Store";
    const merchantId = mid || settings.mid || settings.merchantIdentifier;
    const portalId = portalid || settings.portalid;

    // Get domain from params or settings or server config
    const domainName = domain || settings.domainName ||
      (strapi.config.get("server.url") ? new URL(strapi.config.get("server.url")).hostname : null) ||
      "localhost";

    // For Payone integration without developer account,
    // Payone handles merchant validation
    // We need to initialize the session first
    const sessionParams = {
      displayName: merchantName,
      domainName: domainName,
      mid: merchantId,
      portalid: portalId
    };

    strapi.log.info("[Apple Pay] Initializing session with params:", JSON.stringify(sessionParams, null, 2));

    // Initialize Apple Pay session with Payone
    let sessionResponse;
    try {
      sessionResponse = await initializeApplePaySession(strapi, sessionParams);
    } catch (error) {
      strapi.log.error("[Apple Pay] Failed to initialize session with Payone:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Return empty object on error - Payment Request API will handle it
      return {};
    }

    strapi.log.info("[Apple Pay] Session initialization result:", {
      status: sessionResponse.status || sessionResponse.Status,
      hasMerchantIdentifier: !!(sessionResponse.merchantIdentifier || sessionResponse.merchantSessionIdentifier),
      fullResponse: JSON.stringify(sessionResponse, null, 2)
    });

    // If session initialization is successful, return merchant session
    // Payone will provide the merchant identifier and validation data
    // Check for both uppercase and lowercase status
    const responseStatus = sessionResponse.status || sessionResponse.Status;
    if (responseStatus === "APPROVED" || responseStatus === "REDIRECT" ||
      responseStatus === "approved" || responseStatus === "redirect") {
      strapi.log.info("[Apple Pay] Session approved, creating merchant session object");
      // Get merchant identifier from Payone response or settings
      const merchantIdentifier = sessionResponse.merchantIdentifier ||
        sessionResponse.merchantSessionIdentifier ||
        settings.merchantIdentifier ||
        settings.mid ||
        settings.portalid ||
        `merchant.${domainName}`;

      // Return merchant session object
      // In a real implementation, you would get this from Payone's response
      const merchantSession = {
        epochTimestamp: Date.now(),
        expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
        merchantSessionIdentifier: sessionResponse.merchantSessionIdentifier || `merchant.${domainName}`,
        nonce: sessionResponse.nonce || generateNonce(),
        merchantIdentifier: merchantIdentifier,
        domainName: domainName,
        displayName: merchantName
      };

      strapi.log.info("[Apple Pay] Merchant session created:", {
        merchantIdentifier: merchantSession.merchantIdentifier,
        domainName: merchantSession.domainName,
        expiresAt: new Date(merchantSession.expiresAt).toISOString()
      });

      return merchantSession;
    }

    // If initialization failed, return empty object
    // Payment Request API will handle it
    strapi.log.warn("[Apple Pay] Session initialization failed, returning empty object");
    return {};
  } catch (error) {
    strapi.log.error("[Apple Pay] Merchant validation error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    // Return empty object on error - Payone will handle validation
    return {};
  }
};

/**
 * Parse Payone response
 */
const parseResponse = (responseData, logger) => {
  if (typeof responseData === 'string') {
    // Parse form-encoded response
    const params = new URLSearchParams(responseData);
    const parsed = {};
    for (const [key, value] of params.entries()) {
      parsed[key] = value;
    }
    return parsed;
  }
  return responseData;
};

/**
 * Generate nonce for merchant session
 */
const generateNonce = () => {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

module.exports = {
  initializeApplePaySession,
  validateApplePayMerchant
};


