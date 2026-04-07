"use strict";

const { yup } = require("@strapi/utils");

module.exports = {
  default: {
    settings: {
      aid: "",
      portalid: "",
      mid: "",
      key: "",
      mode: "test",
      api_version: "3.10",
      // PAYONE Server API (Hosted Tokenization / Server-to-server)
      // merchantId/PSPID used in REST endpoints: /v2/{merchantId}/...
      serverApiMerchantId: "",
      // API Key ID + Secret used for HMAC auth (GCS v1HMAC)
      serverApiKeyId: "",
      serverApiSecret: "",
      // Keep configurable, default PAYONE REST version path
      serverApiVersionPath: "/v2",

      // Defaults (Germany)
      defaultCountryCode: "DE",
      defaultCurrencyCode: "EUR",
      defaultLocale: "de_DE",
      merchantName: "",
      displayName: "",
      domainName: "",
      merchantIdentifier: "",
      enableCreditCard: false,
      enablePayPal: false,
      enableGooglePay: false,
      enableApplePay: false,
      enableSofort: false,
      enableSepaDirectDebit: false,
    }
  },
  validator(config) {
    if (!config || !config.settings) {
      return config;
    }

    const schema = yup.object({
      settings: yup
        .object({
          aid: yup.string().defined(),
          portalid: yup.string().defined(),
          mid: yup.string().defined(),
          key: yup.string().defined(),
          mode: yup.mixed().oneOf(["test", "live"]).defined(),
          api_version: yup
            .string()
            .matches(/^\d+\.\d+$/)
            .defined(),
          serverApiMerchantId: yup.string().optional(),
          serverApiKeyId: yup.string().optional(),
          serverApiSecret: yup.string().optional(),
          serverApiVersionPath: yup.string().optional(),

          defaultCountryCode: yup.string().optional(),
          defaultCurrencyCode: yup.string().optional(),
          defaultLocale: yup.string().optional(),
          merchantName: yup.string().optional(),
          displayName: yup.string().optional(),
          domainName: yup.string().optional(),
          merchantIdentifier: yup.string().optional(),
          enableCreditCard: yup.boolean().optional(),
          enablePayPal: yup.boolean().optional(),
          enableGooglePay: yup.boolean().optional(),
          enableApplePay: yup.boolean().optional(),
          enableSofort: yup.boolean().optional(),
          enableSepaDirectDebit: yup.boolean().optional(),
        })
        .defined()
    });

    return schema.validateSync(config, {
      abortEarly: false,
      stripUnknown: true
    });
  }
};
