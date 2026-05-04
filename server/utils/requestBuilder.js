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

  const isCreditCard = requestParams.clearingtype === "cc";
  const enable3DSecure = settings.enable3DSecure !== false;

  if (is3dsViable(requestParams, settings)) {
    requestParams["3dsecure"] = "yes";
    requestParams.ecommercemode = params.ecommercemode || "internet";

    const missingUrls = [];
    if (!requestParams.successurl) missingUrls.push("successurl");
    if (!requestParams.errorurl) missingUrls.push("errorurl");
    if (!requestParams.backurl) missingUrls.push("backurl");
    if (missingUrls.length > 0) {
      throw new Error(
        `3DS-eligible credit card request is missing required redirect URLs: ${missingUrls.join(", ")}. ` +
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
  } else if (isCreditCard && !enable3DSecure) {
    requestParams["3dsecure"] = "no";
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
 * Checks if the request is viable for 3DS according to the settings
 * 
 * @param params - Request params
 * @param settings - Set up in admin
 * @returns 
 */
const is3dsViable = (params, settings) => {
  const isCreditCard = params.clearingtype === "cc";
  const enable3DSecure = settings.enable3DSecure !== false;

  return isCreditCard && enable3DSecure && (params.request === "preauthorization" || params.request === "authorization")
};

module.exports = {
  buildClientRequestParams,
  toFormData,
  is3dsViable
};

