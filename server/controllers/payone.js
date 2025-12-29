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
  ctx.strapi.log.error("Payone controller error:", error);
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
   * Works with both /admin/ and /content-ui/ paths
   */
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
      strapi.log.info("[Apple Pay] Merchant validation request received");
      strapi.log.info("[Apple Pay] Request body:", JSON.stringify(ctx.request.body, null, 2));
      strapi.log.info("[Apple Pay] User:", ctx.state.user ? {
        id: ctx.state.user.id,
        email: ctx.state.user.email,
        roles: ctx.state.user.roles?.map(r => r.code)
      } : "No user");

      const params = ctx.request.body;
      let result;
      try {
        result = await getPayoneService(strapi).validateApplePayMerchant(params);
      } catch (serviceError) {
        // Service threw an error - re-throw it so it's caught by the outer catch block
        strapi.log.error("[Apple Pay] Service threw error:", {
          message: serviceError.message,
          stack: serviceError.stack
        });
        throw serviceError;
      }

      strapi.log.info("[Apple Pay] Merchant validation result:", {
        hasResult: !!result,
        resultType: typeof result,
        resultIsObject: result instanceof Object,
        resultKeys: result ? Object.keys(result) : [],
        resultKeysLength: result ? Object.keys(result).length : 0,
        hasMerchantIdentifier: !!result?.merchantIdentifier,
        hasMerchantSessionIdentifier: !!result?.merchantSessionIdentifier,
        merchantIdentifier: result?.merchantIdentifier,
        domainName: result?.domainName,
        displayName: result?.displayName,
        epochTimestamp: result?.epochTimestamp,
        expiresAt: result?.expiresAt,
        fullResult: JSON.stringify(result)
      });

      // Validate result before sending
      // Check if result is null, undefined, empty object, or missing merchantIdentifier
      if (!result || 
          (typeof result === 'object' && Object.keys(result).length === 0) ||
          (!result.merchantIdentifier && !result.merchantSessionIdentifier)) {
        strapi.log.error("[Apple Pay] CRITICAL: Invalid or empty merchant session returned!");
        strapi.log.error("[Apple Pay] Result details:", {
          hasResult: !!result,
          resultType: typeof result,
          resultIsObject: result instanceof Object,
          resultKeys: result ? Object.keys(result) : [],
          resultKeysLength: result ? Object.keys(result).length : 0,
          hasMerchantIdentifier: !!result?.merchantIdentifier,
          hasMerchantSessionIdentifier: !!result?.merchantSessionIdentifier,
          resultStringified: JSON.stringify(result)
        });
        ctx.throw(500, "Apple Pay merchant validation failed: Invalid or empty merchant session received from Payone. Please check your Payone Apple Pay configuration in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Apple Pay). The merchant session must come from Payone after successful Apple Pay onboarding. Check server logs for Payone response details.");
      }

      ctx.body = { data: result };
    } catch (error) {
      strapi.log.error("[Apple Pay] Controller error:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Return error response instead of empty object
      // This will help frontend understand what went wrong
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
