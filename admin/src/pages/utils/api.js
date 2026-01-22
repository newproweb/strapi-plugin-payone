import { request } from "@strapi/helper-plugin";
import pluginId from "../../pluginId";

const payoneRequests = {
  getSettings: () => {
    return request(`/${pluginId}/settings`, {
      method: "GET"
    });
  },

  updateSettings: (data) => {
    return request(`/${pluginId}/settings`, {
      method: "PUT",
      body: data
    });
  },

  getTransactionHistory: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.filters) {
      Object.keys(params.filters).forEach((key) => {
        const value = params.filters[key];
        if (value !== undefined && value !== null && value !== '') {
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

    if (params.sort_by) {
      queryParams.append('sort_by', String(params.sort_by));
    }
    if (params.sort_order) {
      queryParams.append('sort_order', String(params.sort_order));
    }

    const queryString = queryParams.toString();
    const response = await request(
      `/${pluginId}/transaction-history${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET"
      }
    );
    return response;
  },

  testConnection: () => {
    return request(`/${pluginId}/test-connection`, {
      method: "POST"
    });
  },

  preauthorization: (data) => {
    return request(`/${pluginId}/preauthorization`, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/json"
      }
    });
  },

  authorization: (data) => {
    return request(`/${pluginId}/authorization`, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/json"
      }
    });
  },

  capture: (data) => {
    return request(`/${pluginId}/capture`, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/json"
      }
    });
  },

  refund: (data) => {
    return request(`/${pluginId}/refund`, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/json"
      }
    });
  },

  handle3DSCallback: (data) => {
    return request(`/${pluginId}/3ds-callback`, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

export default payoneRequests;
