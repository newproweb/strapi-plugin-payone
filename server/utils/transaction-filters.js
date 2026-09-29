"use strict";

const { ALLOWED_SORT_FIELDS, DEFAULT_SORT_FIELD, WALLET_CODES } = require("../constants");
const { parseJsonField } = require("./json");

const isFilterValue = (value) => {
  const text = value == null ? "" : String(value).trim();
  return text !== "" && text.toLowerCase() !== "all";
};

const hasFilterValue = (value) => typeof value === "string" && isFilterValue(value);

/** Drops empty and "all" values from the `filters` query object. */
const buildFiltersFromQuery = (rawFilters = {}) => {
  if (!rawFilters || typeof rawFilters !== "object") return {};
  return Object.fromEntries(Object.entries(rawFilters).filter(([, value]) => isFilterValue(value)));
};

const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const endOfDay = (value) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

/**
 * Builds the query-engine `where` clause. `payment_method` is not part of it: the method lives in
 * the `raw_request` JSON column, which the query engine cannot filter, so `matchesPaymentMethod`
 * applies it in JS.
 */
const buildWhereFromFilters = (filters = {}) => {
  const conditions = [];

  if (hasFilterValue(filters.search)) {
    const search = String(filters.search).trim();
    conditions.push({ $or: [{ txid: { $containsi: search } }, { reference: { $containsi: search } }] });
  }
  if (hasFilterValue(filters.status)) {
    conditions.push({ status: { $eqi: String(filters.status).trim() } });
  }
  if (hasFilterValue(filters.request_type)) {
    conditions.push({ request_type: String(filters.request_type).trim() });
  }
  if (hasFilterValue(filters.date_from)) {
    conditions.push({ createdAt: { $gte: startOfDay(filters.date_from) } });
  }
  if (hasFilterValue(filters.date_to)) {
    conditions.push({ createdAt: { $lte: endOfDay(filters.date_to) } });
  }

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return { $and: conditions };
};

const paymentMethodOf = (filters) =>
  hasFilterValue(filters.payment_method) ? String(filters.payment_method).trim() : "";

const resolveOrderBy = (sortBy, sortOrder) => {
  const field = sortBy && ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : DEFAULT_SORT_FIELD;
  return { [field]: sortOrder === "asc" ? "asc" : "desc" };
};

const isWallet = (method) => (request) =>
  request.clearingtype === "wlt" && WALLET_CODES[method].includes(request.wallettype);

const PAYMENT_METHOD_MATCHERS = {
  credit_card: (request) => request.clearingtype === "cc",
  paypal: isWallet("paypal"),
  google_pay: isWallet("google_pay"),
  apple_pay: isWallet("apple_pay"),
  sofort: (request) => request.clearingtype === "sb",
  sepa: (request) => request.clearingtype === "elv"
};

/** Matches a transaction row against a payment_method filter value using its raw_request JSON. */
const matchesPaymentMethod = (row, method) => {
  const matcher = PAYMENT_METHOD_MATCHERS[method];
  if (!matcher) return true;

  const rawRequest = parseJsonField(row.raw_request);
  const wallettype = rawRequest.wallettype || rawRequest["add_paydata[paymentmethod]"] || "";
  return matcher({
    clearingtype: String(rawRequest.clearingtype || "").toLowerCase(),
    wallettype: String(wallettype).toUpperCase()
  });
};

module.exports = {
  buildFiltersFromQuery,
  buildWhereFromFilters,
  paymentMethodOf,
  resolveOrderBy,
  matchesPaymentMethod
};
