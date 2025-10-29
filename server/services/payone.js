"use strict";

const axios = require("axios");
const crypto = require("crypto");

const POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";

const normalizeReference = (input, fallbackPrefix = "REF") => {
  try {
    const raw = (input == null ? "" : String(input));
    // Keep only alphanumeric characters
    let normalized = raw.replace(/[^A-Za-z0-9]/g, "");
    if (!normalized) {
      normalized = `${fallbackPrefix}${Date.now()}`;
    }
    // Limit length to 20 chars (safe for PAYONE)
    if (normalized.length > 20) normalized = normalized.slice(0, 20);
    return normalized;
  } catch (_) {
    const fallback = `${fallbackPrefix}${Date.now()}`;
    return fallback.slice(0, 20);
  }
};

const buildClientRequestParams = (settings, params) => {
  const requestParams = {
    request: params.request,
    aid: settings.aid,
    mid: settings.mid,
    portalid: settings.portalid,
    mode: settings.mode || "test",
    encoding: "UTF-8",
    ...params
  };

  requestParams.key = crypto
    .createHash("md5")
    .update(settings.portalKey || settings.key)
    .digest("hex");

  if (!requestParams.salutation) requestParams.salutation = "Herr";
  if (!requestParams.gender) requestParams.gender = "m";
  if (!requestParams.telephonenumber)
    requestParams.telephonenumber = "01752345678";
  if (!requestParams.ip) requestParams.ip = "127.0.0.1";
  if (!requestParams.language) requestParams.language = "de";
  if (!requestParams.customer_is_present)
    requestParams.customer_is_present = "yes";

  return requestParams;
};


const toFormData = (requestParams) => {
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(requestParams)) {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  }
  return formData;
};

