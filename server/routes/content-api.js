"use strict";

const { PLUGIN_ID } = require("../constants");

const tokenRoute = (method, path, handler) => ({
  method,
  path,
  handler,
  config: { policies: [`plugin::${PLUGIN_ID}.is-auth`], auth: false }
});

const publicRoute = (method, path, handler) => ({
  method,
  path,
  handler,
  config: { auth: false }
});

module.exports = {
  type: "content-api",
  routes: [
    tokenRoute("GET", "/settings", "settings.getPublicSettings"),
    tokenRoute("POST", "/preauthorization", "payment.preauthorization"),
    tokenRoute("POST", "/authorization", "payment.authorization"),
    tokenRoute("POST", "/capture", "payment.capture"),
    tokenRoute("POST", "/refund", "payment.refund"),
    tokenRoute("POST", "/test-connection", "settings.testConnection"),
    tokenRoute("POST", "/3ds-callback", "payment.handle3DSCallback"),
    tokenRoute("POST", "/validate-apple-pay-merchant", "applePay.validateApplePayMerchant"),
    tokenRoute("POST", "/hosted-tokenization/jwt", "payment.hostedTokenizationJwt"),
    tokenRoute("POST", "/hash384", "payment.hash384"),
    publicRoute("POST", "/transaction-status", "notification.handleTransactionStatus")
  ]
};
