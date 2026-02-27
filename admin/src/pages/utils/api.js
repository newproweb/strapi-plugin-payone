import { useFetchClient } from '@strapi/strapi/admin';
import pluginId from '../../pluginId';

const usePayoneRequests = () => {
  const { get, post, put } = useFetchClient();

  const getSettings = () => get(`/${pluginId}/settings`);

  const updateSettings = (data) =>
    put(`/${pluginId}/settings`, data);

  const getTransactionHistory = (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.filters && typeof params.filters === "object") {
      Object.keys(params.filters).forEach((key) => {
        const value = params.filters[key];
        const v = value == null ? "" : String(value).trim();
        if (v !== "" && v.toLowerCase() !== "all") {
          queryParams.append(`filters[${key}]`, String(value));
        }
      });
    }

    if (params.pagination) {
      if (params.pagination.page) {
        queryParams.append('pagination[page]', String(params.pagination.page));
      }
      if (params.pagination.pageSize) {
        queryParams.append('pagination[pageSize]', String(params.pagination.pageSize));
      }
    }

    const queryString = queryParams.toString();
    return get(
      `/${pluginId}/transaction-history${queryString ? `?${queryString}` : ''}`
    );
  };

  const exportTransactions = (params = {}) => {
    const queryParams = new URLSearchParams();
    const format = params.format === "csv" ? "csv" : "json";
    queryParams.append("format", format);
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params.filters && typeof params.filters === "object") {
      Object.keys(params.filters).forEach((key) => {
        const value = params.filters[key];
        const v = value == null ? "" : String(value).trim();
        if (v !== "" && v.toLowerCase() !== "all") {
          queryParams.append(`filters[${key}]`, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return get(`/${pluginId}/transactions/export?${queryString}`);
  };

  const importTransactions = (payload) => {
    return post(`/${pluginId}/transactions/import`, payload, {
      headers: { "Content-Type": "application/json" },
    });
  };

  const testConnection = () =>
    post(`/${pluginId}/test-connection`);

  const preauthorization = (data) =>
    post(`/${pluginId}/preauthorization`, data);

  const authorization = (data) =>
    post(`/${pluginId}/authorization`, data);

  const capture = (data) =>
    post(`/${pluginId}/capture`, data);

  const refund = (data) =>
    post(`/${pluginId}/refund`, data);

  const handle3DSCallback = (data) =>
    post(`/${pluginId}/3ds-callback`, data);

  return {
    getSettings,
    updateSettings,
    getTransactionHistory,
    exportTransactions,
    importTransactions,
    testConnection,
    preauthorization,
    authorization,
    capture,
    refund,
    handle3DSCallback,
  };
};

export default usePayoneRequests;