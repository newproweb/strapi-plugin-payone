"use strict";

const axios = require("axios");
const { buildClientRequestParams, toFormData } = require("../utils/requestBuilder");
const { getSettings, validateSettings } = require("./settingsService");

const POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";

const parseResponse = (responseData) => {
  if (typeof responseData === 'string') {
    if (responseData.trim().startsWith('{')) {
      try {
        return JSON.parse(responseData);
      } catch (e) {
        // Fall through to URL-encoded parsing
      }
    }

    const params = new URLSearchParams(responseData);
    const parsed = {};
    for (const [key, value] of params.entries()) {
      parsed[key] = value;
      const normalizedKey = key.toLowerCase().replace(/\[/g, '_').replace(/\]/g, '');
      if (normalizedKey !== key.toLowerCase()) {
        parsed[normalizedKey] = value;
      }
    }
    return parsed;
  }

  if (typeof responseData === 'object' && responseData !== null) {
    const result = { ...responseData };
    if (result['add_paydata[applepay_payment_session]']) {
      result.add_paydata = result.add_paydata || {};
      result.add_paydata.applepay_payment_session = result['add_paydata[applepay_payment_session]'];
    }
    return result;
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

    const response = await axios.post(`${POST_GATEWAY_URL}Genericpayment`, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000,
      validateStatus: function (status) {
        return status >= 200 && status < 600;
      }
    });


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
        (errorMessage ? `Error: ${errorMessage}. ` : ""));
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
    strapi.log.error("[Apple Pay] Error:", error instanceof Error ? error.message : error);
    throw error;
  }
};

const validateApplePayMerchant = async (strapi, params) => {
  try {
    const settings = await getSettings(strapi);

    if (!validateSettings(settings)) {
      throw new Error("Payone settings are not properly configured. Please check your plugin settings (aid, portalid, mid, key).");
    }

    const applePayConfig = settings?.applePayConfig || {};

    if (!params.currency && applePayConfig.currencyCode) {
      params.currency = applePayConfig.currencyCode;
    }

    if (!params.countryCode && applePayConfig.countryCode) {
      params.countryCode = applePayConfig.countryCode;
    }

    const sessionResponse = await initializeApplePaySession(strapi, params);

    // Extract add_paydata[applepay_payment_session] from response
    // Payone returns this in URL-encoded format: add_paydata[applepay_payment_session]=BASE64_STRING
    const applePaySessionBase64 =
      sessionResponse["add_paydata[applepay_payment_session]"] ||
      sessionResponse["add_paydata_applepay_payment_session"] ||
      sessionResponse.add_paydata?.applepay_payment_session ||
      (sessionResponse.add_paydata && typeof sessionResponse.add_paydata === 'object'
        ? sessionResponse.add_paydata["applepay_payment_session"]
        : null);

    strapi.log.info("[Apple Pay] Genericpayment response:", {
      status: sessionResponse.status,
      workorderid: sessionResponse.workorderid,
      hasApplePaySession: !!applePaySessionBase64,
      applePaySessionLength: applePaySessionBase64 ? applePaySessionBase64.length : 0,
      responseKeys: Object.keys(sessionResponse),
      hasAddPaydataKey: !!sessionResponse["add_paydata[applepay_payment_session]"],
      hasAddPaydataObject: !!sessionResponse.add_paydata,
      addPaydataKeys: sessionResponse.add_paydata ? Object.keys(sessionResponse.add_paydata) : null
    });

    if (!applePaySessionBase64) {
      strapi.log.error("[Apple Pay] Missing applepay_payment_session in response:", {
        status: sessionResponse.status,
        responseKeys: Object.keys(sessionResponse),
        responseSample: JSON.stringify(sessionResponse).substring(0, 1000),
        addPaydataKeys: sessionResponse.add_paydata ? Object.keys(sessionResponse.add_paydata) : null
      });
      throw new Error("Missing applepay_payment_session in Payone response. Please check your Payone Apple Pay configuration in PMI.");
    }

    if (sessionResponse.status === "OK" && applePaySessionBase64 && applePaySessionBase64.length > 0) {
      try {
        strapi.log.info("[Apple Pay] Extracting merchant session from Base64:", {
          base64Length: applePaySessionBase64.length,
          base64Preview: applePaySessionBase64.substring(0, 100) + "...",
          base64End: applePaySessionBase64.substring(Math.max(0, applePaySessionBase64.length - 50))
        });

        // Decode Base64 to get merchant session JSON
        let merchantSessionJson;
        try {
          merchantSessionJson = Buffer.from(applePaySessionBase64, 'base64').toString('utf-8');
          strapi.log.info("[Apple Pay] Base64 decoded successfully, JSON length:", merchantSessionJson.length);
        } catch (decodeError) {
          strapi.log.error("[Apple Pay] Failed to decode Base64:", {
            error: decodeError.message,
            base64Length: applePaySessionBase64.length
          });
          throw new Error(`Failed to decode Base64 merchant session: ${decodeError.message}`);
        }

        // Parse JSON merchant session
        let merchantSession;
        try {
          merchantSession = JSON.parse(merchantSessionJson);
          strapi.log.info("[Apple Pay] Merchant session JSON parsed successfully");
        } catch (parseError) {
          strapi.log.error("[Apple Pay] Failed to parse merchant session JSON:", {
            error: parseError.message,
            jsonPreview: merchantSessionJson.substring(0, 500)
          });
          throw new Error(`Failed to parse merchant session JSON: ${parseError.message}`);
        }

        strapi.log.info("[Apple Pay] Merchant session extracted successfully:", {
          hasMerchantIdentifier: !!merchantSession.merchantIdentifier,
          hasEpochTimestamp: !!merchantSession.epochTimestamp,
          hasExpiresAt: !!merchantSession.expiresAt,
          merchantSessionKeys: Object.keys(merchantSession)
        });

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
    strapi.log.error("[Apple Pay] Error:", error instanceof Error ? error.message : error);
    throw error;
  }
};

module.exports = {
  initializeApplePaySession,
  validateApplePayMerchant
};
