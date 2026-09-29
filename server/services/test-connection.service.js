"use strict";

const { TEST_CONNECTION_REQUEST } = require("../constants");
const { getService } = require("../utils/get-service");
const { isConfigured } = require("../utils/credentials");
const { postToGateway } = require("../utils/payone-client");
const { buildClientRequestParams, toFormData } = require("../utils/request-params");
const { addPaymentMethodParams } = require("../utils/payment-method-params");
const { parseResponse } = require("../utils/response-parser");

const NOT_CONFIGURED = {
  success: false,
  message: "Payone settings not configured. Please fill in all required fields."
};

const toResult = (result, settings) => {
  const status = result?.status || result?.Status || result?.STATUS;

  if (status === "ERROR" || status === "error") {
    const errorCode = result?.Error?.ErrorCode;
    return {
      success: false,
      message: `Test connection failed: ${errorCode}`,
      error: {
        ErrorCode: errorCode,
        ErrorMessage: result?.Error?.ErrorMessage,
        CustomerMessage: result?.Error?.CustomerMessage
      }
    };
  }

  if (status === "APPROVED" || status === "approved") {
    return {
      success: true,
      message: "Connection successful! Your Payone credentials are valid.",
      details: { mode: settings.mode, aid: settings.aid, portalid: settings.portalid, mid: settings.mid }
    };
  }

  return {
    success: false,
    message: "Unexpected response format from Payone API",
    response: result,
    details: {
      status,
      keys: Object.keys(result),
      rawResponse: JSON.stringify(result).substring(0, 200)
    }
  };
};

const toErrorResult = (error) => ({
  success: false,
  message: `Test connection error: ${error.message || "Unknown error"}`,
  error: error.toString(),
  details: {
    errorType: error.constructor.name,
    stack: error.stack ? error.stack.substring(0, 200) : "No stack trace"
  }
});

module.exports = ({ strapi }) => {
  const runTest = async () => {
    const settings = await getService(strapi, "settings").getSettings();
    if (!isConfigured(settings)) return NOT_CONFIGURED;

    const testParams = { ...TEST_CONNECTION_REQUEST, reference: `TEST-${Date.now()}` };
    const requestParams = buildClientRequestParams(settings, addPaymentMethodParams(testParams, strapi.log), strapi.log);
    const response = await postToGateway(toFormData(requestParams));

    return toResult(parseResponse(response.data, strapi.log), settings);
  };

  /** Sends a 1.00 EUR test authorization with Payone's test card and reports whether it was approved. */
  const testConnection = () =>
    runTest().catch((error) => {
      strapi.log.error("Payone test connection error:", error);
      return toErrorResult(error);
    });

  return { testConnection };
};
