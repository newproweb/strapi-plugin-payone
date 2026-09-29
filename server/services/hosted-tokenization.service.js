"use strict";

const crypto = require("crypto");
const { getService } = require("../utils/get-service");
const { postToGateway } = require("../utils/payone-client");

const SHA384_HEX = /^[0-9a-f]{96}$/i;

const badRequest = (message) => Object.assign(new Error(message), { status: 400 });

const sha384HexLower = (value) =>
  crypto.createHash("sha384").update(String(value), "utf8").digest("hex").toLowerCase();

/** getJWT expects the SHA-384 of the portal key; a stored key that already is one is passed as-is. */
const portalKeyToJwtKey = (portalKeyOrHash) => {
  const key = String(portalKeyOrHash || "").trim();
  return SHA384_HEX.test(key) ? key.toLowerCase() : sha384HexLower(key);
};

module.exports = ({ strapi }) => {
  /** Requests a Hosted Tokenization JWT (`request=getJWT`) for the configured portal. */
  const createHostedTokenizationJwt = async () => {
    const settings = await getService(strapi, "settings").getSettings();
    if (!settings) throw badRequest("PAYONE plugin settings missing");

    const { mid, portalid, key } = settings;
    if (!mid || !portalid || !key) throw badRequest("Missing required settings for getJWT (mid, portalid, key)");

    const form = new URLSearchParams();
    form.append("request", "getJWT");
    form.append("mid", String(mid));
    form.append("portalid", String(portalid));
    form.append("key", portalKeyToJwtKey(key));

    const response = await postToGateway(form.toString(), { headers: { Accept: "application/json" } });
    return response.data;
  };

  return { createHostedTokenizationJwt };
};
