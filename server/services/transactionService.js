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


const buildWhereFromFilters = (filters = {}) => {
  const conditions = [];

  if (filters.search && typeof filters.search === "string" && filters.search.trim() !== "") {
    const search = filters.search.trim();
    conditions.push({
      $or: [
        { txid: { $containsi: search } },
        { reference: { $containsi: search } },
      ],
    });
  }

  if (filters.status) {
    conditions.push({ status: { $eqi: filters.status } });
  }

  if (filters.request_type) {
    conditions.push({ request_type: filters.request_type });
  }

  if (filters.date_from) {
    const dateFrom = new Date(filters.date_from);
    dateFrom.setHours(0, 0, 0, 0);
    conditions.push({ createdAt: { $gte: dateFrom.toISOString() } });
  }

  if (filters.date_to) {
    const dateTo = new Date(filters.date_to);
    dateTo.setHours(23, 59, 59, 999);
    conditions.push({ createdAt: { $lte: dateTo.toISOString() } });
  }

  if (filters.payment_method) {
    switch (filters.payment_method) {
      case "credit_card":
        conditions.push({ raw_request: { $containsi: '"clearingtype":"cc"' } });
        break;
      case "paypal":
        conditions.push({
          $and: [
            { raw_request: { $containsi: '"clearingtype":"wlt"' } },
            { raw_request: { $containsi: '"wallettype":"PPE"' } },
          ],
        });
        break;
      case "google_pay":
        conditions.push({
          $and: [
            { raw_request: { $containsi: '"clearingtype":"wlt"' } },
            {
              $or: [
                { raw_request: { $containsi: '"wallettype":"GPY"' } },
                { raw_request: { $containsi: '"wallettype":"GOOGLEPAY"' } },
              ],
            },
          ],
        });
        break;
      case "apple_pay":
        conditions.push({
          $and: [
            { raw_request: { $containsi: '"clearingtype":"wlt"' } },
            {
              $or: [
                { raw_request: { $containsi: '"wallettype":"APL"' } },
                { raw_request: { $containsi: '"wallettype":"APPLEPAY"' } },
              ],
            },
          ],
        });
        break;
      case "sofort":
        conditions.push({ raw_request: { $containsi: '"clearingtype":"sb"' } });
        break;
      case "sepa":
        conditions.push({ raw_request: { $containsi: '"clearingtype":"elv"' } });
        break;
      default:
        break;
    }
  }

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

const getTransactionHistory = async (
  strapi,
  { filters = {}, pagination = {}, sort_by, sort_order }
) => {
  const page = Math.max(1, Number(pagination.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(pagination.pageSize) || 10));
  const offset = (page - 1) * pageSize;

  const where = buildWhereFromFilters(filters);

  const sortField =
    sort_by && ALLOWED_SORT_FIELDS.includes(sort_by) ? sort_by : "createdAt";
  const order = sort_order === "asc" ? "asc" : "desc";

  const queryOptions = {
    orderBy: { [sortField]: order },
    limit: pageSize,
    offset,
  };
  if (where !== undefined) queryOptions.where = where;

  const [data, total] = await strapi.db
    .query(TRANSACTION_UID)
    .findWithCount(queryOptions);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const validPage = Math.min(page, pageCount);

  return {
    data,
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

