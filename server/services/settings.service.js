"use strict";

const { PLUGIN_ID, SETTINGS_KEY, DEFAULT_STORE_SETTINGS } = require("../constants");

module.exports = ({ strapi }) => {
  const pluginStore = () => strapi.store({ environment: "", type: "plugin", name: PLUGIN_ID });

  const getSettings = async () => (await pluginStore().get({ key: SETTINGS_KEY })) || {};

  const updateSettings = async (changes) => {
    const mergedSettings = { ...(await getSettings()), ...changes };
    await pluginStore().set({ key: SETTINGS_KEY, value: mergedSettings });
    return mergedSettings;
  };

  const ensureDefaultSettings = async () => {
    const store = pluginStore();
    const settings = await store.get({ key: SETTINGS_KEY });
    if (!settings) await store.set({ key: SETTINGS_KEY, value: DEFAULT_STORE_SETTINGS });
  };

  return { getSettings, updateSettings, ensureDefaultSettings };
};
