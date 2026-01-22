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
        merchantIdentifier: "",
        enable3DSecure: false,
        enableCreditCard: false,
        enablePayPal: false,
        enableGooglePay: false,
        enableApplePay: false,
        enableSepaDirectDebit: false
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
        const pluginRoot = path.resolve(__dirname, '..');
        const wellKnownPath = path.join(pluginRoot, '.well-known');
        const possiblePaths = [
          path.join(wellKnownPath, 'apple-developer-merchantid-domain-association'),
          path.join(wellKnownPath, 'apple-developer-merchantid-domain-association.txt'),
          path.join(wellKnownPath, 'apple-developer-merchant-id-domain-association.txt'),
        ];

        let fileContent = null;
        let filePathFound = null;

        for (const filePath of possiblePaths) {
          if (fs.existsSync(filePath)) {
            filePathFound = filePath;
            fileContent = fs.readFileSync(filePath, 'utf8');
            break;
          }
        }

        if (fileContent) {
          ctx.type = 'text/plain';
          ctx.set('Content-Type', 'text/plain');
          ctx.set('Cache-Control', 'public, max-age=31536000');
          ctx.body = fileContent.trim();
        } else {
          ctx.status = 404;
          ctx.type = 'text/plain';
          ctx.body = 'File not found';
        }
      } catch (error) {
        ctx.status = 500;
        ctx.type = 'text/plain';
        ctx.body = 'Internal server error';
      }
    });

    if (strapi.server.app && typeof strapi.server.app.use === 'function') {
      strapi.server.app.use(router.routes());
      strapi.server.app.use(router.allowedMethods());
    }
  } catch (error) {
    // Silent fail
  }
};
