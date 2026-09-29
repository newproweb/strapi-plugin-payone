"use strict";

const {
  PREAUTHORIZATION_FIELDS,
  AUTHORIZATION_FIELDS,
  DEFAULT_CAPTURE_AMOUNT,
  DEFAULT_CURRENCY
} = require("../constants");
const { getService } = require("../utils/get-service");
const { isConfigured } = require("../utils/credentials");
const { postToGateway } = require("../utils/payone-client");
const { buildClientRequestParams, toFormData, pickFields, invoiceIdFields } = require("../utils/request-params");
const { addPaymentMethodParams } = require("../utils/payment-method-params");
const {
  parseResponse,
  extractTxId,
  requires3DSRedirect,
  get3DSRedirectUrl,
  isThreeDSRequiredCode
} = require("../utils/response-parser");

const THREE_DS_STATUS_BY_RESULT = {
  success: "APPROVED",
  error: "ERROR",
  cancelled: "CANCELLED"
};

const requireTxId = (params, action) => {
  if (!params.txid) throw new Error(`Transaction ID (txid) is required for ${action}`);
};

module.exports = ({ strapi }) => {
  const send = async (params) => {
    const settings = await getService(strapi, "settings").getSettings();
    if (!isConfigured(settings)) throw new Error("Payone settings not configured");

    const requestParams = buildClientRequestParams(settings, params, strapi.log);
    const response = await postToGateway(toFormData(requestParams));
    const responseData = parseResponse(response.data, strapi.log);

    const errorCode = responseData?.Error?.ErrorCode;
    const is3DSRequired = isThreeDSRequiredCode(errorCode);
    if (requires3DSRedirect(responseData) || is3DSRequired) {
      responseData.requires3DSRedirect = true;
      responseData.redirectUrl = get3DSRedirectUrl(responseData);
      responseData.is3DSRequired = is3DSRequired;
    }

    const errorMessage = responseData?.Error?.ErrorMessage || null;
    const customerMessage = responseData?.Error?.CustomerMessage || null;
    const status = (responseData?.status || responseData?.Status || "unknown").toUpperCase();

    await getService(strapi, "transaction").logTransaction({
      txid: extractTxId(responseData) || params.txid || null,
      reference: params.reference || null,
      status,
      request_type: params.request,
      amount: params.amount || null,
      currency: params.currency || DEFAULT_CURRENCY,
      raw_request: requestParams,
      raw_response: responseData,
      error_code: errorCode,
      error_message: errorMessage,
      customer_message: customerMessage
    });

    return Object.assign(responseData, { errorCode, errorMessage, customerMessage, status });
  };

  /** Sends a request to the Payone post-gateway, logs it as a transaction and returns the parsed response. */
  const sendRequest = (params) =>
    send(params).catch((error) => {
      strapi.log.error("Payone sendRequest error:", error);
      throw error;
    });

  const preauthorization = async (params) =>
    sendRequest(addPaymentMethodParams({
      request: "preauthorization",
      ...pickFields(params, PREAUTHORIZATION_FIELDS),
      ...invoiceIdFields(params.invoiceid),
      ...params
    }, strapi.log));

  const authorization = async (params) =>
    sendRequest(addPaymentMethodParams({
      request: "authorization",
      ...pickFields(params, AUTHORIZATION_FIELDS),
      ...invoiceIdFields(params.invoiceid),
      ...params
    }, strapi.log));

  const capture = async (params) => {
    requireTxId(params, "capture");
    return sendRequest({
      request: "capture",
      txid: params.txid,
      amount: params.amount || DEFAULT_CAPTURE_AMOUNT,
      currency: params.currency || DEFAULT_CURRENCY,
      ...invoiceIdFields(params.invoiceid),
      ...params
    });
  };

  const refund = async (params) => {
    requireTxId(params, "refund");
    return sendRequest({
      request: "refund",
      txid: params.txid,
      amount: params.amount || DEFAULT_CAPTURE_AMOUNT,
      currency: params.currency || DEFAULT_CURRENCY,
      reference: params.reference || `REFUND-${Date.now()}`,
      ...invoiceIdFields(params.invoiceid),
      ...params
    });
  };

  /** Turns the data Payone sends back after a 3-D Secure challenge into a result for the redirect. */
  const handle3DSCallback = async (callbackData, resultType = "callback") => {
    const parse = () => {
      const parsedData = callbackData && Object.keys(callbackData).length > 0
        ? parseResponse(callbackData, strapi.log)
        : {};

      return {
        success: resultType === "success",
        status: THREE_DS_STATUS_BY_RESULT[resultType] || parsedData.status || parsedData.Status || "PENDING",
        txid: extractTxId(parsedData),
        reference: parsedData.reference || parsedData.Reference || null,
        data: parsedData
      };
    };

    return Promise.resolve().then(parse).catch((error) => {
      strapi.log.error("3DS callback processing error:", error);
      throw error;
    });
  };

  return { sendRequest, preauthorization, authorization, capture, refund, handle3DSCallback };
};
