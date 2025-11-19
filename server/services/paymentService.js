"use strict";

const axios = require("axios");
const { normalizeReference } = require("../utils/normalize");
const { buildClientRequestParams, toFormData } = require("../utils/requestBuilder");
const { addPaymentMethodParams } = require("../utils/paymentMethodParams");
const { parseResponse, extractTxId, requires3DSRedirect, get3DSRedirectUrl } = require("../utils/responseParser");
const { getSettings, validateSettings } = require("./settingsService");
const { logTransaction } = require("./transactionService");

const POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";

/**
 * Send request to Payone API
 * @param {Object} strapi - Strapi instance
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} Response data
 */
const sendRequest = async (strapi, params) => {
  try {
    strapi.log.info("Payone sendRequest called with params:", params);

    const settings = await getSettings(strapi);

    if (!validateSettings(settings)) {
      throw new Error("Payone settings not configured");
    }

    // Normalize reference for certain request types
    const reqType = params.request;
    if (["authorization", "preauthorization", "refund"].includes(reqType)) {
      const prefix =
        reqType === "refund" ? "REF" : reqType === "preauthorization" ? "PRE" : "AUTH";
      params.reference = normalizeReference(params.reference, prefix);
    }

    const requestParams = buildClientRequestParams(settings, params, strapi.log);
    const debugParams = { ...requestParams };
    if (debugParams.key) debugParams.key = "***HIDDEN***";

    strapi.log.info("Payone Client API request params:", debugParams);

    const formData = toFormData(requestParams);
    strapi.log.info("Payone form data being sent:", formData.toString());

    const response = await axios.post(POST_GATEWAY_URL, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    const responseData = parseResponse(response.data, strapi.log);

    // Log response for debugging
    strapi.log.info("Payone API Response:", {
      status: responseData.status || responseData.Status,
      txid: responseData.txid || responseData.TxId,
      redirecturl: responseData.redirecturl || responseData.RedirectUrl,
      hasError: !!responseData.Error,
      errorCode: responseData.Error?.ErrorCode,
      errorMessage: responseData.Error?.ErrorMessage
    });

    // Check if 3DS redirect is required
    if (requires3DSRedirect(responseData)) {
      const redirectUrl = get3DSRedirectUrl(responseData);
      responseData.requires3DSRedirect = true;
      responseData.redirectUrl = redirectUrl;
      strapi.log.info("🔐 3DS redirect required:", redirectUrl);
    } else {
      strapi.log.info("ℹ️ No 3DS redirect required. Response status:", responseData.status || responseData.Status);
      // Log why 3DS redirect was not required
      const status = (responseData.status || responseData.Status || "").toUpperCase();
      const redirecturl = responseData.redirecturl || responseData.RedirectUrl;
      strapi.log.info("3DS Redirect Check:", {
        status,
        redirecturl: redirecturl || "not provided",
        requiresRedirect: status === "REDIRECT" && !!redirecturl
      });
    }

    // Log transaction
    await logTransaction(strapi, {
      txid: extractTxId(responseData) || params.txid || null,
      reference: params.reference || null,
      status: responseData.status || responseData.Status || "unknown",
      request_type: params.request,
      amount: params.amount || null,
      currency: params.currency || "EUR",
      raw_request: requestParams,
      raw_response: responseData,
      error_code: responseData.Error?.ErrorCode || null,
      error_message: responseData.Error?.ErrorMessage || null,
      customer_message: responseData.Error?.CustomerMessage || null
    });

    return responseData;
  } catch (error) {
    strapi.log.error("Payone sendRequest error:", error);
    throw error;
  }
};

/**
 * Preauthorization
 * @param {Object} strapi - Strapi instance
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} Response data
 */
const preauthorization = async (strapi, params) => {
  strapi.log.info("Payone preauthorization called with params:", params);

  const requiredParams = {
    request: "preauthorization",
    clearingtype: params.clearingtype || "cc",
    amount: params.amount || 1000,
    currency: params.currency || "EUR",
    reference: params.reference || `PREAUTH-${Date.now()}`,
    firstname: params.firstname || "Test",
    lastname: params.lastname || "User",
    street: params.street || "Test Street 1",
    zip: params.zip || "12345",
    city: params.city || "Test City",
    country: params.country || "DE",
    email: params.email || "test@example.com",
    ...params
  };

  const updatedParams = addPaymentMethodParams(requiredParams, strapi.log);
  return await sendRequest(strapi, updatedParams);
};

/**
 * Authorization
 * @param {Object} strapi - Strapi instance
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} Response data
 */
const authorization = async (strapi, params) => {
  strapi.log.info("Payone authorization called with params:", params);

  const requiredParams = {
    request: "authorization",
    clearingtype: params.clearingtype || "cc",
    ...params
  };

  const updatedParams = addPaymentMethodParams(requiredParams, strapi.log);
  return await sendRequest(strapi, updatedParams);
};

/**
 * Capture
 * @param {Object} strapi - Strapi instance
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} Response data
 */
const capture = async (strapi, params) => {
  strapi.log.info("Payone capture called with params:", params);

  if (!params.txid) {
    throw new Error("Transaction ID (txid) is required for capture");
  }

  const requiredParams = {
    request: "capture",
    txid: params.txid,
    amount: params.amount || 1000,
    currency: params.currency || "EUR",
    ...params
  };

  delete requiredParams.reference;
  strapi.log.info("Payone capture required params:", requiredParams);

  return await sendRequest(strapi, requiredParams);
};

/**
 * Refund
 * @param {Object} strapi - Strapi instance
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} Response data
 */
const refund = async (strapi, params) => {
  strapi.log.info("Payone refund called with params:", params);

  if (!params.txid) {
    throw new Error("Transaction ID (txid) is required for refund");
  }

  const requiredParams = {
    request: "refund",
    txid: params.txid,
    amount: params.amount || 1000,
    currency: params.currency || "EUR",
    reference: params.reference || `REFUND-${Date.now()}`,
    ...params
  };

  return await sendRequest(strapi, requiredParams);
};

/**
 * Handle 3D Secure callback from Payone
 * This processes the callback after customer completes 3DS authentication
 * @param {Object} strapi - Strapi instance
 * @param {Object} callbackData - Callback data from Payone
 * @returns {Promise<Object>} Processed callback result
 */
const handle3DSCallback = async (strapi, callbackData) => {
  try {
    strapi.log.info("Processing 3DS callback:", callbackData);

    // Parse callback data
    const parsedData = parseResponse(callbackData, strapi.log);

    // Extract transaction information
    const txid = extractTxId(parsedData);
    const status = parsedData.status || parsedData.Status || "unknown";
    const reference = parsedData.reference || parsedData.Reference || null;

    // Log the callback transaction
    await logTransaction(strapi, {
      txid: txid || null,
      reference: reference || null,
      status: status,
      request_type: "3ds_callback",
      amount: parsedData.amount || null,
      currency: parsedData.currency || "EUR",
      raw_request: callbackData,
      raw_response: parsedData,
      error_code: parsedData.Error?.ErrorCode || null,
      error_message: parsedData.Error?.ErrorMessage || null,
      customer_message: parsedData.Error?.CustomerMessage || null
    });

    return {
      success: status.toUpperCase() === "APPROVED" || status.toUpperCase() === "REDIRECT",
      status: status,
      txid: txid,
      reference: reference,
      data: parsedData
    };
  } catch (error) {
    strapi.log.error("3DS callback processing error:", error);
    throw error;
  }
};

module.exports = {
  sendRequest,
  preauthorization,
  authorization,
  capture,
  refund,
  handle3DSCallback
};

