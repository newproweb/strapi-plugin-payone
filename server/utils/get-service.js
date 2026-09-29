"use strict";

const { PLUGIN_ID } = require("../constants");

const getService = (strapi, name) => strapi.plugin(PLUGIN_ID).service(name);

module.exports = { getService };
