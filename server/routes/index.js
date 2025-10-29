"use strict";

module.exports = {
  admin: {
    type: "admin",
    routes: [
      {
        method: "GET",
        path: "/settings",
        handler: "payone.getSettings",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },
      {
        method: "PUT",
        path: "/settings",
        handler: "payone.updateSettings",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },
      {
        method: "GET",
        path: "/transaction-history",
        handler: "payone.getTransactionHistory",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },
      {
        method: "POST",
        path: "/test-connection",
        handler: "payone.testConnection",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },

      {
        method: "POST",
        path: "/preauthorization",
        handler: "payone.preauthorization",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },
      {
        method: "POST",
        path: "/authorization",
        handler: "payone.authorization",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },
      {
        method: "POST",
        path: "/capture",
        handler: "payone.capture",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },
      {
        method: "POST",
        path: "/refund",
        handler: "payone.refund",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      }
    ]
  },
  "content-api": {
    type: "content-api",
    routes: [
      {
        method: "POST",
        path: "/preauthorization",
        handler: "payone.preauthorization",
        config: {
          policies: ["plugin::payone-provider.isAuth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/authorization",
        handler: "payone.authorization",
        config: {
          policies: ["plugin::payone-provider.isAuth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/capture",
        handler: "payone.capture",
        config: {
          policies: ["plugin::payone-provider.isAuth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/refund",
        handler: "payone.refund",
        config: {
          policies: ["plugin::payone-provider.isAuth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/test-connection",
        handler: "payone.testConnection",
        config: {
          policies: ["plugin::payone-provider.isAuth"],
          auth: false
        }
      }
    ]
  }
};
