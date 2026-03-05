"use strict";

const { getSettings } = require("./settingsService");
const { sanitizeSensitive } = require("../utils/sanitize");

const TRANSACTION_UID = "plugin::strapi-plugin-payone-provider.transaction";

const genreateUpdateData = (notificationData, existing, safeNotification) => {
  const amount = String(notificationData.clearing_amount) || String(Math.round(parseFloat(notificationData.price) * 100)) || existing.amount;
  const raw_request = {
    ...existing.raw_request,
    ...notificationData,
    mode: notificationData.mode,
    amount,
    clearingtype: notificationData.clearingtype || existing.clearingtype,
  }

  return {
    status: notificationData.transaction_status || existing.status,
    currency: notificationData.currency || existing.currency,
    reference: notificationData.reference || existing.reference,
    amount,
    body: {
      ...existing.body,
      status: notificationData.transaction_status,
      amount,
      raw_request: sanitizeSensitive(raw_request),
      payone_notification_data: safeNotification,
    },
  };
}

const validateData = (notificationData, settings) => {
  const isExist = (settings.portalid && settings.aid && settings.key) && (notificationData.portalid && notificationData.aid && notificationData.key);
  const isMatch = notificationData.portalid === settings.portalid && notificationData.aid === settings.aid && notificationData.key === settings.key;

  if (!isExist) {
    console.log("[Payone TransactionStatus] Settings not found or payone data missing");
    return false;
  }

  if (!isMatch) {
    console.log("[Payone TransactionStatus] Payone data mismatch with settings");
    return false;
  }

  return true;
};


const processTransactionStatus = async (strapi, notificationData) => {
  try {
    const settings = await getSettings(strapi);
    if (!validateData(notificationData, settings)) {
      console.log("[Payone TransactionStatus] Validation failed for incoming notification. Notification ignored.");
    }

    const txid = notificationData.txid;
    const existing = await strapi.db.query(TRANSACTION_UID).findOne({ where: { txid } });

    if (!existing) {
      console.log(`[Payone TransactionStatus] Transaction ${txid} not found. Notification ignored.`);
    }

    const safeNotification = sanitizeSensitive({ ...notificationData });
    const data = genreateUpdateData(notificationData, existing, safeNotification);
    await strapi.db.query(TRANSACTION_UID).update({
      where: { id: existing.id },
      data,
    });

    console.log(`[Payone TransactionStatus] Successfully updated transaction txid: ${txid}`);
  } catch (error) {
    console.error(`[Payone TransactionStatus] Error processing notification: ${error}`);
  }
};

module.exports = {
  processTransactionStatus,
};
