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
  try {
    const settings = await getSettings(strapi);
    const { displayName, domainName } = params;

    const merchantName = displayName || "Store";
    const domain = domainName;

    const baseParams = {
      request: "genericpayment",
      clearingtype: "wlt",
      wallettype: "APL",
      currency: params.currency,
      "add_paydata[action]": "init_applepay_session",
      "add_paydata[display_name]": merchantName,
      "add_paydata[domain_name]": domain
    };

    const requestParams = buildClientRequestParams(settings, baseParams, strapi.log);

    const formData = toFormData(requestParams);
    const response = await axios.post(`${POST_GATEWAY_URL}Genericpayment`, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    const responseData = parseResponse(response.data);

    if (responseData.errorcode || responseData.ErrorCode) {
      strapi.log.error("[Apple Pay] Payone error:", {
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

const validateApplePayMerchant = async (strapi, params) => {
  const settings = await getSettings(strapi);

  if (!validateSettings(settings)) {
    strapi.log.error("Payone settings not configured");
    return null;
  }

  const sessionResponse = await initializeApplePaySession(strapi, params);
  const applePaySessionBase64 = sessionResponse["add_paydata[applepay_payment_session]"] ||
    sessionResponse.add_paydata?.applepay_payment_session;

  if (sessionResponse.status === "OK" && applePaySessionBase64 && applePaySessionBase64.length > 0) {
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
      strapi.log.error("Decoded merchant session has invalid merchantIdentifier");
    }

    return merchantSession;
  }

  const errorCode = sessionResponse.errorcode || sessionResponse.ErrorCode;
  const errorMessage = sessionResponse.errormessage || sessionResponse.ErrorMessage ||
    sessionResponse.errortxt || sessionResponse.ErrorTxt;

  strapi.log.error(
    `Payone Apple Pay initialization failed: ${errorCode ? `Error ${errorCode}` : ''} ${errorMessage || 'Unknown error'}`
  );

  return null;
};

module.exports = {
  initializeApplePaySession,
  validateApplePayMerchant
};
