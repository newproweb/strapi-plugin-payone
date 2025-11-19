"use strict";

const PLUGIN_NAME = "strapi-plugin-payone-provider";

/**
 * Get plugin store instance
 * @param {Object} strapi - Strapi instance
 * @returns {Object} Plugin store
 */
const getPluginStore = (strapi) => {
  return strapi.store({
    environment: "",
    type: "plugin",
    name: PLUGIN_NAME
  });
};

/**
 * Get Payone settings
 * @param {Object} strapi - Strapi instance
 * @returns {Promise<Object>} Settings
 */
const getSettings = async (strapi) => {
  const pluginStore = getPluginStore(strapi);
  return await pluginStore.get({ key: "settings" });
};

/**
 * Update Payone settings
 * @param {Object} strapi - Strapi instance
 * @param {Object} settings - Settings to update
 * @returns {Promise<Object>} Updated settings
 */
const updateSettings = async (strapi, settings) => {
  const pluginStore = getPluginStore(strapi);
  await pluginStore.set({
    key: "settings",
    value: settings
  });
  return settings;
};

/**
 * Validate settings
 * @param {Object} settings - Settings to validate
 * @returns {boolean} True if valid
 */
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

