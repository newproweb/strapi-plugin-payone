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

const applyFilters = (transactions, filters = {}) => {
  let result = [...transactions];

  if (filters.search && typeof filters.search === 'string' && filters.search.trim() !== '') {
    const search = filters.search.toLowerCase().trim();
    result = result.filter((t) => {
      const txid = (t.txid || "").toString().toLowerCase();
      const reference = (t.reference || "").toString().toLowerCase();
      return txid.includes(search) || reference.includes(search);
    });
  }

  if (filters.status) {
    result = result.filter(
      (t) => (t.status || "").toUpperCase() === filters.status.toUpperCase()
    );
  }

  if (filters.request_type) {
    result = result.filter((t) => t.request_type === filters.request_type);
  }

  if (filters.payment_method) {
    result = result.filter((t) => {
      const clearingtype = t.raw_request?.clearingtype;
      const wallettype = t.raw_request?.wallettype;

      switch (filters.payment_method) {
        case "credit_card":
          return clearingtype === "cc";
        case "paypal":
          return clearingtype === "wlt" && wallettype === "PPE";
        case "google_pay":
          return clearingtype === "wlt" && ["GPY", "GOOGLEPAY"].includes(wallettype);
        case "apple_pay":
          return clearingtype === "wlt" && ["APL", "APPLEPAY"].includes(wallettype);
        case "sofort":
          return clearingtype === "sb";
        case "sepa":
          return clearingtype === "elv";
        default:
          return true;
      }
    });
  }

  if (filters.date_from) {
    const dateFrom = new Date(filters.date_from);
    dateFrom.setHours(0, 0, 0, 0);
    result = result.filter(
      (t) => new Date(t.timestamp || t.created_at) >= dateFrom
    );
  }

  if (filters.date_to) {
    const dateTo = new Date(filters.date_to);
    dateTo.setHours(23, 59, 59, 999);
    result = result.filter(
      (t) => new Date(t.timestamp || t.created_at) <= dateTo
    );
  }

  return result;
};

const getTransactionHistory = async (strapi, { filters = {}, pagination = {} }) => {
  const pluginStore = getPluginStore(strapi);

  let transactions =
    (await pluginStore.get({ key: "transactionHistory" })) || [];

  transactions = applyFilters(transactions, filters);
  const page = Number(pagination.page) || 1;
  const pageSize = Number(pagination.pageSize) || 10;

  const total = transactions.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const validPage = Math.min(Math.max(1, page), pageCount);

  const start = (validPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);

  const paginatedData = start < total ? transactions.slice(start, end) : [];
  return {
    data: paginatedData,
    pagination: {
      page: validPage,
      pageSize,
      pageCount,
      total,
    },
  };
};

module.exports = {
  logTransaction,
  getTransactionHistory
};

