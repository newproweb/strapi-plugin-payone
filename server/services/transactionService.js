"use strict";

const { sanitizeSensitive } = require("../utils/sanitize");

const TRANSACTION_UID = "plugin::strapi-plugin-payone-provider.transaction";

const logTransaction = async (strapi, transactionData) => {
  try {
    const data = {
      txid: transactionData.txid || 'NO TXID',
      reference: transactionData.reference || 'NO REFERENCE',
      invoiceid: transactionData.raw_request.invoiceid || 'NO INVOICE ID',
      request_type: transactionData.request_type || "unknown",
      amount: transactionData.amount || "0",
      currency: transactionData.currency || "EUR",
      status: transactionData.status || transactionData.raw_response.Status || "unknown",
      error_code: transactionData.error_code || "NO ERROR CODE",
      error_message: transactionData.error_message || "NO ERROR MESSAGE",
      customer_message: transactionData.customer_message || "NO CUSTOMER MESSAGE",
      body: transactionData ? { ...transactionData, raw_request: sanitizeSensitive(transactionData.raw_request), raw_response: sanitizeSensitive(transactionData.raw_response) } : {},
      raw_request: sanitizeSensitive(transactionData.raw_request || {}),
      raw_response: sanitizeSensitive(transactionData.raw_response || {}),
    };

    const entry = await strapi.db.query(TRANSACTION_UID).create({ data });
    console.info("Transaction logged to DB:", {
      id: entry.id,
      txid: entry.txid,
      status: entry.status
    });

    return entry;
  } catch (error) {
    console.error("Failed to log transaction:", error);
  }
};


const hasFilterValue = (v) =>
  typeof v === "string" && v.trim() !== "" && v.trim().toLowerCase() !== "all";

const buildWhereFromFilters = (filters = {}) => {
  const conditions = [];

  if (hasFilterValue(filters.search)) {
    const search = String(filters.search).trim();
    conditions.push({
      $or: [
        { txid: { $containsi: search } },
        { reference: { $containsi: search } },
      ],
    });
  }

  if (hasFilterValue(filters.status)) {
    conditions.push({ status: { $eqi: String(filters.status).trim() } });
  }

  if (hasFilterValue(filters.request_type)) {
    conditions.push({ request_type: String(filters.request_type).trim() });
  }

  if (hasFilterValue(filters.date_from)) {
    const dateFrom = new Date(filters.date_from);
    dateFrom.setHours(0, 0, 0, 0);
    conditions.push({ createdAt: { $gte: dateFrom.toISOString() } });
  }

  if (hasFilterValue(filters.date_to)) {
    const dateTo = new Date(filters.date_to);
    dateTo.setHours(23, 59, 59, 999);
    conditions.push({ createdAt: { $lte: dateTo.toISOString() } });
  }

  // `payment_method` is NOT filtered here: the payment method lives inside the
  // `raw_request` JSON column, and the query engine cannot reliably filter JSON
  // columns ($containsi returns empty). It is applied in JS — see
  // `matchesPaymentMethod` used by getTransactionHistory / getTransactionsForExport.

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return { $and: conditions };
};

const ALLOWED_SORT_FIELDS = [
  "txid",
  "reference",
  "amount",
  "request_type",
  "status",
  "createdAt",
  "updatedAt",
];

const PAYMENT_METHOD_MATCHERS = {
  credit_card: (rr) => rr.clearingtype === "cc",
  paypal: (rr) => rr.clearingtype === "wlt" && rr.wallettype === "PPE",
  google_pay: (rr) => rr.clearingtype === "wlt" && ["GPY", "GOOGLEPAY"].includes(rr.wallettype),
  apple_pay: (rr) => rr.clearingtype === "wlt" && ["APL", "APPLEPAY"].includes(rr.wallettype),
  sofort: (rr) => rr.clearingtype === "sb",
  sepa: (rr) => rr.clearingtype === "elv",
};

/** Matches a transaction row against a payment_method filter value using its raw_request JSON. */
const matchesPaymentMethod = (row, method) => {
  const matcher = PAYMENT_METHOD_MATCHERS[method];
  if (!matcher) return true;
  const rr = parseJsonField(row.raw_request);
  return matcher({
    clearingtype: String(rr.clearingtype || "").toLowerCase(),
    wallettype: String(rr.wallettype || "").toUpperCase(),
  });
};

