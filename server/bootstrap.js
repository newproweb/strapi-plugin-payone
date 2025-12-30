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
    const fs = require('fs');
    const path = require('path');

    routes.forEach(route => {
      router.get(route, async (ctx) => {
        const controller = getController();
        return await controller.handle3DSCallback(ctx);
      });
    });

    // Register route for Apple Pay .well-known file
    router.get('/.well-known/apple-developer-merchantid-domain-association', async (ctx) => {
      try {
        const publicPath = path.join(process.cwd(), 'public');
        const wellKnownPath = path.join(publicPath, '.well-known');
        const filePath = path.join(wellKnownPath, 'apple-developer-merchantid-domain-association');
        const filePathTxt = path.join(wellKnownPath, 'apple-developer-merchant-id-domain-association.txt');

        let fileContent = null;
        let filePathFound = null;

        // Try main file first
        if (fs.existsSync(filePath)) {
          filePathFound = filePath;
          fileContent = fs.readFileSync(filePath, 'utf8');
        }
        // Try alternative file name
        else if (fs.existsSync(filePathTxt)) {
          filePathFound = filePathTxt;
          fileContent = fs.readFileSync(filePathTxt, 'utf8');
        }

        if (fileContent) {
          ctx.type = 'text/plain';
          ctx.body = fileContent;
          strapi.log.info(`[Apple Pay] Served well-known file from: ${filePathFound}`);
        } else {
          strapi.log.warn(`[Apple Pay] Well-known file not found. Tried: ${filePath} and ${filePathTxt}`);
          ctx.status = 404;
          ctx.body = {
            error: {
              status: 404,
              name: "NotFoundError",
              message: "Apple Pay domain verification file not found",
              details: {
                expectedPaths: [
                  filePath,
                  filePathTxt
                ]
              }
            }
          };
        }
      } catch (error) {
        strapi.log.error("[Apple Pay] Serve well-known file error:", error);
        ctx.status = 500;
        ctx.body = {
          error: {
            status: 500,
            name: "InternalServerError",
            message: error.message || "Failed to serve well-known file",
            details: error.stack
          }
        };
      }
    });

    if (strapi.server.app && typeof strapi.server.app.use === 'function') {
      strapi.server.app.use(router.routes());
      strapi.server.app.use(router.allowedMethods());
    }
  } catch (error) {
    strapi.log.warn('Could not register 3DS callback routes:', error.message);
  }
};
