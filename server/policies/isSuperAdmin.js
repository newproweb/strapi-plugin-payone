"use strict";

module.exports = async (ctx, next) => {
  const adminUser = ctx.state && ctx.state.user;

  if (!adminUser) {
    return ctx.unauthorized("Admin authentication required");
  }

  const roles = Array.isArray(adminUser.roles) ? adminUser.roles : [];
  const isSuperAdmin = roles.some((role) => role.code === "strapi-super-admin");

  if (!isSuperAdmin) {
    return ctx.forbidden("Only super admins can access this resource");
  }

  return next();
};
