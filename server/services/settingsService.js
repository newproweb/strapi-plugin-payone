"use strict";

const PLUGIN_NAME = "strapi-plugin-payone-provider";

const getPluginStore = (strapi) => {
  return strapi.store({
    environment: "",
    type: "plugin",
    name: PLUGIN_NAME
  });
};

const getSettings = async (strapi) => {
  const pluginStore = getPluginStore(strapi);
  const settings = await pluginStore.get({ key: "settings" }) || {};

  return settings;
};

const updateSettings = async (strapi, settings) => {
  const pluginStore = getPluginStore(strapi);
  const currentSettings = await getSettings(strapi) || {};
  const mergedSettings = {
    ...currentSettings,
    ...settings
  };


  await pluginStore.set({
    key: "settings",
    value: mergedSettings
  });

  return mergedSettings;
};

const validateSettings = (settings) => {
  // Legacy post-gateway (PAY1): requires aid/portalid/key
  const hasPostGateway = !!(settings && settings.aid && settings.portalid && settings.key);

  // PAYONE Server API (Hosted Tokenization / REST): requires merchantId + apiKeyId + apiSecret
  const hasServerApi = !!(
    settings &&
    (settings.serverApiMerchantId || settings.mid) &&
    settings.serverApiKeyId &&
    settings.serverApiSecret
  );

  return hasPostGateway || hasServerApi;
};

module.exports = {
  getSettings,
  updateSettings,
  validateSettings,
  getPluginStore,
  PLUGIN_NAME
};

