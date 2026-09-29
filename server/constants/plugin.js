"use strict";

const PLUGIN_ID = "strapi-plugin-payone-provider";
const TRANSACTION_UID = `plugin::${PLUGIN_ID}.transaction`;
const SETTINGS_KEY = "settings";
const HIDDEN_SECRET = "***HIDDEN***";

const DEFAULT_STORE_SETTINGS = {
  aid: "",
  portalid: "",
  mid: "",
  key: "",
  mode: "test",
  api_version: "3.10",
  merchantName: "",
  displayName: "",
  domainName: "",
  merchantIdentifier: "",
  enableCreditCard: false,
  enablePayPal: false,
  enableGooglePay: false,
  enableApplePay: false,
  enableSepaDirectDebit: false
};

const THREE_DS_REDIRECT_ROUTES = [
  `/admin/plugins/${PLUGIN_ID}/payment/success`,
  `/admin/plugins/${PLUGIN_ID}/payment/error`,
  `/admin/plugins/${PLUGIN_ID}/payment/back`,
  `/content-ui/plugins/${PLUGIN_ID}/payment/success`,
  `/content-ui/plugins/${PLUGIN_ID}/payment/error`,
  `/content-ui/plugins/${PLUGIN_ID}/payment/back`
];

const APPLE_PAY_DOMAIN_ROUTE = "/.well-known/apple-developer-merchantid-domain-association";

const APPLE_PAY_DOMAIN_FILES = [
  "apple-developer-merchantid-domain-association",
  "apple-developer-merchantid-domain-association.txt",
  "apple-developer-merchant-id-domain-association.txt"
];

module.exports = {
  PLUGIN_ID,
  TRANSACTION_UID,
  SETTINGS_KEY,
  HIDDEN_SECRET,
  DEFAULT_STORE_SETTINGS,
  THREE_DS_REDIRECT_ROUTES,
  APPLE_PAY_DOMAIN_ROUTE,
  APPLE_PAY_DOMAIN_FILES
};
