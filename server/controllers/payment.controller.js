"use strict";

const crypto = require("crypto");
const { PLUGIN_ID } = require("../constants");
const { getService } = require("../utils/get-service");
const { readRequestData, respondWithError } = require("../utils/http");

const THREE_DS_RESULT_BY_PATH = [
  ["/success", "success"],
  ["/error", "error"],
  ["/back", "cancelled"]
];

const threeDSResultOf = (path) => THREE_DS_RESULT_BY_PATH.find(([segment]) => path.includes(segment))?.[1] || "callback";

const threeDSRedirectUrl = (path, resultType, result) => {
  const basePath = path.includes("/content-ui") ? "/content-ui" : "/admin";
  const query = new URLSearchParams();
  query.set("3ds", resultType);
  if (result.txid) query.set("txid", result.txid);
  if (result.status) query.set("status", result.status);
  return `${basePath}/plugins/${PLUGIN_ID}?${query.toString()}`;
};

/** Text Payone signs for the hosted credit card check: `${aid}UTF-8${mid}${mode}${portalid}creditcardcheckJSONyes`. */
const creditCardCheckText = (settings) =>
  `${settings.aid}UTF-8${settings.mid}${settings.mode}${settings.portalid}creditcardcheckJSONyes`;

module.exports = ({ strapi }) => {
  const paymentService = () => getService(strapi, "payment");

  const handlePayment = (action) => async (ctx) => {
    try {
      ctx.body = await paymentService()[action](readRequestData(ctx));
    } catch (error) {
      respondWithError(ctx, error);
    }
  };

  return {
    preauthorization: handlePayment("preauthorization"),
    authorization: handlePayment("authorization"),
    capture: handlePayment("capture"),
    refund: handlePayment("refund"),

    async handle3DSCallback(ctx) {
      try {
        const isGetRequest = ctx.request.method === "GET";
        const currentPath = ctx.request.url;
        const resultType = threeDSResultOf(currentPath);
        const callbackData = isGetRequest ? ctx.query : ctx.request.body || ctx.request?.data;

        const result = await paymentService().handle3DSCallback(callbackData, resultType);

        if (isGetRequest) return ctx.redirect(threeDSRedirectUrl(currentPath, resultType, result));
        ctx.body = result;
      } catch (error) {
        respondWithError(ctx, error);
      }
    },

    async hostedTokenizationJwt(ctx) {
      try {
        const result = await getService(strapi, "hostedTokenization").createHostedTokenizationJwt();
        ctx.body = { data: { token: result?.token || null, expirationDate: result?.expirationDate || null } };
      } catch (error) {
        respondWithError(ctx, error);
      }
    },

    async hash384(ctx) {
      try {
        const settings = await getService(strapi, "settings").getSettings();
        const hmacKey = settings?.key || "";

        if (!hmacKey) ctx.throw(400, "Payone key is not configured in plugin settings");
        if (!settings?.aid || !settings?.mid || !settings?.portalid || !settings?.mode) {
          ctx.throw(400, "Required settings (aid, mid, portalid, mode) are not configured");
        }

        const textToHash = creditCardCheckText(settings);
        const hash = crypto.createHmac("sha384", hmacKey).update(textToHash).digest("hex");
        ctx.body = { hash, text: textToHash };
      } catch (error) {
        respondWithError(ctx, error);
      }
    }
  };
};
