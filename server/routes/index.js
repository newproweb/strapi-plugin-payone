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
        method: "GET",
        path: "/transactions/export",
        handler: "payone.exportTransactions",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },
      {
        method: "POST",
        path: "/transactions/import",
        handler: "payone.importTransactions",
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
      },
      {
        method: "POST",
        path: "/3ds-callback",
        handler: "payone.handle3DSCallback",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },
      {
        method: "POST",
        path: "/validate-apple-pay-merchant",
        handler: "payone.validateApplePayMerchant",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },
      {
        method: "POST",
        path: "/hash384",
        handler: "payone.hash384",
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
        method: "GET",
        path: "/settings",
        handler: "payone.getPublicSettings",
        config: {
          policies: ["plugin::strapi-plugin-payone-provider.is-auth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/preauthorization",
        handler: "payone.preauthorization",
        config: {
          policies: ["plugin::strapi-plugin-payone-provider.is-auth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/authorization",
        handler: "payone.authorization",
        config: {
          policies: ["plugin::strapi-plugin-payone-provider.is-auth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/capture",
        handler: "payone.capture",
        config: {
          policies: ["plugin::strapi-plugin-payone-provider.is-auth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/refund",
        handler: "payone.refund",
        config: {
          policies: ["plugin::strapi-plugin-payone-provider.is-auth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/test-connection",
        handler: "payone.testConnection",
        config: {
          policies: ["plugin::strapi-plugin-payone-provider.is-auth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/3ds-callback",
        handler: "payone.handle3DSCallback",
        config: {
          policies: ["plugin::strapi-plugin-payone-provider.is-auth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/validate-apple-pay-merchant",
        handler: "payone.validateApplePayMerchant",
        config: {
          policies: ["plugin::strapi-plugin-payone-provider.is-auth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/hosted-tokenization/jwt",
        handler: "payone.hostedTokenizationJwt",
        config: {
          policies: ["plugin::strapi-plugin-payone-provider.is-auth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/hash384",
        handler: "payone.hash384",
        config: {
          policies: ["plugin::strapi-plugin-payone-provider.is-auth"],
          auth: false
        }
      },
      {
        method: "POST",
        path: "/transaction-status",
        handler: "payone.handleTransactionStatus",
        config: {
          // policies: ["plugin::strapi-plugin-payone-provider.is-payone-notification"],
          auth: false
        }
      }
    ]
  }
};
