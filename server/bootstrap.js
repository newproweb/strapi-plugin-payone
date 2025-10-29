"use strict";

module.exports = async ({ strapi }) => {
  // Initialize plugin settings store
  const pluginStore = strapi.store({
    environment: "",
    type: "plugin",
    name: "payone-provider"
  });

  // Initialize default settings if not already set
  const settings = await pluginStore.get({ key: "settings" });
  if (!settings) {
    await pluginStore.set({
      key: "settings",
      value: {
        aid: "",
        portalid: "",
        mid: "",
        key: "",
        mode: "test",
        api_version: "3.10"
      }
    });
  }
};
