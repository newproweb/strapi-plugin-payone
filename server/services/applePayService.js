"use strict";

const axios = require("axios");
const { buildClientRequestParams, toFormData } = require("../utils/requestBuilder");
const { getSettings, validateSettings } = require("./settingsService");

const POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";

const parseResponse = (responseData) => {
  if (typeof responseData === 'string') {
    const params = new URLSearchParams(responseData);
    const parsed = {};
    for (const [key, value] of params.entries()) {
      parsed[key] = value;
    }
    return parsed;
  }
  return responseData;
};

const initializeApplePaySession = async (strapi, params) => {
  let settings = null;
  try {
    settings = await getSettings(strapi);

    const validationErrors = [];

    if (!settings.aid || settings.aid.trim() === "") {
      validationErrors.push("aid (Subaccount ID) is missing or empty");
    }
    if (!settings.portalid || settings.portalid.trim() === "") {
      validationErrors.push("portalid (Portal ID) is missing or empty");
    }
    if (!settings.mid || settings.mid.trim() === "") {
      validationErrors.push("mid (Merchant ID) is missing or empty");
    }
    if (!settings.key || settings.key.trim() === "") {
      validationErrors.push("key (Portal Key) is missing or empty");
    }

    const mode = (settings.mode || "test").toLowerCase();
    if (mode !== "live") {
      validationErrors.push(`Mode is set to "${mode}" but Apple Pay only works in "live" mode according to Payone documentation`);
    }

    const applePayConfig = settings?.applePayConfig || {};
    const currency = params.currency || applePayConfig.currencyCode || "EUR";
    const countryCode = params.countryCode || applePayConfig.countryCode || "DE";

    const merchantName = params.displayName || settings?.merchantName || "Store";
    const domain = params.domain || params.domainName || "localhost";

    const baseParams = {
      request: "genericpayment",
      clearingtype: "wlt",
      wallettype: "APL",
      currency: currency,
      "add_paydata[action]": "init_applepay_session",
      "add_paydata[display_name]": merchantName,
      "add_paydata[domain_name]": domain
    };

    const requestParams = buildClientRequestParams(settings, baseParams, strapi.log);
    const formData = toFormData(requestParams);

    let response;
    try {
      response = await axios.post(`${POST_GATEWAY_URL}Genericpayment`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 30000,
        validateStatus: function (status) {
          return status >= 200 && status < 600;
        }
      });
    } catch (axiosError) {
      throw axiosError;
    }

    if (response.status === 403) {
      const responseData = parseResponse(response.data);
      const errorCode = responseData.errorcode || responseData.ErrorCode;
      const errorMessage = responseData.errormessage || responseData.ErrorMessage || responseData.customermessage || responseData.CustomerMessage;

      strapi.log.error("[Apple Pay] 403 Forbidden from Payone:", {
        errorcode: errorCode,
        errormessage: errorMessage
      });

      const detailedError = new Error("403 Forbidden: Authentication failed with Payone API. " +
        (errorCode ? `Error Code: ${errorCode}. ` : "") +
        (errorMessage ? `Error: ${errorMessage}. ` : "") +
        "Please check: 1) Your Payone credentials (aid, portalid, mid, key) in plugin settings, " +
        "2) Mode is set to 'live' (Apple Pay only works in live mode), " +
        "3) Your domain is registered with Payone Merchant Services, " +
        "4) Merchant ID (mid) matches your merchantIdentifier in PMI, " +
        "5) Apple Pay is enabled for your portal in PMI.");
      Object.assign(detailedError, { status: 403, response: response });
      throw detailedError;
    }

    if (response.status >= 400 && response.status < 500) {
      const responseData = parseResponse(response.data);
      const errorCode = responseData.errorcode || responseData.ErrorCode;
      const errorMessage = responseData.errormessage || responseData.ErrorMessage || responseData.customermessage || responseData.CustomerMessage;

      strapi.log.error("[Apple Pay] Client error from Payone:", {
        status: response.status,
        errorcode: errorCode,
        errormessage: errorMessage
      });

      const detailedError = new Error(`Payone API error (${response.status}): ${errorMessage || 'Unknown error'}`);
      Object.assign(detailedError, { status: response.status, response: response });
      throw detailedError;
    }

    if (response.status >= 500) {
      strapi.log.error("[Apple Pay] Server error from Payone:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      const detailedError = new Error(`Payone server error (${response.status}): ${response.statusText || 'Internal server error'}`);
      Object.assign(detailedError, { status: response.status, response: response });
      throw detailedError;
    }

    const responseData = parseResponse(response.data);

    if (responseData.errorcode || responseData.ErrorCode) {
      strapi.log.error("[Apple Pay] Payone error:", {
        errorcode: responseData.errorcode || responseData.ErrorCode,
        errormessage: responseData.errormessage || responseData.ErrorMessage,
        customermessage: responseData.customermessage || responseData.CustomerMessage
      });
    }

    return responseData;
  } catch (error) {
    const errorStatus = error.response?.status || error.status;
    const errorResponseData = error.response?.data;

    // Provide more specific error messages
    if (errorStatus === 403 || error.message?.includes('403')) {
      let responseData = {};
      let errorCode = null;
      let errorMessage = null;

      if (errorResponseData) {
        try {
          responseData = parseResponse(errorResponseData);
          errorCode = responseData.errorcode || responseData.ErrorCode;
          errorMessage = responseData.errormessage || responseData.ErrorMessage || responseData.customermessage || responseData.CustomerMessage;
        } catch (parseErr) {
          if (typeof errorResponseData === 'string') {
            errorMessage = errorResponseData;
          }
        }
      }

      if (errorCode || errorMessage) {
        strapi.log.error("[Apple Pay] 403 Forbidden from Payone:", {
          errorcode: errorCode,
          errormessage: errorMessage
        });
      }

      let detailedMessage = "403 Forbidden: Authentication failed with Payone API. ";

      if (errorCode) {
        detailedMessage += `Error Code: ${errorCode}. `;
      }

      if (errorMessage) {
        detailedMessage += `Error: ${errorMessage}. `;
      }

      detailedMessage += "Please check:\n" +
        "1. Your Payone credentials (aid, portalid, mid, key) in plugin settings\n" +
        "2. Mode is set to 'live' (Apple Pay only works in live mode according to Payone docs)\n" +
        "3. Your domain is registered with Payone Merchant Services\n" +
        "4. Merchant ID (mid) matches your merchantIdentifier in PMI\n" +
        "5. Apple Pay is enabled for your portal in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Payment type configuration tab)";

      throw new Error(detailedMessage);
    } else if (errorStatus === 401 || error.message?.includes('401')) {
      if (errorResponseData) {
        const responseData = parseResponse(errorResponseData);
        strapi.log.error("[Apple Pay] 401 Unauthorized from Payone:", {
          errorcode: responseData.errorcode || responseData.ErrorCode,
          errormessage: responseData.errormessage || responseData.ErrorMessage
        });
      }
      throw new Error("401 Unauthorized: Invalid credentials. Please verify your Payone key in plugin settings.");
    } else if (errorStatus && errorStatus >= 500) {
      const responseData = errorResponseData ? parseResponse(errorResponseData) : {};
      strapi.log.error("[Apple Pay] Payone server error:", {
        status: error.response?.status,
        errorcode: responseData.errorcode || responseData.ErrorCode,
        errormessage: responseData.errormessage || responseData.ErrorMessage
      });
      throw new Error(`Payone server error (${error.response?.status}): ${error.response?.statusText || 'Internal server error'}`);
    }

    throw error;
  }
};

