import { useFetchClient } from "@strapi/strapi/admin";
import { pluginId } from "../pluginId";

const endpoint = (path) => `/${pluginId}${path}`;

const isFilterValue = (value) => {
  const text = value == null ? "" : String(value).trim();
  return text !== "" && text.toLowerCase() !== "all";
};

const appendFilters = (query, filters) => {
  if (!filters || typeof filters !== "object") return;
  for (const [key, value] of Object.entries(filters)) {
    if (isFilterValue(value)) query.append(`filters[${key}]`, String(value));
  }
};

const withQuery = (path, query) => {
  const queryString = query.toString();
  return endpoint(queryString ? `${path}?${queryString}` : path);
};

/** Admin API of the plugin, bound to Strapi's authenticated fetch client. */
export const usePayoneApi = () => {
  const { get, post, put } = useFetchClient();

  const getTransactionHistory = (params = {}) => {
    const query = new URLSearchParams();
    appendFilters(query, params.filters);
    if (params.pagination?.page) query.append("pagination[page]", String(params.pagination.page));
    if (params.pagination?.pageSize) query.append("pagination[pageSize]", String(params.pagination.pageSize));
    return get(withQuery("/transaction-history", query));
  };

  const getTransactionStats = (filters) => {
    const query = new URLSearchParams();
    appendFilters(query, filters);
    return get(withQuery("/transaction-stats", query));
  };

  const exportTransactions = (params = {}) => {
    const query = new URLSearchParams();
    query.append("format", params.format === "csv" ? "csv" : "json");
    if (params.sort_by) query.append("sort_by", params.sort_by);
    if (params.sort_order) query.append("sort_order", params.sort_order);
    appendFilters(query, params.filters);
    return get(endpoint(`/transactions/export?${query.toString()}`), { responseType: "blob" });
  };

  return {
    getSettings: () => get(endpoint("/settings")),
    updateSettings: (data) => put(endpoint("/settings"), data),
    getTransactionHistory,
    getTransactionStats,
    exportTransactions,
    importTransactions: (payload) =>
      post(endpoint("/transactions/import"), payload, { headers: { "Content-Type": "application/json" } }),
    testConnection: () => post(endpoint("/test-connection")),
    preauthorization: (data) => post(endpoint("/preauthorization"), data),
    authorization: (data) => post(endpoint("/authorization"), data),
    capture: (data) => post(endpoint("/capture"), data),
    refund: (data) => post(endpoint("/refund"), data),
  };
};
