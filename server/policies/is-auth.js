"use strict";

module.exports = async (policyContext, config, { strapi }) => {
  const auth = policyContext.request.header?.authorization;
  if (!auth?.startsWith("Bearer ")) return false;

  const token = auth.slice(7).trim();
  if (!token) return false;

  const tokenService =
    strapi.service?.("admin::api-token-content-api") ||
    strapi.service?.("admin::api-token");

  if (!tokenService?.hash) return false;

  const accessKey = tokenService.hash(token);
  const stored = await (tokenService.getByAccessKey
    ? tokenService.getByAccessKey(accessKey)
    : tokenService.getBy?.({ accessKey })
  ).catch(() => null);

  if (!stored) return false;
  if (stored.expiresAt && new Date(stored.expiresAt) < new Date()) return false;

  return true;
};