const validateApplePayMerchant = async (strapi, params) => {
  try {
    const settings = await getSettings(strapi);

    if (!validateSettings(settings)) {
      throw new Error("Payone settings are not properly configured. Please check your plugin settings (aid, portalid, mid, key).");
    }

    // Get currency and country from Apple Pay config
    const applePayConfig = settings?.applePayConfig || {};
    const currency = params.currency || applePayConfig.currencyCode || "EUR";
    const countryCode = params.countryCode || applePayConfig.countryCode || "DE";

    // Update params with config values
    if (!params.currency && applePayConfig.currencyCode) {
      params.currency = applePayConfig.currencyCode;
    }
    if (!params.countryCode && applePayConfig.countryCode) {
      params.countryCode = applePayConfig.countryCode;
    }

    const sessionResponse = await initializeApplePaySession(strapi, params);

    const applePaySessionBase64 = sessionResponse["add_paydata[applepay_payment_session]"] ||
      sessionResponse.add_paydata?.applepay_payment_session;

    if (sessionResponse.status === "OK" && applePaySessionBase64 && applePaySessionBase64.length > 0) {
      try {
        const merchantSessionJson = Buffer.from(applePaySessionBase64, 'base64').toString('utf-8');
        const merchantSession = JSON.parse(merchantSessionJson);

        if (merchantSession.epochTimestamp && merchantSession.epochTimestamp > 1000000000000) {
          merchantSession.epochTimestamp = Math.floor(merchantSession.epochTimestamp / 1000);
        }

        if (merchantSession.expiresAt && merchantSession.expiresAt > 1000000000000) {
          merchantSession.expiresAt = Math.floor(merchantSession.expiresAt / 1000);
        }

        if (!merchantSession.merchantIdentifier ||
          merchantSession.merchantIdentifier === 'undefined' ||
          merchantSession.merchantIdentifier === 'null') {
          merchantSession.merchantIdentifier = settings.mid || settings.merchantIdentifier || settings.portalid;
        }

        if (!merchantSession.merchantIdentifier) {
          throw new Error("Merchant identifier is missing. Please configure Merchant ID (mid) in plugin settings.");
        }

        return merchantSession;
      } catch (parseError) {
        throw new Error(`Failed to parse merchant session from Payone: ${parseError.message}`);
      }
    }

    const errorCode = sessionResponse.errorcode || sessionResponse.ErrorCode;
    const errorMessage = sessionResponse.errormessage || sessionResponse.ErrorMessage ||
      sessionResponse.errortxt || sessionResponse.ErrorTxt;

    strapi.log.error("[Apple Pay] Payone Apple Pay initialization failed:", {
      errorcode: errorCode,
      errormessage: errorMessage
    });

    throw new Error(
      `Payone Apple Pay initialization failed: ${errorCode ? `Error ${errorCode}` : 'Unknown error'} - ${errorMessage || 'Please check your Payone Apple Pay configuration in PMI'}`
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
  initializeApplePaySession,
  validateApplePayMerchant
};
