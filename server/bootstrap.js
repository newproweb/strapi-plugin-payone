"use strict";

module.exports = async ({ strapi }) => {
  // Initialize plugin settings store
  const pluginStore = strapi.store({
    environment: "",
    type: "plugin",
    name: "strapi-plugin-payone-provider"
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
        api_version: "3.10",
        merchantName: "",
        displayName: "",
        domainName: "",
        merchantIdentifier: ""
      }
    });
  }

  // Register custom routes for 3DS redirects at root level
  // These routes handle redirects from Payone after 3DS authentication
  // They work with both /admin/ and /content-ui/ paths
  const pluginName = "strapi-plugin-payone-provider";

  // Get the controller
  const getController = () => {
    return strapi.plugin(pluginName).controller("payone");
  };

  // All routes use the same handler - it detects success/error/back from URL path
  // Routes match the plugin's internal payment callback URLs
  const routes = [
    "/admin/plugins/strapi-plugin-payone-provider/payment/success",
    "/admin/plugins/strapi-plugin-payone-provider/payment/error",
    "/admin/plugins/strapi-plugin-payone-provider/payment/back",
    "/content-ui/plugins/strapi-plugin-payone-provider/payment/success",
    "/content-ui/plugins/strapi-plugin-payone-provider/payment/error",
    "/content-ui/plugins/strapi-plugin-payone-provider/payment/back"
  ];

  // Register routes using Koa router
  try {
    const Router = require('@koa/router');
    const router = new Router();

    routes.forEach(route => {
      router.get(route, async (ctx) => {
        const controller = getController();
        return await controller.handle3DSCallback(ctx);
      });
    });

    // Add router to the server app
    if (strapi.server.app && typeof strapi.server.app.use === 'function') {
      strapi.server.app.use(router.routes());
      strapi.server.app.use(router.allowedMethods());
    }
  } catch (error) {
    strapi.log.warn('Could not register 3DS callback routes:', error.message);
  }
};
