"use strict";

const PLUGIN_NAME = "strapi-plugin-payone-provider";

const getPayoneService = (strapi) => {
  return strapi.plugin(PLUGIN_NAME).service("payone");
};


const handleError = (ctx, error) => {
  ctx.strapi.log.error("Payone controller error:", error);
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
          mode: settings?.mode || null
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
      strapi.log.info("Payone authorization controller called with:", params);
      const result = await getPayoneService(strapi).authorization(params);
      ctx.body = { data: result };
    } catch (error) {
      strapi.log.error("Payone authorization error:", error);
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
      const filters = ctx.query || {};
      const history = await getPayoneService(strapi).getTransactionHistory(filters);
      ctx.body = { data: history };
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
      strapi.log.info(`3DS ${resultType} received (${ctx.request.method}):`, callbackData);
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
      strapi.log.error("3DS callback error:", error);
      handleError(ctx, error);
    }
  },

  async validateApplePayMerchant(ctx) {
    try {
      strapi.log.info("[Apple Pay] Request body:", JSON.stringify(ctx.request.body, null, 2));

      const params = ctx.request.body;
      let result = await getPayoneService(strapi).validateApplePayMerchant(params);
      strapi.log.info("[Apple Pay] Merchant validation result:", JSON.stringify(result, null, 2));
      ctx.body = { data: result };
    } catch (error) {
      strapi.log.error("[Apple Pay] Controller error:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      ctx.status = error.status || 500;
      ctx.body = {
        error: {
          message: error.message || "Apple Pay merchant validation failed",
          details: "Please check your Payone Apple Pay configuration in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Apple Pay)"
        }
      };
    }
  }
});
