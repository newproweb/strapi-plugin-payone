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
      merchantName: "",
      displayName: "",
      domainName: "",
      merchantIdentifier: "",
      enableCreditCard: false,
      enablePayPal: false,
      enableGooglePay: false,
      enableApplePay: false,
      enableSofort: false,
      enableSepaDirectDebit: false
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
          merchantName: yup.string().optional(),
          displayName: yup.string().optional(),
          domainName: yup.string().optional(),
          merchantIdentifier: yup.string().optional(),
          enableCreditCard: yup.boolean().optional(),
          enablePayPal: yup.boolean().optional(),
          enableGooglePay: yup.boolean().optional(),
          enableApplePay: yup.boolean().optional(),
          enableSofort: yup.boolean().optional(),
          enableSepaDirectDebit: yup.boolean().optional()
        })
        .defined()
    });

    return schema.validateSync(config, {
      abortEarly: false,
      stripUnknown: true
    });
  }
};
