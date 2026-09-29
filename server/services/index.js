"use strict";

module.exports = {
  settings: require("./settings.service"),
  payment: require("./payment.service"),
  transaction: require("./transaction.service"),
  notification: require("./notification.service"),
  applePay: require("./apple-pay.service"),
  testConnection: require("./test-connection.service"),
  hostedTokenization: require("./hosted-tokenization.service")
};
