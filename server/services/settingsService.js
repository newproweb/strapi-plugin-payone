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
  return await pluginStore.get({ key: "settings" });
};

const updateSettings = async (strapi, settings) => {
  const pluginStore = getPluginStore(strapi);
  await pluginStore.set({
    key: "settings",
    value: settings
  });
  return settings;
};

const validateSettings = (settings) => {
  return !!(settings && settings.aid && settings.portalid && settings.key);
};

module.exports = {
  getSettings,
  updateSettings,
  validateSettings,
  getPluginStore,
  PLUGIN_NAME
};

