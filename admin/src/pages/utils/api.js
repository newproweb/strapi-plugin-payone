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

  getTransactionHistory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(
      `/${pluginId}/transaction-history${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET"
      }
    );
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
