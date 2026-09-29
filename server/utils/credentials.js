"use strict";

/**
 * Whether the stored credentials are enough to talk to Payone: either the post-gateway
 * (aid + portalid + key) or the Server API (merchant id + API key id + secret).
 */
const isConfigured = (settings) => {
  const hasPostGateway = !!(settings && settings.aid && settings.portalid && settings.key);
  const hasServerApi = !!(
    settings &&
    (settings.serverApiMerchantId || settings.mid) &&
    settings.serverApiKeyId &&
    settings.serverApiSecret
  );
  return hasPostGateway || hasServerApi;
};

module.exports = { isConfigured };
