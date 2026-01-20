"use strict";

module.exports = async (policyContext, config, { strapi }) => {
  const { authorization } = policyContext.request.header || {};

  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.split(" ")[1];

    try {
      const apiTokenService = strapi.service("admin::api-token");

      if (!apiTokenService) {
        strapi.log.warn("strapi-plugin-payone-provider: api-token service not found");
        return false;
      }

      const accessKey = await apiTokenService.hash(token);
      const storedToken = await apiTokenService.getBy({ accessKey });

      if (storedToken) {
        return true;
      }
    } catch (e) {
      strapi.log.warn("strapi-plugin-payone-provider isAuth policy error:", e.message);
    }
  }

  return false;
};
