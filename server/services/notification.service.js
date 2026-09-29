"use strict";

const { TRANSACTION_UID } = require("../constants");
const { getService } = require("../utils/get-service");
const { sanitizeSensitive } = require("../utils/sanitize");

const LOG_PREFIX = "[Payone TransactionStatus]";

const credentialsMatch = (notification, settings) => {
  const isComplete =
    (settings.portalid && settings.aid && settings.key) &&
    (notification.portalid && notification.aid && notification.key);
  const isMatch =
    String(notification.portalid) == String(settings.portalid) &&
    String(notification.aid) == String(settings.aid) &&
    String(notification.key) == String(settings.key);

  if (!isComplete) {
    console.log(`${LOG_PREFIX} Settings not found or payone data missing`);
    return false;
  }
  if (!isMatch) {
    console.log(`${LOG_PREFIX} Payone data mismatch with settings`);
    return false;
  }
  return true;
};

const buildStatusUpdate = (notification, existing) => {
  const amount = existing.amount;
  const rawRequest = {
    ...existing.raw_request,
    ...notification,
    mode: notification.mode,
    amount,
    clearingtype: notification.clearingtype || existing.clearingtype
  };

  return {
    status: notification.transaction_status || existing.status || notification.txaction,
    currency: notification.currency || existing.currency,
    reference: notification.reference || existing.reference,
    amount,
    body: {
      ...existing.body,
      status: notification.transaction_status || notification.txaction,
      amount,
      raw_request: sanitizeSensitive(rawRequest),
      payone_notification_data: sanitizeSensitive({ ...notification })
    }
  };
};

module.exports = ({ strapi }) => {
  const transactions = () => strapi.db.query(TRANSACTION_UID);

  const updateFromNotification = async (notification) => {
    const settings = await getService(strapi, "settings").getSettings();
    if (!credentialsMatch(notification, settings)) {
      console.log(`${LOG_PREFIX} Validation failed for incoming notification.`);
    }

    const txid = notification.txid;
    const existing = await transactions().findOne({ where: { txid } });
    if (!existing) {
      console.log(`${LOG_PREFIX} Transaction ${txid} not found. Notification ignored.`);
      return;
    }

    await transactions().update({ where: { id: existing.id }, data: buildStatusUpdate(notification, existing) });
    console.log(`${LOG_PREFIX} Successfully updated transaction txid: ${txid}`);
  };

  /** Applies a Payone TransactionStatus notification to the matching transaction row. Never throws. */
  const processTransactionStatus = (notification) =>
    updateFromNotification(notification).catch((error) => {
      console.log(`${LOG_PREFIX} Error processing notification: ${error}`);
    });

  return { processTransactionStatus };
};
