"use strict";

const axios = require("axios");
const { buildClientRequestParams, toFormData, is3dsViable } = require("../utils/requestBuilder");
const { addPaymentMethodParams } = require("../utils/paymentMethodParams");
const { parseResponse, extractTxId, requires3DSRedirect, get3DSRedirectUrl } = require("../utils/responseParser");
const { getSettings, validateSettings } = require("./settingsService");
const { logTransaction } = require("./transactionService");

const POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";

const getInvoiceIdObject = (invoiceid) => {
  if (!invoiceid || typeof invoiceid !== 'string') {
    return null;
  }

  const invoiceIdVariants = [
    'invoiceid',
    'invoiceId',
    'invoice_id',
    'invoiceID',
    'InvoiceId',
    'InvoiceID',
    'Invoice_Id',
    'INVOICEID',
    'INVOICE_ID'
  ];

  let invoiceIdObject = {}
  for (const variant of invoiceIdVariants) {
    invoiceIdObject[variant] = invoiceid;
  }

  return invoiceIdObject;
};

const sendRequest = async (strapi, params) => {
  try {
    const settings = await getSettings(strapi);
    if (!validateSettings(settings)) throw new Error("Payone settings not configured");

    const requestParams = buildClientRequestParams(settings, params, strapi.log);

    const formData = toFormData(requestParams);
    const response = await axios.post(POST_GATEWAY_URL, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    const responseData = parseResponse(response.data, strapi.log);
    const errorCode = responseData?.Error?.ErrorCode;
    const requires3DSErrorCodes = ["4219", 4219];
    const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);

    if (requires3DSRedirect(responseData) || is3DSRequiredError) {
      const redirectUrl = get3DSRedirectUrl(responseData);
      responseData.requires3DSRedirect = true;
      responseData.redirectUrl = redirectUrl;
      responseData.is3DSRequired = is3DSRequiredError;
    }

    const errorMessage = responseData?.Error?.ErrorMessage || null;

    const customerMessage = responseData?.Error?.CustomerMessage || null;

    const status = (responseData?.status || responseData?.Status || "unknown").toUpperCase() || null;

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

const preauthorization = async (strapi, params) => {
  const requestParams = {
    request: "preauthorization",
    clearingtype: params.clearingtype,
    amount: params.amount,
    currency: params.currency,
    reference: params.reference,
    firstname: params.firstname,
    lastname: params.lastname,
    street: params.street,
    zip: params.zip,
    city: params.city,
    country: params.country,
    email: params.email,
    narrative_text: params.narrative_text,
    ...getInvoiceIdObject(params.invoiceid),
    ...params
  };

  const settings = await getSettings(strapi);

  // Happnes only when CC-payment and 3DS is enabled and is Pre/Authorization request
  if (is3dsViable(requestParams, settings)) {
    requestParams = await perform3DSCheck(strapi, requestParams);
    if (!requestParams) throw new Error('3DS check failed');
  }

  requestParams = addPaymentMethodParams(requestParams, strapi.log);
  return await sendRequest(strapi, requestParams);
};

const authorization = async (strapi, params) => {
  let requestParams = {
    request: "authorization",
    clearingtype: params.clearingtype,
    reference: params.reference,
    firstname: params.firstname,
    lastname: params.lastname,
    street: params.street,
    zip: params.zip,
    city: params.city,
    country: params.country,
    email: params.email,
    narrative_text: params.narrative_text,
    ...getInvoiceIdObject(params.invoiceid),
    ...params
  };

  const settings = await getSettings(strapi);

  // Happnes only when CC-payment and 3DS is enabled and is Pre/Authorization request
  if (is3dsViable(requestParams, settings)) {
    requestParams = await perform3DSCheck(strapi, requestParams);
    if (!requestParams) throw new Error('3DS check failed');
  }

  requestParams = addPaymentMethodParams(requestParams, strapi.log);
  return await sendRequest(strapi, requestParams);
};

const capture = async (strapi, params) => {
  if (!params.txid) {
    throw new Error("Transaction ID (txid) is required for capture");
  }

  const requiredParams = {
    request: "capture",
    txid: params.txid,
    amount: params.amount || 1000,
    currency: params.currency || "EUR",
    ...getInvoiceIdObject(params.invoiceid),
    ...params
  };

  return await sendRequest(strapi, requiredParams);
};

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
    ...getInvoiceIdObject(params.invoiceid),
    ...params
  };

  return await sendRequest(strapi, requiredParams);
};

/**
 * Performs a 3DS check and returns the modified params
 * The modified params include the pseudocardpan if the 3DS check is valid
 * 
 * @param strapi - Strapi instance
 * @param params - Request params
 * @returns The modified params
 */
const perform3DSCheck = async (strapi, params) => {
  try {
    const result = await sendRequest(strapi, {
      ...params,
      request: "3dscheck",
      exiturl: params.successurl ?? '',
    });

    console.log("3DS check result:", result);

    if (result?.errorCode || result?.errorMessage || result?.Status === 'Failed' || result?.Status === 'Invalid')
      throw new Error('3DS check failed');

    const modifiedParams = {
      ...params,
      pseudocardpan: result?.CreditCard?.PseudoCardPan,
    };

    if (result?.Status === 'Valid') modifiedParams.xid = result?.CreditCard?.ThreeDS?.Xid;

    return modifiedParams;
  } catch (error) {
    strapi.log.error("3DS check error:", error);
    return null;
  }
};

const handle3DSCallback = async (strapi, callbackData, resultType = 'callback') => {
  try {
    const parsedData = callbackData && Object.keys(callbackData).length > 0
      ? parseResponse(callbackData, strapi.log)
      : {};

    const txid = extractTxId(parsedData);
    const reference = parsedData.reference || parsedData.Reference || null;

    let status;
    if (resultType === 'success') {
      status = 'APPROVED';
    } else if (resultType === 'error') {
      status = 'ERROR';
    } else if (resultType === 'cancelled') {
      status = 'CANCELLED';
    } else {
      status = parsedData.status || parsedData.Status || 'PENDING';
    }

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
  handle3DSCallback,
  perform3DSCheck
};

