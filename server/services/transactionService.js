"use strict";

<<<<<<< HEAD
const { getPluginStore, PLUGIN_NAME } = require("./settingsService");

/**
 * Log transaction to history
 * @param {Object} strapi - Strapi instance
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<void>}
 */
=======
const { getPluginStore } = require("./settingsService");

>>>>>>> feature/apple-pay
const logTransaction = async (strapi, transactionData) => {
  const pluginStore = getPluginStore(strapi);
  let transactionHistory =
    (await pluginStore.get({ key: "transactionHistory" })) || [];

  const logEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    txid: transactionData.txid || null,
    reference: transactionData.reference || null,
    request_type:
      transactionData.request_type || transactionData.request || "unknown",
    amount: transactionData.amount || null,
    currency: transactionData.currency || "EUR",
    status: transactionData.status || transactionData.Status || "unknown",
    error_code:
      transactionData.error_code || transactionData.Error?.ErrorCode || null,
    error_message:
      transactionData.error_message ||
      transactionData.Error?.ErrorMessage ||
      null,
    customer_message:
      transactionData.customer_message ||
      transactionData.Error?.CustomerMessage ||
      null,
    raw_request: transactionData.raw_request || null,
    raw_response: transactionData.raw_response || transactionData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  transactionHistory.unshift(logEntry);

<<<<<<< HEAD
  // Keep only last 1000 transactions
=======
>>>>>>> feature/apple-pay
  if (transactionHistory.length > 1000) {
    transactionHistory = transactionHistory.slice(0, 1000);
  }

  await pluginStore.set({
    key: "transactionHistory",
    value: transactionHistory
  });

  strapi.log.info("Transaction logged:", logEntry);
};

<<<<<<< HEAD
/**
 * Get transaction history with filters
 * @param {Object} strapi - Strapi instance
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Filtered transaction history
 */
=======
>>>>>>> feature/apple-pay
const getTransactionHistory = async (strapi, filters = {}) => {
  const pluginStore = getPluginStore(strapi);
  let transactionHistory =
    (await pluginStore.get({ key: "transactionHistory" })) || [];

<<<<<<< HEAD
  // Apply filters
=======
>>>>>>> feature/apple-pay
  if (filters.status) {
    transactionHistory = transactionHistory.filter(
      (transaction) => transaction.status === filters.status
    );
  }

  if (filters.request_type) {
    transactionHistory = transactionHistory.filter(
      (transaction) => transaction.request_type === filters.request_type
    );
  }

  if (filters.txid) {
    transactionHistory = transactionHistory.filter(
      (transaction) => transaction.txid === filters.txid
    );
  }

  if (filters.reference) {
    transactionHistory = transactionHistory.filter(
      (transaction) => transaction.reference === filters.reference
    );
  }

  if (filters.date_from) {
    transactionHistory = transactionHistory.filter(
      (transaction) =>
        new Date(transaction.timestamp) >= new Date(filters.date_from)
    );
  }

  if (filters.date_to) {
    transactionHistory = transactionHistory.filter(
      (transaction) =>
        new Date(transaction.timestamp) <= new Date(filters.date_to)
    );
  }

  return transactionHistory;
};

module.exports = {
  logTransaction,
  getTransactionHistory
};

