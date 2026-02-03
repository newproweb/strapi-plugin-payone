"use strict";

const { getSettings } = require("./settingsService");
const { sanitizeSensitive } = require("../utils/sanitize");

const TRANSACTION_UID = "plugin::strapi-plugin-payone-provider.transaction";

const processTransactionStatus = async (strapi, notificationData) => {
  try {
    const settings = await getSettings(strapi);
    const txid = notificationData.txid;

    if (!settings || !settings.key) {
      console.log("[Payone TransactionStatus] Settings not found or key missing");
      return;
    }

    if (notificationData.portalid !== settings.portalid || notificationData.aid !== settings.aid) {
      console.log(`[Payone TransactionStatus] Portal ID or AID mismatch txid: ${txid}`);
      return;
    }

    const existing = await strapi.db.query(TRANSACTION_UID).findOne({ where: { txid } });
    if (!existing) {
      console.log(`[Payone TransactionStatus] Transaction ${txid} not found. Notification ignored.`);
      return;
    }

    const amount = notificationData.clearing_amount
      ? String(notificationData.clearing_amount)
      : notificationData.price
        ? String(Math.round(parseFloat(notificationData.price) * 100))
        : existing.amount;

    const safeNotification = sanitizeSensitive({ ...notificationData });

    const data = {
      status: notificationData.transaction_status || existing.status,
      currency: notificationData.currency || existing.currency,
      reference: notificationData.reference || existing.reference,
      amount,
      body: {
        ...existing.body,
        status: notificationData.transaction_status,
        amount,
        payone_notification_data: safeNotification,
      },
    };

    await strapi.db.query(TRANSACTION_UID).update({
      where: { id: existing.id },
      data,
    });

    console.log(`[Payone TransactionStatus] Successfully updated transaction txid: ${txid}`);
  } catch (error) {
    console.log(`[Payone TransactionStatus] Error processing notification: ${error}`);
  }
};

module.exports = {
  processTransactionStatus,
};
