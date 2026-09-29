"use strict";

module.exports = {
  settings: require("./settings.controller"),
  payment: require("./payment.controller"),
  transaction: require("./transaction.controller"),
  applePay: require("./apple-pay.controller"),
  notification: require("./notification.controller")
};
