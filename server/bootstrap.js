"use strict";

module.exports = async ({ strapi }) => {
  const pluginStore = strapi.store({
    environment: "",
    type: "plugin",
    name: "strapi-plugin-payone-provider"
  });

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

  const pluginName = "strapi-plugin-payone-provider";

  const getController = () => {
    return strapi.plugin(pluginName).controller("payone");
  };

  const routes = [
    "/admin/plugins/strapi-plugin-payone-provider/payment/success",
    "/admin/plugins/strapi-plugin-payone-provider/payment/error",
    "/admin/plugins/strapi-plugin-payone-provider/payment/back",
    "/content-ui/plugins/strapi-plugin-payone-provider/payment/success",
    "/content-ui/plugins/strapi-plugin-payone-provider/payment/error",
    "/content-ui/plugins/strapi-plugin-payone-provider/payment/back"
  ];

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

    router.get('/.well-known/apple-developer-merchantid-domain-association', async (ctx) => {
      try {
        const publicPath = path.join(process.cwd(), 'public');
        const wellKnownPath = path.join(publicPath, '.well-known');
        const filePath = path.join(wellKnownPath, 'apple-developer-merchantid-domain-association');
        const filePathTxt = path.join(wellKnownPath, 'apple-developer-merchant-id-domain-association.txt');

        let fileContent = null;
        let filePathFound = null;

        if (fs.existsSync(filePath)) {
          filePathFound = filePath;
          fileContent = fs.readFileSync(filePath, 'utf8');
        }
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
