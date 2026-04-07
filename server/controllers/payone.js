"use strict";

const PLUGIN_NAME = "strapi-plugin-payone-provider";
const { rowsToCsv, csvToRows, TRANSACTION_ATTRS } = require("../utils/csvTransactions");

const getPayoneService = (strapi) => {
  return strapi.plugin(PLUGIN_NAME).service("payone");
};

const getNewHostedTokenizationService = (strapi) => {
  return strapi.plugin(PLUGIN_NAME).service("newHostedTokenizationService");
};

const buildFiltersFromQuery = (rawFilters = {}) => {
  const filters = {};
  if (rawFilters && typeof rawFilters === "object") {
    for (const [key, value] of Object.entries(rawFilters)) {
      const v = value == null ? "" : String(value).trim();
      if (v !== "" && v.toLowerCase() !== "all") filters[key] = value;
    }
  }
  return filters;
};

const handleError = (ctx, error) => {
  const status = error.status || error.response?.status || 500;
  const message = error.message || "Internal server error";

  if (status >= 400) {
    console.log("[Payone] Controller error:", {
      status,
      message,
      error: error.stack || error
    });
  }

  ctx.status = status;
  ctx.body = {
    error: {
      status,
      message,
      name: error.name || "Error"
    }
  };
};

const hideKey = (settings) => {
  if (settings && settings.key) {
    settings.key = "***HIDDEN***";
  }
  if (settings && settings.serverApiSecret) {
    settings.serverApiSecret = "***HIDDEN***";
  }
  return settings;
};

