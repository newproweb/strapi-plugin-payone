"use strict";

const PLUGIN_NAME = "strapi-plugin-payone-provider";

/**
 * Get Payone service
 * @param {Object} strapi - Strapi instance
 * @returns {Object} Payone service
 */
const getPayoneService = (strapi) => {
  return strapi.plugin(PLUGIN_NAME).service("payone");
};

/**
 * Handle error response
 * @param {Object} ctx - Koa context
 * @param {Error} error - Error object
 */
const handleError = (ctx, error) => {
  strapi.log.error("Payone controller error:", error);
  ctx.throw(500, error);
};

/**
 * Hide sensitive key in settings
 * @param {Object} settings - Settings object
 * @returns {Object} Settings with hidden key
 */
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

  /**
   * Handle 3D Secure callback from Payone
   * This endpoint receives the callback after customer completes 3DS authentication
   */
  async handle3DSCallback(ctx) {
    try {
      strapi.log.info("3DS callback received:", ctx.request.body);

      const callbackData = ctx.request.body;
      const result = await getPayoneService(strapi).handle3DSCallback(callbackData);

      ctx.body = { data: result };
    } catch (error) {
      strapi.log.error("3DS callback error:", error);
      handleError(ctx, error);
    }
  }
});
