"use strict";

const { getService } = require("../utils/get-service");

module.exports = ({ strapi }) => ({
  /** Payone's TransactionStatus webhook. Payone expects `TSOK` with 200, whatever happened. */
  async handleTransactionStatus(ctx) {
    await Promise.resolve()
      .then(() => getService(strapi, "notification").processTransactionStatus(ctx.request.body || {}))
      .then(() => console.warn("[Payone] Notification Status", { ip: ctx.request.ip }))
      .catch((error) => strapi.log.error("[Payone TransactionStatus] Error:", error));

    ctx.status = 200;
    ctx.body = "TSOK";
    ctx.type = "text/plain";
  }
});
