"use strict";

const { getService } = require("../utils/get-service");
const { isConfigured } = require("../utils/credentials");
const { postToGateway } = require("../utils/payone-client");
const { buildClientRequestParams, toFormData } = require("../utils/request-params");
const { parseApplePayResponse } = require("../utils/response-parser");

const SESSION_KEY = "add_paydata[applepay_payment_session]";
const MILLISECOND_TIMESTAMP = 1000000000000;

const acceptAnyStatus = (status) => status >= 200 && status < 600;

const payoneErrorOf = (responseData) => ({
  errorCode: responseData.errorcode || responseData.ErrorCode,
  errorMessage:
    responseData.errormessage || responseData.ErrorMessage ||
    responseData.customermessage || responseData.CustomerMessage
});

const httpError = (message, status, response) => Object.assign(new Error(message), { status, response });

const toSeconds = (timestamp) =>
  timestamp && timestamp > MILLISECOND_TIMESTAMP ? Math.floor(timestamp / 1000) : timestamp;

const sessionBase64Of = (sessionResponse) =>
  sessionResponse[SESSION_KEY] ||
  sessionResponse["add_paydata_applepay_payment_session"] ||
  sessionResponse.add_paydata?.applepay_payment_session ||
  (sessionResponse.add_paydata && typeof sessionResponse.add_paydata === "object"
    ? sessionResponse.add_paydata["applepay_payment_session"]
    : null);

