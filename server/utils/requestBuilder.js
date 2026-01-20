"use strict";

const crypto = require("crypto");
const { normalizeCustomerId } = require("./normalize");
const calculateKeyHash = (settings, params) => {
  const portalKey = settings.portalKey || settings.key;
  const portalid = String(settings.portalid || "");
  const aid = String(settings.aid || "");
  const mode = String(settings.mode || "test");

  const requestType = params.request || "";

  // For Capture and Refund operations
  if (requestType === "capture" || requestType === "refund") {
    const txid = String(params.txid || "");
    const sequencenumber = String(params.sequencenumber || "");
    const amount = String(params.amount || "");
    const currency = String(params.currency || "EUR");

    const hashString = `${portalid}${aid}${txid}${sequencenumber}${amount}${currency}${mode}${portalKey}`;
    return crypto.createHash("md5").update(hashString).digest("hex");
  }

  // For Preauthorization and Authorization operations
  if (requestType === "preauthorization" || requestType === "authorization") {
    const amount = String(params.amount || "");
    const currency = String(params.currency || "EUR");
    const reference = String(params.reference || "");

    const hashString = `${portalid}${aid}${amount}${currency}${reference}${mode}${portalKey}`;
    return crypto.createHash("md5").update(hashString).digest("hex");
  }

  const hashString = `${portalid}${aid}${mode}${portalKey}`;
  return crypto.createHash("md5").update(hashString).digest("hex");
};

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

  requestParams.customerid = normalizeCustomerId(
    requestParams.customerid,
    logger
  );

  requestParams.key = calculateKeyHash(settings, requestParams);

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

