"use strict";

module.exports = async (policyContext, config, { strapi }) => {
  const adminUser = policyContext.state && policyContext.state.user;

  if (!adminUser) {
    policyContext.unauthorized("Admin authentication required");
    return false;
  }

  const roles = Array.isArray(adminUser.roles) ? adminUser.roles : [];
  const isSuperAdmin = roles.some((role) => role.code === "strapi-super-admin");

  if (!isSuperAdmin) {
    policyContext.forbidden("Only super admins can access this resource");
    return false;
  }

  return true;
};
