"use strict";

const crypto = require("crypto");
const { normalizeCustomerId } = require("./normalize");

const buildClientRequestParams = (settings, params, logger = null) => {
  const requestParams = {
    request: params.request,
    aid: settings.aid,
    mid: settings.mid,
    portalid: settings.portalid,
    mode: settings.mode || "test",
    encoding: "UTF-8",
    ...params
  };

  requestParams.key = crypto
    .createHash("md5")
    .update(settings.portalKey || settings.key)
    .digest("hex");

  requestParams.customerid = normalizeCustomerId(
    requestParams.customerid,
    logger
  );

  const isCreditCard = requestParams.clearingtype === "cc";
  const enable3DSecure = settings.enable3DSecure !== false;

  if (isCreditCard && enable3DSecure && (params.request === "preauthorization" || params.request === "authorization")) {
    requestParams["3dsecure"] = "yes";
    requestParams.ecommercemode = params.ecommercemode || "internet";

    if (!requestParams.successurl) {
      requestParams.successurl = params.successurl || "https://www.example.com/success";
    }
    if (!requestParams.errorurl) {
      requestParams.errorurl = params.errorurl || "https://www.example.com/error";
    }
    if (!requestParams.backurl) {
      requestParams.backurl = params.backurl || "https://www.example.com/back";
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

module.exports = {
  buildClientRequestParams,
  toFormData
};

