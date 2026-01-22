"use strict";

const crypto = require("crypto");
const { getPluginStore, getSettings } = require("./settingsService");

const verifyHash = (notificationData, portalKey) => {
  const {
    portalid = "",
    aid = "",
    txid = "",
    sequencenumber = "",
    price = "",
    currency = "",
    mode = "",
  } = notificationData;

  const hashString = `${portalid}${aid}${txid}${sequencenumber}${price}${currency}${mode}${portalKey}`;
  const expectedHash = crypto.createHash("md5").update(hashString).digest("hex");

  return expectedHash.toLowerCase() === (notificationData.key || "").toLowerCase();
};

const processTransactionStatus = async (strapi, notificationData) => {
  try {
    const settings = await getSettings(strapi);
    const txid = notificationData.txid;

    if (!settings || !settings.key) {
      console.log("[Payone TransactionStatus] Settings not found or key missing");
      return;
    }

    const isValid = verifyHash(notificationData, settings.key);
    if (!isValid) {
      console.log(`[Payone TransactionStatus] Hash verification failed txid: ${txid}`);
      return;
    }

    if (notificationData.portalid !== settings.portalid || notificationData.aid !== settings.aid) {
      console.log(`[Payone TransactionStatus] Portal ID or AID mismatch txid: ${txid}`);
      return;
    }

    const pluginStore = getPluginStore(strapi);
    let transactionHistory = (await pluginStore.get({ key: "transactionHistory" })) || [];

    const transaction = transactionHistory.find((t) => t.txid === txid || t.id === txid);

    if (transaction) {
      Object.assign(transaction, {
        ...notificationData,
        status: notificationData?.transaction_status,
        txaction: notificationData?.txaction,
        txtime: notificationData?.txtime,
        sequencenumber: notificationData?.sequencenumber,
        balance: notificationData?.balance,
        receivable: notificationData?.receivable,
        price: notificationData?.price,
        amount: notificationData?.price ? parseFloat(notificationData?.price) * 100 : transaction?.amount,
        userid: notificationData?.userid,
        updated_at: new Date().toISOString(),
        body: {
          ...transaction?.body,
          ...notificationData,
          status: notificationData?.transaction_status
        }
      });

      await pluginStore.set({
        key: "transactionHistory",
        value: transactionHistory,
      });

      console.log(`[Payone TransactionStatus] Successfully updated transaction txid: ${txid}`);
    } else {
      console.log(`[Payone TransactionStatus] Transaction ${txid} not found in history. Notification ignored.`);
    }

  } catch (error) {
    console.log(`[Payone TransactionStatus] Error processing notification: ${error}`);
  }
};

module.exports = {
  verifyHash,
  processTransactionStatus,
};
