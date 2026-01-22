"use strict";

const axios = require("axios");
const { buildClientRequestParams, toFormData } = require("../utils/requestBuilder");
const { parseResponse } = require("../utils/responseParser");
const { getSettings, validateSettings } = require("./settingsService");
const { addPaymentMethodParams } = require("../utils/paymentMethodParams");

const POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";

const testConnection = async (strapi) => {
  try {
    const settings = await getSettings(strapi);

    if (!validateSettings(settings)) {
      return {
        success: false,
        message: "Payone settings not configured. Please fill in all required fields."
      };
    }

    const timestamp = Date.now();
    const testParams = {
      request: "authorization",
      amount: 100,
      currency: "EUR",
      reference: `TEST-${timestamp}`,
      clearingtype: "cc",
      cardtype: "V",
      cardpan: "4111111111111111",
      cardcvc2: "123",
      firstname: "Test",
      lastname: "User",
      street: "Test Street 1",
      zip: "12345",
      city: "Test City",
      country: "DE",
      email: "test@example.com",
      salutation: "Herr",
      gender: "m",
      telephonenumber: "01752345678",
      ip: "127.0.0.1",
      customer_is_present: "yes",
      language: "de"
    };

    const updatedParams = addPaymentMethodParams(testParams, strapi.log);
    const requestParams = buildClientRequestParams(settings, updatedParams, strapi.log);
    const formData = toFormData(requestParams);

    const response = await axios.post(POST_GATEWAY_URL, formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    const result = parseResponse(response.data, strapi.log);
    const status = result.status || result.Status || result.STATUS;
    const errorMessage = result?.Error?.ErrorMessage;
    const errorCode = result?.Error?.ErrorCode;
    const customErrorMessage = result?.Error?.CustomerMessage;

    if (status === "ERROR" || status === "error") {
      return {
        success: false,
        message: `Test connection failed: ${errorCode}`,
        error: {
          ErrorCode: errorCode,
          ErrorMessage: errorMessage,
          CustomerMessage: customErrorMessage
        }
      };
    }

    if (status === "APPROVED" || status === "approved") {
      return {
        success: true,
        message: "Connection successful! Your Payone credentials are valid.",
        details: {
          mode: settings.mode,
          aid: settings.aid,
          portalid: settings.portalid,
          mid: settings.mid
        }
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

  } catch (error) {
    strapi.log.error("Payone test connection error:", error);
    return {
      success: false,
      message: `Test connection error: ${error.message || "Unknown error"}`,
      error: error.toString(),
      details: {
        errorType: error.constructor.name,
        stack: error.stack ? error.stack.substring(0, 200) : "No stack trace"
      }
    };
  }
};

module.exports = {
  testConnection
};

