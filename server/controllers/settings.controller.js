"use strict";

const { getService } = require("../utils/get-service");
const { readRequestData, respondWithError, hideSecrets, keepStoredSecrets } = require("../utils/http");

const toPublicSettings = (settings) => ({
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
    sepa: settings?.enableSepaDirectDebit
  }
});

module.exports = ({ strapi }) => {
  const settingsService = () => getService(strapi, "settings");

  return {
    async getSettings(ctx) {
      try {
        ctx.body = hideSecrets(await settingsService().getSettings());
      } catch (error) {
        respondWithError(ctx, error);
      }
    },

    async getPublicSettings(ctx) {
      try {
        ctx.body = { data: toPublicSettings(await settingsService().getSettings()) };
      } catch (error) {
        respondWithError(ctx, error);
      }
    },

    async updateSettings(ctx) {
      try {
        const changes = readRequestData(ctx);
        const current = await settingsService().getSettings();
        const settings = await settingsService().updateSettings(keepStoredSecrets(changes, current));
        ctx.body = hideSecrets(settings);
      } catch (error) {
        respondWithError(ctx, error);
      }
    },

    async testConnection(ctx) {
      try {
        ctx.body = (await getService(strapi, "testConnection").testConnection()) || {};
      } catch (error) {
        respondWithError(ctx, error);
      }
    }
  };
};
