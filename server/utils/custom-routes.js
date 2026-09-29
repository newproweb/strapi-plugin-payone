"use strict";

const fs = require("fs");
const path = require("path");
const {
  PLUGIN_ID,
  THREE_DS_REDIRECT_ROUTES,
  APPLE_PAY_DOMAIN_ROUTE,
  APPLE_PAY_DOMAIN_FILES
} = require("../constants");

const WELL_KNOWN_DIR = path.resolve(__dirname, "..", "..", ".well-known");
const ONE_YEAR_SECONDS = 31536000;

const readDomainAssociationFile = () => {
  const filePath = APPLE_PAY_DOMAIN_FILES
    .map((name) => path.join(WELL_KNOWN_DIR, name))
    .find((candidate) => fs.existsSync(candidate));
  return filePath ? fs.readFileSync(filePath, "utf8") : null;
};

const sendText = (ctx, status, body) => {
  if (status) ctx.status = status;
  ctx.type = "text/plain";
  ctx.body = body;
};

const serveDomainAssociation = async (ctx) => {
  try {
    const content = readDomainAssociationFile();
    if (!content) return sendText(ctx, 404, "File not found");

    ctx.type = "text/plain";
    ctx.set("Content-Type", "text/plain");
    ctx.set("Cache-Control", `public, max-age=${ONE_YEAR_SECONDS}`);
    ctx.body = content.trim();
  } catch (error) {
    sendText(ctx, 500, "Internal server error");
  }
};

/**
 * Registers the routes that live outside the plugin's URL prefix: the GET redirects Payone sends
 * the customer to after 3-D Secure, and the Apple Pay domain-verification file.
 */
const registerCustomRoutes = (strapi) => {
  const Router = require("@koa/router");
  const router = new Router();

  for (const route of THREE_DS_REDIRECT_ROUTES) {
    router.get(route, (ctx) => strapi.plugin(PLUGIN_ID).controller("payment").handle3DSCallback(ctx));
  }
  router.get(APPLE_PAY_DOMAIN_ROUTE, serveDomainAssociation);

  if (strapi.server.app && typeof strapi.server.app.use === "function") {
    strapi.server.app.use(router.routes());
    strapi.server.app.use(router.allowedMethods());
  }
};

module.exports = { registerCustomRoutes };