module.exports = ({ strapi }) => {
  const logError = (error) => {
    strapi.log.error("[Apple Pay] Error:", error instanceof Error ? error.message : error);
    throw error;
  };

  /** Throws a descriptive error for 4xx/5xx gateway responses (the request accepts every status). */
  const assertGatewayStatus = (response) => {
    if (response.status < 400) return;

    if (response.status >= 500) {
      strapi.log.error("[Apple Pay] Server error from Payone:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      throw httpError(`Payone server error (${response.status}): ${response.statusText || "Internal server error"}`, response.status, response);
    }

    const { errorCode, errorMessage } = payoneErrorOf(parseApplePayResponse(response.data));

    if (response.status === 403) {
      strapi.log.error("[Apple Pay] 403 Forbidden from Payone:", { errorcode: errorCode, errormessage: errorMessage });
      throw httpError(
        "403 Forbidden: Authentication failed with Payone API. " +
          (errorCode ? `Error Code: ${errorCode}. ` : "") +
          (errorMessage ? `Error: ${errorMessage}. ` : ""),
        403,
        response
      );
    }

    strapi.log.error("[Apple Pay] Client error from Payone:", {
      status: response.status,
      errorcode: errorCode,
      errormessage: errorMessage
    });
    throw httpError(`Payone API error (${response.status}): ${errorMessage || "Unknown error"}`, response.status, response);
  };

  const requestSession = async (params) => {
    const settings = await getService(strapi, "settings").getSettings();
    const applePayConfig = settings?.applePayConfig || {};

    const requestParams = buildClientRequestParams(settings, {
      request: "genericpayment",
      clearingtype: "wlt",
      wallettype: "APL",
      currency: params.currency || applePayConfig.currencyCode || "EUR",
      "add_paydata[action]": "init_applepay_session",
      "add_paydata[display_name]": params.displayName || settings?.merchantName || "Store",
      "add_paydata[domain_name]": params.domain || params.domainName || "localhost"
    }, strapi.log);

    const response = await postToGateway(toFormData(requestParams), {
      path: "Genericpayment",
      validateStatus: acceptAnyStatus
    });
    assertGatewayStatus(response);

    const responseData = parseApplePayResponse(response.data);
    if (responseData.errorcode || responseData.ErrorCode) {
      strapi.log.error("[Apple Pay] Payone error:", {
        errorcode: responseData.errorcode || responseData.ErrorCode,
        errormessage: responseData.errormessage || responseData.ErrorMessage,
        customermessage: responseData.customermessage || responseData.CustomerMessage
      });
    }
    return responseData;
  };

  /** Asks Payone to open an Apple Pay session (`genericpayment` / `init_applepay_session`). */
  const initializeApplePaySession = (params) => requestSession(params).catch(logError);

  const decodeSession = (base64) => {
    strapi.log.info("[Apple Pay] Extracting merchant session from Base64:", {
      base64Length: base64.length,
      base64Preview: base64.substring(0, 100) + "...",
      base64End: base64.substring(Math.max(0, base64.length - 50))
    });

    let json;
    try {
      json = Buffer.from(base64, "base64").toString("utf-8");
    } catch (decodeError) {
      strapi.log.error("[Apple Pay] Failed to decode Base64:", { error: decodeError.message, base64Length: base64.length });
      throw new Error(`Failed to decode Base64 merchant session: ${decodeError.message}`);
    }
    strapi.log.info("[Apple Pay] Base64 decoded successfully, JSON length:", json.length);

    try {
      const session = JSON.parse(json);
      strapi.log.info("[Apple Pay] Merchant session JSON parsed successfully");
      return session;
    } catch (parseError) {
      strapi.log.error("[Apple Pay] Failed to parse merchant session JSON:", { error: parseError.message, jsonPreview: json.substring(0, 500) });
      throw new Error(`Failed to parse merchant session JSON: ${parseError.message}`);
    }
  };

  const toMerchantSession = (base64, settings) => {
    const merchantSession = decodeSession(base64);

    strapi.log.info("[Apple Pay] Merchant session extracted successfully:", {
      hasMerchantIdentifier: !!merchantSession.merchantIdentifier,
      hasEpochTimestamp: !!merchantSession.epochTimestamp,
      hasExpiresAt: !!merchantSession.expiresAt,
      merchantSessionKeys: Object.keys(merchantSession)
    });

    if (merchantSession.epochTimestamp) merchantSession.epochTimestamp = toSeconds(merchantSession.epochTimestamp);
    if (merchantSession.expiresAt) merchantSession.expiresAt = toSeconds(merchantSession.expiresAt);

    const { merchantIdentifier } = merchantSession;
    if (!merchantIdentifier || merchantIdentifier === "undefined" || merchantIdentifier === "null") {
      merchantSession.merchantIdentifier = settings.mid || settings.merchantIdentifier || settings.portalid;
    }
    if (!merchantSession.merchantIdentifier) {
      throw new Error("Merchant identifier is missing. Please configure Merchant ID (mid) in plugin settings.");
    }
    return merchantSession;
  };

  const validateMerchant = async (params) => {
    const settings = await getService(strapi, "settings").getSettings();
    if (!isConfigured(settings)) {
      throw new Error("Payone settings are not properly configured. Please check your plugin settings (aid, portalid, mid, key).");
    }

    const applePayConfig = settings?.applePayConfig || {};
    if (!params.currency && applePayConfig.currencyCode) params.currency = applePayConfig.currencyCode;
    if (!params.countryCode && applePayConfig.countryCode) params.countryCode = applePayConfig.countryCode;

    const sessionResponse = await initializeApplePaySession(params);
    const sessionBase64 = sessionBase64Of(sessionResponse);

    strapi.log.info("[Apple Pay] Genericpayment response:", {
      status: sessionResponse.status,
      workorderid: sessionResponse.workorderid,
      hasApplePaySession: !!sessionBase64,
      applePaySessionLength: sessionBase64 ? sessionBase64.length : 0,
      responseKeys: Object.keys(sessionResponse),
      hasAddPaydataKey: !!sessionResponse[SESSION_KEY],
      hasAddPaydataObject: !!sessionResponse.add_paydata,
      addPaydataKeys: sessionResponse.add_paydata ? Object.keys(sessionResponse.add_paydata) : null
    });

    if (!sessionBase64) {
      strapi.log.error("[Apple Pay] Missing applepay_payment_session in response:", {
        status: sessionResponse.status,
        responseKeys: Object.keys(sessionResponse),
        responseSample: JSON.stringify(sessionResponse).substring(0, 1000),
        addPaydataKeys: sessionResponse.add_paydata ? Object.keys(sessionResponse.add_paydata) : null
      });
      throw new Error("Missing applepay_payment_session in Payone response. Please check your Payone Apple Pay configuration in PMI.");
    }

    if (sessionResponse.status === "OK" && sessionBase64.length > 0) {
      try {
        return toMerchantSession(sessionBase64, settings);
      } catch (error) {
        throw new Error(`Failed to parse merchant session from Payone: ${error.message}`);
      }
    }

    const errorCode = sessionResponse.errorcode || sessionResponse.ErrorCode;
    const errorMessage =
      sessionResponse.errormessage || sessionResponse.ErrorMessage ||
      sessionResponse.errortxt || sessionResponse.ErrorTxt;

    strapi.log.error("[Apple Pay] Payone Apple Pay initialization failed:", { errorcode: errorCode, errormessage: errorMessage });
    throw new Error(
      `Payone Apple Pay initialization failed: ${errorCode ? `Error ${errorCode}` : "Unknown error"} - ${errorMessage || "Please check your Payone Apple Pay configuration in PMI"}`
    );
  };

  /** Validates the merchant with Payone and returns the Apple Pay merchant session for the browser. */
  const validateApplePayMerchant = (params) => validateMerchant(params).catch(logError);

  return { initializeApplePaySession, validateApplePayMerchant };
};