module.exports = ({ strapi }) => ({
  async getSettings(ctx) {
    try {
      const settings = await getPayoneService(strapi).getSettings();
      ctx.body = {
        ...hideKey(settings || {})
      };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async getPublicSettings(ctx) {
    try {
      const settings = await getPayoneService(strapi).getSettings();
      ctx.body = {
        data: {
          mid: settings?.mid || null,
          mode: settings?.mode || null,
          domainName: settings?.domainName || null,
          displayName: settings?.displayName || null,
          portalid: settings?.portalid || null,
          accountId: settings?.aid || null,
          paymentMethods: {
            creditCard: settings?.enableCreditCard,
            paypal: settings?.enablePayPal,
            googlePay: settings?.enableGooglePay,
            applePay: settings?.enableApplePay,
            sofort: settings?.enableSofort,
            sepa: settings?.enableSepaDirectDebit,
          },
        }
      };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async updateSettings(ctx) {
    try {
      const bodyData = ctx.request.body?.data || ctx.request.body;

      if (!bodyData || typeof bodyData !== 'object') {
        ctx.throw(400, "Invalid request body");
      }

      const currentSettings = await getPayoneService(strapi).getSettings();

      if (bodyData.key === "***HIDDEN***" || !bodyData.key) {
        bodyData.key = currentSettings?.key;
      }
      if (bodyData.serverApiSecret === "***HIDDEN***" || !bodyData.serverApiSecret) {
        bodyData.serverApiSecret = currentSettings?.serverApiSecret;
      }

      const settings = await getPayoneService(strapi).updateSettings(bodyData);
      ctx.body = { ...hideKey(settings) };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async preauthorization(ctx) {
    try {
      const params = ctx.request.body?.data || ctx.request.body;
      if (!params || typeof params !== 'object') {
        ctx.throw(400, "Invalid request body");
      }

      const result = await getPayoneService(strapi).preauthorization(params);
      ctx.body = result;
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async authorization(ctx) {
    try {
      const params = ctx.request.body?.data || ctx.request.body;

      if (!params || typeof params !== 'object') {
        ctx.throw(400, "Invalid request body");
      }

      const result = await getPayoneService(strapi).authorization(params);
      ctx.body = result;
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async capture(ctx) {
    try {
      const params = ctx.request.body?.data || ctx.request.body;

      if (!params || typeof params !== 'object') {
        ctx.throw(400, "Invalid request body");
      }

      const result = await getPayoneService(strapi).capture(params);
      ctx.body = result;
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async refund(ctx) {
    try {
      const params = ctx.request.body?.data || ctx.request.body;

      if (!params || typeof params !== 'object') {
        ctx.throw(400, "Invalid request body");
      }

      const result = await getPayoneService(strapi).refund(params);
      ctx.body = result;
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async getTransactionHistory(ctx) {
    try {
      const { filters: rawFilters = {}, pagination = {} } = ctx.query || {};
      const page = parseInt(pagination.page || "1", 10);
      const pageSize = parseInt(pagination.pageSize || "10", 10);

      const filters = {};
      if (rawFilters && typeof rawFilters === "object") {
        for (const [key, value] of Object.entries(rawFilters)) {
          const v = value == null ? "" : String(value).trim();
          if (v !== "" && v.toLowerCase() !== "all") {
            filters[key] = value;
          }
        }
      }

      const result = await getPayoneService(strapi).getTransactionHistory({
        filters,
        pagination: { page, pageSize }
      });

      ctx.body = {
        data: result.data || [],
        meta: {
          pagination: result.pagination
        },
      };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async exportTransactions(ctx) {
    try {
      const { filters: rawFilters = {}, format = "json", sort_by, sort_order } = ctx.query || {};
      const filters = buildFiltersFromQuery(rawFilters);
      const data = await getPayoneService(strapi).getTransactionsForExport({
        filters,
        sort_by: sort_by || "createdAt",
        sort_order: sort_order || "desc",
      });
      const rows = Array.isArray(data) ? data : [];
      const fmt = (format || "json").toLowerCase();

      if (fmt === "csv") {
        ctx.set("Content-Type", "text/csv; charset=utf-8");
        ctx.set("Content-Disposition", 'attachment; filename="transactions.csv"');
        ctx.body = rowsToCsv(rows, TRANSACTION_ATTRS);
        return;
      }

      ctx.set("Content-Type", "application/json");
      ctx.set("Content-Disposition", 'attachment; filename="transactions.json"');
      ctx.body = rows;
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async importTransactions(ctx) {
    try {
      const body = ctx.request.body;
      if (!body || typeof body !== "object") ctx.throw(400, "Request body must be JSON");

      let rows = [];
      if (Array.isArray(body)) {
        rows = body;
      } else if (Array.isArray(body.data)) {
        rows = body.data;
      } else if (body.format === "csv" && typeof body.data === "string") {
        rows = csvToRows(body.data);
      } else {
        ctx.throw(400, "Body must be an array, { data: array }, or { format: 'csv', data: csvString }");
      }

      if (rows.length === 0) {
        ctx.body = { imported: 0, failed: 0, errors: [], message: "No rows to import" };
        return;
      }

      const result = await getPayoneService(strapi).importTransactions(rows);
      ctx.body = {
        ...result,
        message: `Imported ${result.imported}, failed ${result.failed}`,
      };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async testConnection(ctx) {
    try {
      const result = await getPayoneService(strapi).testConnection();
      ctx.body = result || {};
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async handle3DSCallback(ctx) {
    try {
      const isGetRequest = ctx.request.method === "GET";
      const currentPath = ctx.request.url;

      let resultType = "callback";
      if (currentPath.includes("/success")) {
        resultType = "success";
      } else if (currentPath.includes("/error")) {
        resultType = "error";
      } else if (currentPath.includes("/back")) {
        resultType = "cancelled";
      }

      const callbackData = isGetRequest
        ? ctx.query
        : (ctx.request.body || ctx.request.body?.data || ctx.request?.data);

      const result = await getPayoneService(strapi).handle3DSCallback(callbackData, resultType);

      if (isGetRequest) {
        const isContentUI = currentPath.includes('/content-ui');
        const basePath = isContentUI ? '/content-ui' : '/admin';
        const pluginPath = '/plugins/strapi-plugin-payone-provider';

        const queryParams = new URLSearchParams();
        queryParams.set('3ds', resultType);
        if (result.txid) queryParams.set('txid', result.txid);
        if (result.status) queryParams.set('status', result.status);

        const redirectUrl = `${basePath}${pluginPath}?${queryParams.toString()}`;
        return ctx.redirect(redirectUrl);
      }

      ctx.body = result;
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async validateApplePayMerchant(ctx) {
    try {
      const settings = await getPayoneService(strapi).getSettings();
      const applePayConfig = settings?.applePayConfig || {};

      const params = ctx.request.body || ctx.request.body?.data || ctx.request?.data;

      if (!params) {
        throw new Error("Request body is missing");
      }

      if (!params.domain && !params.domainName) {
        params.domain = ctx.request.hostname || ctx.request.host || 'localhost';
        params.domainName = params.domain;
      } else if (params.domain && !params.domainName) {
        params.domainName = params.domain;
      } else if (params.domainName && !params.domain) {
        params.domain = params.domainName;
      }

      if (!params.displayName) {
        params.displayName = settings?.merchantName || "Store";
      }

      if (!params.currency) {
        params.currency = applePayConfig.currencyCode || "EUR";
      }
      if (!params.countryCode) {
        params.countryCode = applePayConfig.countryCode || "DE";
      }

      let result = await getPayoneService(strapi).validateApplePayMerchant(params);

      if (!result) {
        throw new Error("Merchant validation returned null. Please check your Payone Apple Pay configuration.");
      }

      ctx.body = result;
    } catch (error) {
      const errorStatus = error.status || (error.message?.includes('403') ? 403 : 500);

      if (error.response || errorStatus === 403 || errorStatus === 401 || errorStatus >= 500) {
        strapi.log.error("[Apple Pay] Controller error:", {
          status: errorStatus,
          message: error.message
        });
      }

      let errorMessage = error.message || "Apple Pay merchant validation failed";
      let errorDetails = "Please check your Payone Apple Pay configuration in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Apple Pay). Ensure that Merchant ID (mid) is correctly configured and Apple Pay is enabled for your portal.";

      if (errorStatus === 403 || error.message?.includes('403')) {
        errorDetails = "403 Forbidden: Authentication failed with Payone. " +
          "Please check: 1) Your Payone credentials (aid, portalid, mid, key) in plugin settings, " +
          "2) Mode is set to 'live' (Apple Pay only works in live mode), " +
          "3) Your domain is registered with Payone Merchant Services, " +
          "4) Merchant ID (mid) matches your merchantIdentifier in PMI, " +
          "5) Apple Pay is enabled for your portal in PMI.";
      }

      ctx.status = errorStatus;
      ctx.body = {
        error: {
          status: errorStatus,
          name: error.name || "Error",
          message: errorMessage,
          details: errorDetails
        }
      };
    }
  },

  async handleTransactionStatus(ctx) {
    try {
      const notificationData = ctx.request.body || {};
      await getPayoneService(strapi).processTransactionStatus(notificationData);
      console.warn("[Payone] Notification Status", {
        ip: ctx.request.ip,
      });
    } catch (error) {
      strapi.log.error("[Payone TransactionStatus] Error:", error);
    }

    ctx.status = 200;
    ctx.body = "TSOK";
    ctx.type = "text/plain";
  },

  async hostedTokenizationJwt(ctx) {
    try {
      const result = await getNewHostedTokenizationService(strapi).createHostedTokenizationJwt();
      ctx.body = {
        data: {
          token: result?.token || null,
          expirationDate: result?.expirationDate || null,
        },
      };
    } catch (error) {
      handleError(ctx, error);
    }
  },
});