module.exports = ({ strapi }) => ({
  async getSettings() {
    const pluginStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "payone-provider"
    });
    return await pluginStore.get({ key: "settings" });
  },

  async updateSettings(settings) {
    const pluginStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "payone-provider"
    });
    await pluginStore.set({
      key: "settings",
      value: settings
    });
    return settings;
  },

  async sendRequest(params) {
    try {
      strapi.log.info("Payone sendRequest called with params:", params);

      const settings = await this.getSettings();

      if (!settings || !settings.aid || !settings.portalid || !settings.key) {
        throw new Error("Payone settings not configured");
      }

      const reqType = params.request;
      if (reqType === "authorization" || reqType === "preauthorization" || reqType === "refund") {
        const prefix = reqType === "refund" ? "REF" : reqType === "preauthorization" ? "PRE" : "AUTH";
        params.reference = normalizeReference(params.reference, prefix);
      }

      const requestParams = buildClientRequestParams(settings, params);
      const debugParams = { ...requestParams };
      if (debugParams.key) debugParams.key = "***HIDDEN***";
      strapi.log.info("Payone Client API request params:", debugParams);
      const formData = toFormData(requestParams);

      strapi.log.info("Payone form data being sent:", formData.toString());
      strapi.log.info("Payone form data reference:", formData.get("reference"));

      const response = await axios.post(POST_GATEWAY_URL, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 30000
      });

      let dataSample = "null";
      if (response.data) {
        if (typeof response.data === "string") {
          dataSample = response.data.substring(0, 200);
        } else {
          dataSample = JSON.stringify(response.data).substring(0, 200);
        }
      }
      strapi.log.info("Payone raw response:", {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof response.data,
        dataSample,
        fullData:
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data)
      });

      const responseData = this.parseResponse(response.data);
      const extractTxId = (data) => {
        return (
          data.txid ||
          data.TxId ||
          data.tx_id ||
          data.transactionid ||
          data.transaction_id ||
          data.id ||
          null
        );
      };

      await this.logTransaction({
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
  },

  parseResponse(responseText) {
    try {
      if (typeof responseText === "object") {
        return responseText;
      }
      if (responseText.trim().startsWith("{")) {
        return JSON.parse(responseText);
      }
    } catch (e) {
      strapi.log.error("Payone parseResponse error:", e);
    }

    const params = new URLSearchParams(responseText);
    const response = {};
    for (const [key, value] of params) {
      response[key.toLowerCase()] = value;
      response[key] = value;
    }
    return response;
  },

  addPaymentMethodParams(params) {
    const updated = { ...params };
    const clearingtype = updated.clearingtype || "cc";

    switch (clearingtype) {
      case "cc":
        if (!updated.cardpan) updated.cardpan = "4111111111111111";
        if (!updated.cardexpiredate) updated.cardexpiredate = "2512";
        if (!updated.cardcvc2) updated.cardcvc2 = "123";
        if (!updated.cardtype) updated.cardtype = "V";
        break;

      case "wlt":
        if (!updated.wallettype) updated.wallettype = "PPE";
        break;

      case "elv":
        if (!updated.bankcountry) updated.bankcountry = "DE";
        if (!updated.iban) updated.iban = "DE89370400440532013000";
        if (!updated.bic) updated.bic = "COBADEFFXXX";
        if (!updated.bankaccountholder)
          updated.bankaccountholder = `${updated.firstname || "Test"} ${updated.lastname || "User"}`;
        break;

      case "sb":
        if (!updated.bankcountry) updated.bankcountry = "DE";
        if (!updated.onlinebanktransfertype) updated.onlinebanktransfertype = "PNT";
        break;

      case "gp":
        if (!updated.bankcountry) updated.bankcountry = "DE";
        if (!updated.onlinebanktransfertype) updated.onlinebanktransfertype = "GPY";
        break;

      case "idl":
        if (!updated.bankcountry) updated.bankcountry = "NL";
        if (!updated.onlinebanktransfertype) updated.onlinebanktransfertype = "IDL";
        break;

      case "bct":
        if (!updated.bankcountry) updated.bankcountry = "BE";
        if (!updated.onlinebanktransfertype) updated.onlinebanktransfertype = "BCT";
        break;

      case "rec":
        if (!updated.recurrence) updated.recurrence = "recurring";
        break;

      case "fnc":
        if (!updated.financingtype) updated.financingtype = "fnc";
        break;

      case "iv":
        if (!updated.invoicetype) updated.invoicetype = "invoice";
        break;

      default:
        strapi.log.warn(`Unknown clearingtype: ${clearingtype}, using credit card defaults`);
        if (!updated.cardpan) updated.cardpan = "4111111111111111";
        if (!updated.cardexpiredate) updated.cardexpiredate = "2512";
        if (!updated.cardcvc2) updated.cardcvc2 = "123";
        if (!updated.cardtype) updated.cardtype = "V";
        break;
    }

    if (!updated.salutation) updated.salutation = "Herr";
    if (!updated.gender) updated.gender = "m";
    if (!updated.telephonenumber) updated.telephonenumber = "01752345678";
    if (!updated.ip) updated.ip = "127.0.0.1";
    if (!updated.language) updated.language = "de";
    if (!updated.customer_is_present) updated.customer_is_present = "yes";

    return updated;
  },

  async preauthorization(params) {
    strapi.log.info("Payone preauthorization called with params:", params);

    const requiredParams = {
      request: "preauthorization",
      clearingtype: params.clearingtype || "cc",
      ...params
    };

    if (!requiredParams.amount) requiredParams.amount = 1000;
    if (!requiredParams.currency) requiredParams.currency = "EUR";
    if (!requiredParams.reference)
      requiredParams.reference = `PREAUTH-${Date.now()}`;
    if (!requiredParams.firstname) requiredParams.firstname = "Test";
    if (!requiredParams.lastname) requiredParams.lastname = "User";
    if (!requiredParams.street) requiredParams.street = "Test Street 1";
    if (!requiredParams.zip) requiredParams.zip = "12345";
    if (!requiredParams.city) requiredParams.city = "Test City";
    if (!requiredParams.country) requiredParams.country = "DE";
    if (!requiredParams.email) requiredParams.email = "test@example.com";

    const updatedParams = this.addPaymentMethodParams(requiredParams);

    return await this.sendRequest(updatedParams);
  },

  async authorization(params) {
    strapi.log.info("Payone authorization called with params:", params);

    const requiredParams = {
      request: "authorization",
      clearingtype: params.clearingtype || "cc",
      ...params
    };

    const updatedParams = this.addPaymentMethodParams(requiredParams);

    return await this.sendRequest(updatedParams);
  },

  async capture(params) {
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

    return await this.sendRequest(requiredParams);
  },

  async refund(params) {
    strapi.log.info("Payone refund called with params:", params);

    if (!params.txid) {
      throw new Error("Transaction ID (txid) is required for refund");
    }

    const requiredParams = {
      request: "refund",
      txid: params.txid,
      ...params
    };

    if (!requiredParams.amount) requiredParams.amount = 1000; // 10.00 EUR in cents
    if (!requiredParams.currency) requiredParams.currency = "EUR";
    if (!requiredParams.reference)
      requiredParams.reference = `REFUND-${Date.now()}`;

    return await this.sendRequest(requiredParams);
  },

  async logTransaction(transactionData) {
    const pluginStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "payone-provider"
    });

    let transactionHistory =
      (await pluginStore.get({ key: "transactionHistory" })) || [];

    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      txid: transactionData.txid || null,
      reference: transactionData.reference || null,
      request_type:
        transactionData.request_type || transactionData.request || "unknown",
      amount: transactionData.amount || null,
      currency: transactionData.currency || "EUR",
      status: transactionData.status || transactionData.Status || "unknown",
      error_code:
        transactionData.error_code || transactionData.Error?.ErrorCode || null,
      error_message:
        transactionData.error_message ||
        transactionData.Error?.ErrorMessage ||
        null,
      customer_message:
        transactionData.customer_message ||
        transactionData.Error?.CustomerMessage ||
        null,
      raw_request: transactionData.raw_request || null,
      raw_response: transactionData.raw_response || transactionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    transactionHistory.unshift(logEntry);

    if (transactionHistory.length > 1000) {
      transactionHistory = transactionHistory.slice(0, 1000);
    }

    await pluginStore.set({
      key: "transactionHistory",
      value: transactionHistory
    });

    strapi.log.info("Transaction logged:", logEntry);
  },

  async getTransactionHistory(filters = {}) {
    const pluginStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "payone-provider"
    });

    let transactionHistory =
      (await pluginStore.get({ key: "transactionHistory" })) || [];

    if (filters.status) {
      transactionHistory = transactionHistory.filter(
        (transaction) => transaction.status === filters.status
      );
    }

    if (filters.request_type) {
      transactionHistory = transactionHistory.filter(
        (transaction) => transaction.request_type === filters.request_type
      );
    }

    if (filters.txid) {
      transactionHistory = transactionHistory.filter(
        (transaction) => transaction.txid === filters.txid
      );
    }

    if (filters.reference) {
      transactionHistory = transactionHistory.filter(
        (transaction) => transaction.reference === filters.reference
      );
    }

    if (filters.date_from) {
      transactionHistory = transactionHistory.filter(
        (transaction) =>
          new Date(transaction.timestamp) >= new Date(filters.date_from)
      );
    }

    if (filters.date_to) {
      transactionHistory = transactionHistory.filter(
        (transaction) =>
          new Date(transaction.timestamp) <= new Date(filters.date_to)
      );
    }
    return transactionHistory;
  },

  async testConnection() {
    try {
      const settings = await this.getSettings();

      if (!settings || !settings.aid || !settings.portalid || !settings.key) {
        return {
          success: false,
          message:
            "Payone settings not configured. Please fill in all required fields."
        };
      }

      const timestamp = Date.now();
      const testParams = {
        request: "authorization",
        amount: 100,
        currency: "EUR",
        reference: `TEST-${timestamp}`, // Unique reference for each test
        clearingtype: "cc",
        cardtype: "V",
        cardpan: "4111111111111111",
        cardexpiredate: "2512",
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

      const originalSendRequest = this.sendRequest.bind(this);
      this.sendRequest = async (params) => {
        try {
          const settings = await this.getSettings();

          if (
            !settings ||
            !settings.aid ||
            !settings.portalid ||
            !settings.key
          ) {
            throw new Error("Payone settings not configured");
          }

          const requestParams = buildClientRequestParams(settings, params);
          const formData = toFormData(requestParams);

          // Send request to Payone
          const response = await axios.post(POST_GATEWAY_URL, formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: 30000
          });
          const responseData = this.parseResponse(response.data);

          return responseData;
        } catch (error) {
          strapi.log.error("Payone API request failed:", error.message);

          if (error.response) {
            strapi.log.error("Response error:", {
              status: error.response.status,
              data: error.response.data
            });
          }

          throw error;
        }
      };

      const result = await this.sendRequest(testParams);

      this.sendRequest = originalSendRequest;

      const status = result.status || result.Status || result.STATUS;
      const errorMessage =
        result.errormessage ||
        result.Errormessage ||
        result.ERRORMESSAGE ||
        result.error ||
        result.Error ||
        result.ERROR ||
        "";
      const errorCode =
        result.errorcode ||
        result.Errorcode ||
        result.ERRORCODE ||
        (result.Error && result.Error.ErrorCode) ||
        "";
      const customErrorMessage =
        result.customerrormessage ||
        result.Customerrormessage ||
        result.CUSTOMERRORMESSAGE ||
        (result.Error && result.Error.CustomerMessage) ||
        "";

      strapi.log.info("Payone test connection response:", {
        status,
        errorCode,
        keys: Object.keys(result)
      });

      if (status === "ERROR" || status === "error") {
        // First check for authentication errors (including "Key incorrect")
        if (
          errorCode === "2006" ||
          errorCode === "920" ||
          errorCode === "921" ||
          errorCode === "922" ||
          errorCode === "401" || // common unauthorized style codes
          errorCode === "403"
        ) {
          const errorMsg =
            customErrorMessage ||
            (typeof errorMessage === "string"
              ? errorMessage
              : JSON.stringify(errorMessage)) ||
            "Invalid credentials";
          return {
            success: false,
            message: `Authentication failed: ${errorMsg}`,
            errorcode: errorCode
          };
        }

        // Additional heuristic for invalid credentials based on message content
        const errorMessageStr =
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage);
        const errorMessageLower = (errorMessageStr || "").toLowerCase();
        if (
          errorMessageLower.includes("key incorrect") ||
          errorMessageLower.includes("invalid key") ||
          errorMessageLower.includes("portal key") ||
          errorMessageLower.includes("unauthorized") ||
          errorMessageLower.includes("not authorized") ||
          errorMessageLower.includes("unknown aid") ||
          errorMessageLower.includes("unknown account") ||
          errorMessageLower.includes("unknown portal") ||
          errorMessageLower.includes("unknown merchant") ||
          errorMessageLower.includes("invalid aid") ||
          errorMessageLower.includes("invalid mid") ||
          errorMessageLower.includes("invalid portalid")
        ) {
          return {
            success: false,
            message: `Authentication failed: ${errorMessageStr}`,
            errorcode: errorCode || "AUTH"
          };
        }

        // Check for reference already exists (911) - this means credentials are working
        if (errorCode === "911") {
          return {
            success: true,
            message:
              "Connection successful! Your Payone credentials are valid.",
            details: {
              mode: settings.mode,
              aid: settings.aid,
              portalid: settings.portalid,
              mid: settings.mid
            }
          };
        }

        // Otherwise, for any ERROR status treat as failure
        const errorMsg =
          customErrorMessage ||
          (typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage)) ||
          "Unknown error";
        return {
          success: false,
          message: `Connection failed: ${errorMsg}`,
          errorcode: errorCode,
          details: {
            status,
            errorCode,
            rawResponse: JSON.stringify(result).substring(0, 200) // Include partial raw response for debugging
          }
        };
      }

      // APPROVED status shouldn't happen with dummy txid, but if it does, connection is OK
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
        message: `Connection error: ${error.message || "Unknown error"}`,
        error: error.toString(),
        details: {
          errorType: error.constructor.name,
          stack: error.stack ? error.stack.substring(0, 200) : "No stack trace"
        }
      };
    }
  }
});
