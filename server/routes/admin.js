"use strict";

const route = (method, path, handler) => ({
  method,
  path,
  handler,
  config: { policies: ["admin::isAuthenticatedAdmin"] }
});

module.exports = {
  type: "admin",
  routes: [
    route("GET", "/settings", "settings.getSettings"),
    route("PUT", "/settings", "settings.updateSettings"),
    route("GET", "/transaction-history", "transaction.getTransactionHistory"),
    route("GET", "/transaction-stats", "transaction.getTransactionStats"),
    route("GET", "/transactions/export", "transaction.exportTransactions"),
    route("POST", "/transactions/import", "transaction.importTransactions"),
    route("POST", "/test-connection", "settings.testConnection"),
    route("POST", "/preauthorization", "payment.preauthorization"),
    route("POST", "/authorization", "payment.authorization"),
    route("POST", "/capture", "payment.capture"),
    route("POST", "/refund", "payment.refund"),
    route("POST", "/3ds-callback", "payment.handle3DSCallback"),
    route("POST", "/validate-apple-pay-merchant", "applePay.validateApplePayMerchant"),
    route("POST", "/hash384", "payment.hash384")
  ]
};
