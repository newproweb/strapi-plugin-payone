"use strict";

const { getPluginStore } = require("./settingsService");

const sanitizeRawRequest = (rawRequest) => {
  if (!rawRequest || typeof rawRequest !== "object") return rawRequest
  const sanitized = { ...rawRequest };
  const sensitiveFields = ["cardpan", "cardexpiredate", "cardcvc2"];

  sensitiveFields.forEach((field) => {
    if (sanitized[field] && typeof sanitized[field] === "string") {
      sanitized[field] = "*".repeat(sanitized[field].length);
    }
  });

  return sanitized;
};

const logTransaction = async (strapi, transactionData) => {
  const pluginStore = getPluginStore(strapi);
  let transactionHistory =
    (await pluginStore.get({ key: "transactionHistory" })) || [];

  const logEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    txid: transactionData.txid || null,
    reference: transactionData.reference || null,
    invoiceid: transactionData.invoiceid || null,
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
    body: transactionData ? { ...transactionData, raw_request: sanitizeRawRequest(transactionData.raw_request) } : null,
    raw_request: transactionData.raw_request
      ? sanitizeRawRequest(transactionData.raw_request)
      : null,
    raw_response: sanitizeRawRequest(transactionData.raw_response) || transactionData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  transactionHistory.unshift(logEntry);

  if (transactionHistory.length > 5000) {
    transactionHistory = transactionHistory.slice(0, 5000);
  }

  await pluginStore.set({
    key: "transactionHistory",
    value: transactionHistory
  });

  strapi.log.info("Transaction logged:", logEntry);
};

const getTransactionHistory = async (strapi, filters = {}) => {
  const pluginStore = getPluginStore(strapi);
  let transactionHistory =
    (await pluginStore.get({ key: "transactionHistory" })) || [];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase().trim();
    transactionHistory = transactionHistory.filter((transaction) => {
      const status = (transaction.status || "").toLowerCase();
      const txid = (transaction.txid || "").toLowerCase();
      const reference = (transaction.reference || "").toLowerCase();

      return (
        status.includes(searchLower) ||
        txid.includes(searchLower) ||
        reference.includes(searchLower)
      );
    });
  }

  if (filters.request_type) {
    transactionHistory = transactionHistory.filter(
      (transaction) => transaction.request_type === filters.request_type
    );
  }

  if (filters.payment_method) {
    transactionHistory = transactionHistory.filter((transaction) => {
      const clearingtype = transaction.raw_request?.clearingtype || "";
      const wallettype = transaction.raw_request?.wallettype || "";

      switch (filters.payment_method) {
        case "credit_card":
          return clearingtype === "cc";
        case "paypal":
          return clearingtype === "wlt" && wallettype === "PPE";
        case "google_pay":
          return clearingtype === "wlt" && (wallettype === "GPY" || wallettype === "GOOGLEPAY");
        case "apple_pay":
          return clearingtype === "wlt" && (wallettype === "APL" || wallettype === "APPLEPAY");
        case "sofort":
          return clearingtype === "sb";
        case "sepa":
          return clearingtype === "elv";
        default:
          return false;
      }
    });
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

  if (filters.status) {
    transactionHistory = transactionHistory.filter(
      (transaction) => transaction.status === filters.status
    );
  }

  // Apply sorting
  if (filters.sort_by && filters.sort_order) {
    const sortOrder = filters.sort_order === "desc" ? -1 : 1;
    
    transactionHistory.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sort_by) {
        case "amount":
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case "created_at":
          aValue = new Date(a.created_at || a.timestamp || 0).getTime();
          bValue = new Date(b.created_at || b.timestamp || 0).getTime();
          break;
        case "status":
          aValue = (a.status || "").toLowerCase();
          bValue = (b.status || "").toLowerCase();
          break;
        case "reference":
          aValue = (a.reference || "").toLowerCase();
          bValue = (b.reference || "").toLowerCase();
          break;
        case "method":
          const aClearingType = a.raw_request?.clearingtype || "";
          const bClearingType = b.raw_request?.clearingtype || "";
          const aWalletType = a.raw_request?.wallettype || "";
          const bWalletType = b.raw_request?.wallettype || "";
          aValue = `${aClearingType}_${aWalletType}`.toLowerCase();
          bValue = `${bClearingType}_${bWalletType}`.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return -1 * sortOrder;
      if (aValue > bValue) return 1 * sortOrder;
      return 0;
    });
  }

  return transactionHistory;
};

module.exports = {
  logTransaction,
  getTransactionHistory
};

