"use strict";

const { getService } = require("../utils/get-service");
const { respondWithError } = require("../utils/http");
const { rowsToCsv, csvToRows } = require("../utils/csv");
const { buildFiltersFromQuery } = require("../utils/transaction-filters");

const INVALID_IMPORT_BODY = "Body must be an array, { data: array }, or { format: 'csv', data: csvString }";

const importRowsOf = (ctx, body) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (body.format === "csv" && typeof body.data === "string") return csvToRows(body.data);
  return ctx.throw(400, INVALID_IMPORT_BODY);
};

const sendAttachment = (ctx, { contentType, filename, body }) => {
  ctx.set("Content-Type", contentType);
  ctx.set("Content-Disposition", `attachment; filename="${filename}"`);
  ctx.body = body;
};

module.exports = ({ strapi }) => {
  const transactionService = () => getService(strapi, "transaction");

  return {
    async getTransactionHistory(ctx) {
      try {
        const { filters: rawFilters = {}, pagination = {} } = ctx.query || {};
        const result = await transactionService().getTransactionHistory({
          filters: buildFiltersFromQuery(rawFilters),
          pagination: {
            page: parseInt(pagination.page || "1", 10),
            pageSize: parseInt(pagination.pageSize || "10", 10)
          }
        });

        ctx.body = { data: result.data || [], meta: { pagination: result.pagination } };
      } catch (error) {
        respondWithError(ctx, error);
      }
    },

    async getTransactionStats(ctx) {
      try {
        const { filters: rawFilters = {} } = ctx.query || {};
        ctx.body = { data: await transactionService().getTransactionStats({ filters: buildFiltersFromQuery(rawFilters) }) };
      } catch (error) {
        respondWithError(ctx, error);
      }
    },

    async exportTransactions(ctx) {
      try {
        const { filters: rawFilters = {}, format = "json", sort_by, sort_order } = ctx.query || {};
        const data = await transactionService().getTransactionsForExport({
          filters: buildFiltersFromQuery(rawFilters),
          sort_by: sort_by || "createdAt",
          sort_order: sort_order || "desc"
        });
        const rows = Array.isArray(data) ? data : [];

        if ((format || "json").toLowerCase() === "csv") {
          sendAttachment(ctx, { contentType: "text/csv; charset=utf-8", filename: "transactions.csv", body: rowsToCsv(rows) });
          return;
        }
        sendAttachment(ctx, { contentType: "application/json", filename: "transactions.json", body: rows });
      } catch (error) {
        respondWithError(ctx, error);
      }
    },

    async importTransactions(ctx) {
      try {
        const body = ctx.request.body;
        if (!body || typeof body !== "object") ctx.throw(400, "Request body must be JSON");

        const rows = importRowsOf(ctx, body);
        if (rows.length === 0) {
          ctx.body = { imported: 0, failed: 0, errors: [], message: "No rows to import" };
          return;
        }

        const result = await transactionService().importTransactions(rows);
        ctx.body = { ...result, message: `Imported ${result.imported}, failed ${result.failed}` };
      } catch (error) {
        respondWithError(ctx, error);
      }
    }
  };
};
