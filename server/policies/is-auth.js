"use strict";

module.exports = async (ctx, config, { strapi }) => {
  const { authorization } = ctx.request.header || {};

  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.split(" ")[1];

    try {
      const apiTokenService = strapi.services["admin::api-token"];
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
