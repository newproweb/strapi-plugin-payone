"use strict";

const { getService } = require("../utils/get-service");

const DEFAULT_ERROR_DETAILS =
  "Please check your Payone Apple Pay configuration in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Apple Pay). Ensure that Merchant ID (mid) is correctly configured and Apple Pay is enabled for your portal.";

const FORBIDDEN_ERROR_DETAILS =
  "403 Forbidden: Authentication failed with Payone. " +
  "Please check: 1) Your Payone credentials (aid, portalid, mid, key) in plugin settings, " +
  "2) Mode is set to 'live' (Apple Pay only works in live mode), " +
  "3) Your domain is registered with Payone Merchant Services, " +
  "4) Merchant ID (mid) matches your merchantIdentifier in PMI, " +
  "5) Apple Pay is enabled for your portal in PMI.";

/** Fills domain, display name, currency and country from the request host and plugin settings. */
const withMerchantDefaults = (params, ctx, settings) => {
  const applePayConfig = settings?.applePayConfig || {};
  const requestHost = ctx.request.hostname || ctx.request.host || "localhost";

  params.domain = params.domain || params.domainName || requestHost;
  params.domainName = params.domainName || params.domain;
  if (!params.displayName) params.displayName = settings?.merchantName || "Store";
  if (!params.currency) params.currency = applePayConfig.currencyCode || "EUR";
  if (!params.countryCode) params.countryCode = applePayConfig.countryCode || "DE";
  return params;
};

module.exports = ({ strapi }) => ({
  async validateApplePayMerchant(ctx) {
    try {
      const settings = await getService(strapi, "settings").getSettings();
      const params = ctx.request.body || ctx.request?.data;
      if (!params) throw new Error("Request body is missing");

      const result = await getService(strapi, "applePay").validateApplePayMerchant(withMerchantDefaults(params, ctx, settings));
      if (!result) {
        throw new Error("Merchant validation returned null. Please check your Payone Apple Pay configuration.");
      }
      ctx.body = result;
    } catch (error) {
      const errorStatus = error.status || (error.message?.includes("403") ? 403 : 500);
      const isForbidden = errorStatus === 403 || error.message?.includes("403");

      if (error.response || errorStatus === 403 || errorStatus === 401 || errorStatus >= 500) {
        strapi.log.error("[Apple Pay] Controller error:", { status: errorStatus, message: error.message });
      }

      ctx.status = errorStatus;
      ctx.body = {
        error: {
          status: errorStatus,
          name: error.name || "Error",
          message: error.message || "Apple Pay merchant validation failed",
          details: isForbidden ? FORBIDDEN_ERROR_DETAILS : DEFAULT_ERROR_DETAILS
        }
      };
    }
  }
});