const getTransactionHistory = async (
  strapi,
  { filters = {}, pagination = {}, sort_by, sort_order }
) => {
  const page = Math.max(1, Number(pagination.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(pagination.pageSize) || 10));

  const where = buildWhereFromFilters(filters);
  const sortField =
    sort_by && ALLOWED_SORT_FIELDS.includes(sort_by) ? sort_by : "createdAt";
  const order = sort_order === "asc" ? "asc" : "desc";

  const paymentMethod = hasFilterValue(filters.payment_method)
    ? String(filters.payment_method).trim()
    : "";

  // payment_method can only be filtered in JS — fetch SQL-filtered rows, then
  // filter and paginate by payment method here.
  if (paymentMethod) {
    const listOptions = { orderBy: { [sortField]: order }, limit: 10000 };
    if (where !== undefined) listOptions.where = where;

    const allRows = await strapi.db.query(TRANSACTION_UID).findMany(listOptions);
    const filtered = allRows.filter((row) => matchesPaymentMethod(row, paymentMethod));

    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const validPage = Math.min(page, pageCount);
    const start = (validPage - 1) * pageSize;

    return {
      data: filtered.slice(start, start + pageSize),
      pagination: { page: validPage, pageSize, pageCount, total },
    };
  }

  const queryOptions = {
    orderBy: { [sortField]: order },
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
  if (where !== undefined) queryOptions.where = where;

  const [data, total] = await strapi.db
    .query(TRANSACTION_UID)
    .findWithCount(queryOptions);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const validPage = Math.min(page, pageCount);

  return {
    data,
    pagination: { page: validPage, pageSize, pageCount, total },
  };
};

const EXPORT_MAX = 10000;

const getTransactionsForExport = async (
  strapi,
  { filters = {}, sort_by, sort_order }
) => {
  const where = buildWhereFromFilters(filters);
  const sortField =
    sort_by && ALLOWED_SORT_FIELDS.includes(sort_by) ? sort_by : "createdAt";
  const order = sort_order === "asc" ? "asc" : "desc";

  const queryOptions = {
    orderBy: { [sortField]: order },
    limit: EXPORT_MAX,
  };
  if (where !== undefined) queryOptions.where = where;

  const data = await strapi.db.query(TRANSACTION_UID).findMany(queryOptions);
  const paymentMethod = hasFilterValue(filters.payment_method)
    ? String(filters.payment_method).trim()
    : "";
  return paymentMethod
    ? data.filter((row) => matchesPaymentMethod(row, paymentMethod))
    : data;
};

const TRANSACTION_ATTRS = [
  "txid", "reference", "invoiceid", "amount", "currency", "status",
  "error_code", "request_type", "error_message", "customer_message",
  "body", "raw_request", "raw_response", "createdAt", "updatedAt"
];

const parseJsonField = (val) => {
  if (val == null || val === "") return {};
  if (typeof val === "object") return val;
  try {
    const parsed = JSON.parse(String(val));
    return typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const normalizeImportRow = (row) => {
  const data = {
    txid: (row.txid ?? row.TxId ?? "NO TXID").toString().trim(),
    reference: (row.reference ?? row.Reference ?? "NO REFERENCE").toString().trim(),
    invoiceid: (row.invoiceid ?? row.invoiceId ?? "NO INVOICE ID").toString().trim(),
    amount: (row.amount ?? "0").toString().trim(),
    currency: (row.currency ?? "EUR").toString().trim(),
    status: (row.status ?? "unknown").toString().trim(),
    error_code: (row.error_code ?? row.errorCode ?? "NO ERROR CODE").toString().trim(),
    request_type: (row.request_type ?? row.requestType ?? "unknown").toString().trim(),
    error_message: (row.error_message ?? row.errorMessage ?? "NO ERROR MESSAGE").toString().trim(),
    customer_message: (row.customer_message ?? row.customerMessage ?? "NO CUSTOMER MESSAGE").toString().trim(),
    body: parseJsonField(row.body),
    raw_request: parseJsonField(row.raw_request),
    raw_response: parseJsonField(row.raw_response),
  };
  data.raw_request = sanitizeSensitive(data.raw_request || {});
  data.raw_response = sanitizeSensitive(data.raw_response || {});
  return data;
};

const importTransactions = async (strapi, rows) => {
  const results = { imported: 0, failed: 0, errors: [] };
  if (!Array.isArray(rows) || rows.length === 0) return results;
  for (let i = 0; i < rows.length; i++) {
    try {
      const row = rows[i];
      const data = normalizeImportRow(row);
      await strapi.db.query(TRANSACTION_UID).create({ data });
      results.imported += 1;
    } catch (err) {
      results.failed += 1;
      results.errors.push({ row: i + 1, message: err.message || String(err) });
    }
  }
  return results;
};

module.exports = {
  logTransaction,
  getTransactionHistory,
  getTransactionsForExport,
  importTransactions,
  TRANSACTION_ATTRS,
};

