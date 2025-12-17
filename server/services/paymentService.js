"use strict";

const axios = require("axios");
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
    const settings = await getSettings(strapi);

    if (!validateSettings(settings)) {
      throw new Error("Payone settings not configured");
    }

    // Reference is saved as-is without normalization

    const requestParams = buildClientRequestParams(settings, params, strapi.log);
    const formData = toFormData(requestParams);

    const response = await axios.post(POST_GATEWAY_URL, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    const responseData = parseResponse(response.data, strapi.log);

    // Log full response for debugging
    strapi.log.info("Payone API Response:", JSON.stringify(responseData, null, 2));
    strapi.log.info("Response Status:", responseData.status || responseData.Status);
    strapi.log.info("Response Error Code:", responseData.errorcode || responseData.ErrorCode || responseData.Error?.ErrorCode);
    strapi.log.info("Response Error Message:", responseData.errormessage || responseData.ErrorMessage || responseData.Error?.ErrorMessage);

    // Log all possible redirect URL fields
    strapi.log.info("Redirect URL fields:", {
      redirecturl: responseData.redirecturl,
      RedirectUrl: responseData.RedirectUrl,
      redirect_url: responseData.redirect_url,
      redirectUrl: responseData.redirectUrl,
      url: responseData.url,
      Url: responseData.Url
    });

    // Extract error information from various possible fields
    const errorCode =
      responseData.errorcode ||
      responseData.ErrorCode ||
      responseData.Error?.ErrorCode ||
      responseData.error_code ||
      null;

    // Check for 3DS redirect
    const requires3DSErrorCodes = ["4219", 4219];
    const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);

    if (requires3DSRedirect(responseData) || is3DSRequiredError) {
      const redirectUrl = get3DSRedirectUrl(responseData);
      responseData.requires3DSRedirect = true;
      responseData.redirectUrl = redirectUrl;
      responseData.is3DSRequired = is3DSRequiredError;

      // If 3DS required but no redirect URL, log for debugging
      if (is3DSRequiredError && !redirectUrl) {
        strapi.log.warn("3DS authentication required (Error 4219) but no redirect URL found. May need 3dscheck request.");
        strapi.log.info("Full response data:", JSON.stringify(responseData, null, 2));
      }
    }

    const errorMessage =
      responseData.errormessage ||
      responseData.ErrorMessage ||
      responseData.Error?.ErrorMessage ||
      responseData.error_message ||
      null;

    const customerMessage =
      responseData.customermessage ||
      responseData.CustomerMessage ||
      responseData.Error?.CustomerMessage ||
      responseData.customer_message ||
      null;

    const status = (responseData.status || responseData.Status || "unknown").toUpperCase();

    // Log transaction
    await logTransaction(strapi, {
      txid: extractTxId(responseData) || params.txid || null,
      reference: params.reference || null,
      status: status,
      request_type: params.request,
      amount: params.amount || null,
      currency: params.currency || "EUR",
      raw_request: requestParams,
      raw_response: responseData,
      error_code: errorCode,
      error_message: errorMessage,
      customer_message: customerMessage
    });

    // Add normalized error fields to response
    responseData.errorCode = errorCode;
    responseData.errorMessage = errorMessage;
    responseData.customerMessage = customerMessage;
    responseData.status = status;

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
  return await sendRequest(strapi, requiredParams);
};

/**
 * Refund
 * @param {Object} strapi - Strapi instance
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} Response data
 */
const refund = async (strapi, params) => {
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
 * Note: Payone's redirect callback typically doesn't include transaction details -
 * the URL path (success/error/back) indicates the result.
 * @param {Object} strapi - Strapi instance
 * @param {Object} callbackData - Callback data from Payone (may be empty or minimal)
 * @param {string} resultType - Result type from URL path: 'success', 'error', 'cancelled', or 'callback'
 * @returns {Promise<Object>} Processed callback result
 */
const handle3DSCallback = async (strapi, callbackData, resultType = 'callback') => {
  try {
    // Parse any data that Payone might have sent
    const parsedData = callbackData && Object.keys(callbackData).length > 0
      ? parseResponse(callbackData, strapi.log)
      : {};

    // Extract transaction information if available
    const txid = extractTxId(parsedData);
    const reference = parsedData.reference || parsedData.Reference || null;

    // Determine status from resultType (URL path) since Payone callback may not include status
    let status;
    if (resultType === 'success') {
      status = 'APPROVED';
    } else if (resultType === 'error') {
      status = 'ERROR';
    } else if (resultType === 'cancelled') {
      status = 'CANCELLED';
    } else {
      // Fallback to parsed data if available
      status = parsedData.status || parsedData.Status || 'PENDING';
    }

    // Log for debugging purposes only (not saved to transaction history)
    strapi.log.info("3DS callback processed:", {
      resultType,
      status,
      txid,
      reference,
      callbackData
    });

    return {
      success: resultType === 'success',
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

