"use strict";

const axios = require("axios");
const crypto = require("crypto");
const settingsService = require("./settingsService");

const PAYONE_POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";

function sha384HexLower(value) {
  return crypto.createHash("sha384").update(String(value), "utf8").digest("hex").toLowerCase();
}

function portalKeyToJwtKey(portalKeyOrHash) {
  const key = String(portalKeyOrHash || "").trim();
  if (/^[0-9a-f]{96}$/i.test(key)) return key.toLowerCase();
  return sha384HexLower(key);
}

async function getSettingsOrThrow(strapi) {
  const settings = await settingsService.getSettings(strapi);
  if (!settings) {
    const err = new Error("PAYONE plugin settings missing");
    err.status = 400;
    throw err;
  }
  return settings;
}

async function createHostedTokenizationJwt(strapi) {
  const settings = await getSettingsOrThrow(strapi);

  const { mid, portalid, key } = settings;
  if (!mid || !portalid || !key) {
    const err = new Error("Missing required settings for getJWT (mid, portalid, key)");
    err.status = 400;
    throw err;
  }

  const form = new URLSearchParams();
  form.append("request", "getJWT");
  form.append("mid", String(mid));
  form.append("portalid", String(portalid));
  form.append("key", portalKeyToJwtKey(key));

  const response = await axios.post(PAYONE_POST_GATEWAY_URL, form.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    timeout: 30000,
  });

  return response.data;
}

module.exports = ({ strapi }) => ({
  createHostedTokenizationJwt: async () => createHostedTokenizationJwt(strapi),
});

