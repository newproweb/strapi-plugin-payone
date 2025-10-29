"use strict";

module.exports = ({ strapi }) => ({
  async getSettings(ctx) {
    try {
      const settings = await strapi
        .plugin("payone-provider")
        .service("payone")
        .getSettings();

      if (settings && settings.key) {
        settings.key = "***HIDDEN***";
      }

      ctx.body = { data: settings };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async updateSettings(ctx) {
    try {
      const { body } = ctx.request;

      const currentSettings = await strapi
        .plugin("payone-provider")
        .service("payone")
        .getSettings();

      if (body.key === "***HIDDEN***" || !body.key) {
        body.key = currentSettings.key;
      }

      const settings = await strapi
        .plugin("payone-provider")
        .service("payone")
        .updateSettings(body);

      if (settings && settings.key) {
        settings.key = "***HIDDEN***";
      }

      ctx.body = { data: settings };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async preauthorization(ctx) {
    try {
      const params = ctx.request.body;
      const result = await strapi
        .plugin("payone-provider")
        .service("payone")
        .preauthorization(params);

      ctx.body = { data: result };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async authorization(ctx) {
    try {
      const params = ctx.request.body;
      strapi.log.info("Payone authorization controller called with:", params);

      const result = await strapi
        .plugin("payone-provider")
        .service("payone")
        .authorization(params);

      ctx.body = { data: result };
    } catch (error) {
      strapi.log.error("Payone authorization error:", error);
      ctx.throw(500, error);
    }
  },

  async capture(ctx) {
    try {
      const params = ctx.request.body;
      const result = await strapi
        .plugin("payone-provider")
        .service("payone")
        .capture(params);

      ctx.body = { data: result };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async refund(ctx) {
    try {
      const params = ctx.request.body;
      const result = await strapi
        .plugin("payone-provider")
        .service("payone")
        .refund(params);

      ctx.body = { data: result };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async getTransactionHistory(ctx) {
    try {
      const filters = ctx.query || {};
      const history = await strapi
        .plugin("payone-provider")
        .service("payone")
        .getTransactionHistory(filters);

      ctx.body = { data: history };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async testConnection(ctx) {
    try {
      const result = await strapi
        .plugin("payone-provider")
        .service("payone")
        .testConnection();

      ctx.body = { data: result };
    } catch (error) {
      ctx.throw(500, error);
    }
  }
});
