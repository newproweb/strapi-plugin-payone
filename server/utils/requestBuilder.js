"use strict";

const crypto = require("crypto");
const { normalizeCustomerId } = require("./normalize");


const buildClientRequestParams = (settings, params, logger = null) => {
  const requestParams = {
    request: params.request,
    aid: settings.aid,
    mid: settings.mid,
    portalid: settings.portalid,
    mode: params.testOrder ? "test" : settings.mode || "test",
    encoding: "UTF-8",
    ...params
  };

  requestParams.customerid = normalizeCustomerId(
    requestParams.customerid,
    logger
  );

  requestParams.key = crypto
    .createHash("md5")
    .update(settings.portalKey || settings.key)
    .digest("hex");

  if (requiresRedirectUrls(requestParams)) {
    const missingUrls = [];
    if (!requestParams.successurl) missingUrls.push("successurl");
    if (!requestParams.errorurl) missingUrls.push("errorurl");
    if (!requestParams.backurl) missingUrls.push("backurl");
    if (missingUrls.length > 0) {
      throw new Error(
        `Credit card request is missing required redirect URLs: ${missingUrls.join(", ")}. ` +
        `These must be supplied by the caller so Payone can redirect the customer back after the issuer challenge.`
      );
    }

    if (logger) {
      logger.info("3DS Redirect URLs:", {
        successurl: requestParams.successurl,
        errorurl: requestParams.errorurl,
        backurl: requestParams.backurl
      });
    }
  }

  const defaults = {
    salutation: "Herr",
    gender: "m",
    telephonenumber: "01752345678",
    ip: "127.0.0.1",
    language: "de",
    customer_is_present: "yes"
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (!requestParams[key]) {
      requestParams[key] = value;
    }
  });

  if (requestParams.clearingtype === "wlt" && requestParams.cardtype) {
    delete requestParams.cardtype;
  }

  if (requestParams.clearingtype === "wlt" && !requestParams.wallettype) {
    if (requestParams["add_paydata[paymentmethod_token_data]"]) {
      requestParams.wallettype = "GGP";
    } else {
      requestParams.wallettype = "PPE";
    }
  }

  return requestParams;
};

const toFormData = (requestParams) => {
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(requestParams)) {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  }
  return formData;
};

/**
 * Whether Payone needs somewhere to send the customer back to. The portal
 * configuration decides whether a credit card authorization is sent to a 3-D
 * Secure challenge, so the redirect URLs must always accompany one.
 *
 * @param params - Request params
 */
const requiresRedirectUrls = (params) =>
  params.clearingtype === "cc" &&
  (params.request === "preauthorization" || params.request === "authorization");

module.exports = {
  buildClientRequestParams,
  toFormData,
  requiresRedirectUrls
};

