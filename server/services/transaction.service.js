"use strict";

const {
  TRANSACTION_UID,
  PLACEHOLDERS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_SCANNED_ROWS,
  STAT_STATUSES
} = require("../constants");
const { sanitizeSensitive } = require("../utils/sanitize");
const { parseJsonField } = require("../utils/json");
const {
  buildWhereFromFilters,
  paymentMethodOf,
  resolveOrderBy,
  matchesPaymentMethod
} = require("../utils/transaction-filters");

const textOf = (value, fallback) => (value ?? fallback).toString().trim();

const normalizeImportRow = (row) => ({
  txid: textOf(row.txid ?? row.TxId, PLACEHOLDERS.txid),
  reference: textOf(row.reference ?? row.Reference, PLACEHOLDERS.reference),
  invoiceid: textOf(row.invoiceid ?? row.invoiceId, PLACEHOLDERS.invoiceid),
  amount: textOf(row.amount, "0"),
  currency: textOf(row.currency, "EUR"),
  status: textOf(row.status, "unknown"),
  error_code: textOf(row.error_code ?? row.errorCode, PLACEHOLDERS.errorCode),
  request_type: textOf(row.request_type ?? row.requestType, "unknown"),
  error_message: textOf(row.error_message ?? row.errorMessage, PLACEHOLDERS.errorMessage),
  customer_message: textOf(row.customer_message ?? row.customerMessage, PLACEHOLDERS.customerMessage),
  body: parseJsonField(row.body),
  raw_request: sanitizeSensitive(parseJsonField(row.raw_request) || {}),
  raw_response: sanitizeSensitive(parseJsonField(row.raw_response) || {})
});

const buildLogEntry = (transaction) => ({
  txid: transaction.txid || PLACEHOLDERS.txid,
  reference: transaction.reference || PLACEHOLDERS.reference,
  invoiceid: transaction.raw_request.invoiceid || PLACEHOLDERS.invoiceid,
  request_type: transaction.request_type || "unknown",
  amount: transaction.amount || "0",
  currency: transaction.currency || "EUR",
  status: transaction.status || transaction.raw_response.Status || "unknown",
  error_code: transaction.error_code || PLACEHOLDERS.errorCode,
  error_message: transaction.error_message || PLACEHOLDERS.errorMessage,
  customer_message: transaction.customer_message || PLACEHOLDERS.customerMessage,
  body: {
    ...transaction,
    raw_request: sanitizeSensitive(transaction.raw_request),
    raw_response: sanitizeSensitive(transaction.raw_response)
  },
  raw_request: sanitizeSensitive(transaction.raw_request || {}),
  raw_response: sanitizeSensitive(transaction.raw_response || {})
});

const toPage = (pagination) => ({
  page: Math.max(1, Number(pagination.page) || 1),
  pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, Number(pagination.pageSize) || DEFAULT_PAGE_SIZE))
});

const paginationMeta = (page, pageSize, total) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return { page: Math.min(page, pageCount), pageSize, pageCount, total };
};

const withWhere = (options, where) => (where === undefined ? options : { ...options, where });

/** `{ total, approved, error, redirect }` from a total and counts ordered like STAT_STATUSES. */
const toStats = (total, statusCounts) => ({
  total,
  ...Object.fromEntries(STAT_STATUSES.map((status, i) => [status.toLowerCase(), statusCounts[i]])),
});

module.exports = ({ strapi }) => {
  const transactions = () => strapi.db.query(TRANSACTION_UID);

  const logTransaction = (transaction) =>
    Promise.resolve()
      .then(() => transactions().create({ data: buildLogEntry(transaction) }))
      .then((entry) => {
        console.info("Transaction logged to DB:", { id: entry.id, txid: entry.txid, status: entry.status });
        return entry;
      })
      .catch((error) => {
        console.error("Failed to log transaction:", error);
      });

  /** payment_method lives in JSON, so those queries scan the matching rows and paginate in JS. */
  const getHistoryByPaymentMethod = async ({ where, orderBy, paymentMethod, page, pageSize }) => {
    const rows = await transactions().findMany(withWhere({ orderBy, limit: MAX_SCANNED_ROWS }, where));
    const filtered = rows.filter((row) => matchesPaymentMethod(row, paymentMethod));
    const meta = paginationMeta(page, pageSize, filtered.length);
    const start = (meta.page - 1) * pageSize;
    return { data: filtered.slice(start, start + pageSize), pagination: meta };
  };

  const getTransactionHistory = async ({ filters = {}, pagination = {}, sort_by, sort_order }) => {
    const { page, pageSize } = toPage(pagination);
    const where = buildWhereFromFilters(filters);
    const orderBy = resolveOrderBy(sort_by, sort_order);
    const paymentMethod = paymentMethodOf(filters);

    if (paymentMethod) {
      return getHistoryByPaymentMethod({ where, orderBy, paymentMethod, page, pageSize });
    }

    const [data, total] = await transactions().findWithCount(
      withWhere({ orderBy, limit: pageSize, offset: (page - 1) * pageSize }, where)
    );
    return { data, pagination: paginationMeta(page, pageSize, total) };
  };

  const getTransactionsForExport = async ({ filters = {}, sort_by, sort_order } = {}) => {
    const where = buildWhereFromFilters(filters);
    const data = await transactions().findMany(
      withWhere({ orderBy: resolveOrderBy(sort_by, sort_order), limit: MAX_SCANNED_ROWS }, where)
    );
    const paymentMethod = paymentMethodOf(filters);
    return paymentMethod ? data.filter((row) => matchesPaymentMethod(row, paymentMethod)) : data;
  };

  /** Totals per status for the stat cards; the status filter itself is ignored so every card stays meaningful. */
  const getTransactionStats = async ({ filters = {} } = {}) => {
    const where = buildWhereFromFilters({ ...filters, status: undefined });
    const paymentMethod = paymentMethodOf(filters);

    if (paymentMethod) {
      const rows = await transactions().findMany(withWhere({ select: ["status", "raw_request"], limit: MAX_SCANNED_ROWS }, where));
      const matching = rows.filter((row) => matchesPaymentMethod(row, paymentMethod));
      const statusCount = (status) => matching.filter((row) => String(row.status || "").toUpperCase() === status).length;
      return toStats(matching.length, STAT_STATUSES.map(statusCount));
    }

    const withStatus = (status) => {
      const statusCondition = { status: { $eqi: status } };
      return where === undefined ? statusCondition : { $and: [where, statusCondition] };
    };
    const [total, ...statusCounts] = await Promise.all([
      transactions().count(withWhere({}, where)),
      ...STAT_STATUSES.map((status) => transactions().count({ where: withStatus(status) })),
    ]);
    return toStats(total, statusCounts);
  };

  const importTransactions = async (rows) => {
    const results = { imported: 0, failed: 0, errors: [] };
    if (!Array.isArray(rows) || rows.length === 0) return results;

    for (const [index, row] of rows.entries()) {
      await Promise.resolve()
        .then(() => transactions().create({ data: normalizeImportRow(row) }))
        .then(() => {
          results.imported += 1;
        })
        .catch((err) => {
          results.failed += 1;
          results.errors.push({ row: index + 1, message: err.message || String(err) });
        });
    }
    return results;
  };

  return { logTransaction, getTransactionHistory, getTransactionsForExport, getTransactionStats, importTransactions };
};
