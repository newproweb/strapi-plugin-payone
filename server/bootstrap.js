"use strict";

const { getService } = require("./utils/get-service");
const { registerCustomRoutes } = require("./utils/custom-routes");

module.exports = async ({ strapi }) => {
  await getService(strapi, "settings").ensureDefaultSettings();

  try {
    registerCustomRoutes(strapi);
  } catch {
    return;
  }
};
