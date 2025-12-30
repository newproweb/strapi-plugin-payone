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
      merchantIdentifier: ""
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
            .defined()
        })
        .defined()
    });

    return schema.validateSync(config, {
      abortEarly: false,
      stripUnknown: true
    });
  }
};
