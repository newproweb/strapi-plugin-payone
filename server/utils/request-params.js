"use strict";

const crypto = require("crypto");
const { CUSTOMER_DEFAULTS, INVOICE_ID_KEYS } = require("../constants");

const MAX_CUSTOMER_ID_LENGTH = 17;
const REDIRECT_URL_FIELDS = ["successurl", "errorurl", "backurl"];

/** Fills every key of `defaults` that is empty on `params`. Mutates and returns `params`. */
const applyMissingDefaults = (params, defaults) => {
  for (const [key, value] of Object.entries(defaults)) {
    if (!params[key]) params[key] = value;
  }
  return params;
};

/** Picks `fields` from `params`, keeping every key (also undefined ones) in the given order. */
const pickFields = (params, fields) =>
  Object.fromEntries(fields.map((field) => [field, params[field]]));

/** Payone accounts differ in the invoice id spelling they read, so the id is sent under every variant. */
const invoiceIdFields = (invoiceid) => {
  if (!invoiceid || typeof invoiceid !== "string") return null;
  return Object.fromEntries(INVOICE_ID_KEYS.map((key) => [key, invoiceid]));
};

const normalizeCustomerId = (customerid, logger = null) => {
  if (!customerid) {
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${timestamp}${random}`.slice(0, MAX_CUSTOMER_ID_LENGTH);
  }

  const normalized = String(customerid).slice(0, MAX_CUSTOMER_ID_LENGTH);
  if (customerid.length > MAX_CUSTOMER_ID_LENGTH && logger) {
    logger.warn(`customerid exceeds 17 characters: ${customerid.length}, truncated to: ${normalized}`);
  }
  return normalized;
};

/**
 * Whether Payone needs somewhere to send the customer back to. The portal configuration decides
 * whether a credit card authorization is sent to a 3-D Secure challenge, so the redirect URLs must
 * always accompany one.
 */
const requiresRedirectUrls = (params) =>
  params.clearingtype === "cc" &&
  (params.request === "preauthorization" || params.request === "authorization");

const assertRedirectUrls = (params, logger) => {
  const missingUrls = REDIRECT_URL_FIELDS.filter((field) => !params[field]);
  if (missingUrls.length > 0) {
    throw new Error(
      `Credit card request is missing required redirect URLs: ${missingUrls.join(", ")}. ` +
      `These must be supplied by the caller so Payone can redirect the customer back after the issuer challenge.`
    );
  }

  if (logger) {
    logger.info("3DS Redirect URLs:", {
      successurl: params.successurl,
      errorurl: params.errorurl,
      backurl: params.backurl
    });
  }
};

/** Adds the account credentials, the hashed portal key and the Payone defaults to a request. */
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

  requestParams.customerid = normalizeCustomerId(requestParams.customerid, logger);
  requestParams.key = crypto.createHash("md5").update(settings.portalKey || settings.key).digest("hex");

  if (requiresRedirectUrls(requestParams)) assertRedirectUrls(requestParams, logger);

  applyMissingDefaults(requestParams, CUSTOMER_DEFAULTS);

  if (requestParams.clearingtype === "wlt" && requestParams.cardtype) {
    delete requestParams.cardtype;
  }
  if (requestParams.clearingtype === "wlt" && !requestParams.wallettype) {
    requestParams.wallettype = requestParams["add_paydata[paymentmethod_token_data]"] ? "GGP" : "PPE";
  }

  return requestParams;
};

const toFormData = (requestParams) => {
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(requestParams)) {
    if (value !== undefined && value !== null) formData.append(key, value);
  }
  return formData;
};

module.exports = {
  applyMissingDefaults,
  pickFields,
  invoiceIdFields,
  buildClientRequestParams,
  toFormData,
  requiresRedirectUrls
};
