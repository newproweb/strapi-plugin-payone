"use strict";

const BEARER_PREFIX = "Bearer ";

const findToken = (tokenService, accessKey) =>
  (tokenService.getByAccessKey
    ? tokenService.getByAccessKey(accessKey)
    : tokenService.getBy?.({ accessKey })
  ).catch(() => null);

const isExpired = (token) => !!token.expiresAt && new Date(token.expiresAt) < new Date();

/** Accepts requests that carry a valid, unexpired Strapi API token as `Authorization: Bearer …`. */
module.exports = async (policyContext, config, { strapi }) => {
  const auth = policyContext.request.header?.authorization;
  if (!auth?.startsWith(BEARER_PREFIX)) return false;

  const token = auth.slice(BEARER_PREFIX.length).trim();
  if (!token) return false;

  const tokenService = strapi.service?.("admin::api-token-content-api") || strapi.service?.("admin::api-token");
  if (!tokenService?.hash) return false;

  const stored = await findToken(tokenService, tokenService.hash(token));
  return !!stored && !isExpired(stored);
};
