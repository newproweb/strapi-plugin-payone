"use strict";

const PLUGIN_NAME = "strapi-plugin-payone-provider";

const getPayoneService = (strapi) => {
  return strapi.plugin(PLUGIN_NAME).service("payone");
};

const handleError = (ctx, error) => {
  if (error.response || error.status >= 400) {
    ctx.strapi.log.error("Payone controller error:", {
      status: error.status || error.response?.status,
      message: error.message
    });
  }
  ctx.throw(500, error);
};

const hideKey = (settings) => {
  if (settings && settings.key) {
    settings.key = "***HIDDEN***";
  }
  return settings;
};

module.exports = ({ strapi }) => ({
  async getSettings(ctx) {
    try {
      const settings = await getPayoneService(strapi).getSettings();
      ctx.body = { data: hideKey(settings) };
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
          portalKey: settings?.key || null,
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
      const { body } = ctx.request;
      const currentSettings = await getPayoneService(strapi).getSettings();

      if (body.key === "***HIDDEN***" || !body.key) {
        body.key = currentSettings?.key;
      }

      const settings = await getPayoneService(strapi).updateSettings(body);
      ctx.body = { data: hideKey(settings) };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async preauthorization(ctx) {
    try {
      const params = ctx.request.body;
      const result = await getPayoneService(strapi).preauthorization(params);
      ctx.body = { data: result };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async authorization(ctx) {
    try {
      const params = ctx.request.body;
      const result = await getPayoneService(strapi).authorization(params);
      ctx.body = { data: result };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async capture(ctx) {
    try {
      const params = ctx.request.body;
      const result = await getPayoneService(strapi).capture(params);
      ctx.body = { data: result };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async refund(ctx) {
    try {
      const params = ctx.request.body;
      const result = await getPayoneService(strapi).refund(params);
      ctx.body = { data: result };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async getTransactionHistory(ctx) {
    try {
      const { filters = {}, pagination = {}, sort_by, sort_order } = ctx.query || {};
      const page = parseInt(pagination.page || "1", 10);
      const pageSize = parseInt(pagination.pageSize || "10", 10);

      const result = await getPayoneService(strapi).getTransactionHistory({
        filters: filters || {},
        pagination: { page, pageSize },
        sort_by: sort_by || undefined,
        sort_order: sort_order || undefined,
      });
      ctx.body = result
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async testConnection(ctx) {
    try {
      const result = await getPayoneService(strapi).testConnection();
      ctx.body = { data: result };
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

      const callbackData = isGetRequest ? ctx.query : ctx.request.body;
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

      ctx.body = { data: result };
    } catch (error) {
      handleError(ctx, error);
    }
  },

  async validateApplePayMerchant(ctx) {
    try {
      const settings = await getPayoneService(strapi).getSettings();
      const applePayConfig = settings?.applePayConfig || {};

      const params = ctx.request.body;

      if (!params) {
        throw new Error("Request body is missing");
      }

      // Ensure domain is set
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

      ctx.body = { data: result };
    } catch (error) {
      const errorStatus = error.status || (error.message?.includes('403') ? 403 : 500);

      // Only log if it's a response error
      if (error.response || errorStatus === 403 || errorStatus === 401 || errorStatus >= 500) {
        strapi.log.error("[Apple Pay] Controller error:", {
          status: errorStatus,
          message: error.message
        });
      }

      // Extract detailed error message if available
      let errorMessage = error.message || "Apple Pay merchant validation failed";
      let errorDetails = "Please check your Payone Apple Pay configuration in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Apple Pay). Ensure that Merchant ID (mid) is correctly configured and Apple Pay is enabled for your portal.";

      // If it's a 403 error, provide more specific guidance
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
  }
});
