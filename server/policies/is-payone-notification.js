"use strict";

const {
  NOTIFICATION_USER_AGENT,
  NOTIFICATION_ALLOWED_IPS,
  NOTIFICATION_ALLOWED_IP_RANGES
} = require("../constants");

/** Client IP priority: the custom nginx `x-payone-client-ip` header, then forwarded headers, then the socket. */
const clientIpOf = (headers, ip) =>
  headers["x-payone-client-ip"]?.trim() ||
  headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  headers["x-real-ip"]?.trim() ||
  ip ||
  "";

const isAllowedIp = (clientIp) =>
  NOTIFICATION_ALLOWED_IPS.includes(clientIp) ||
  NOTIFICATION_ALLOWED_IP_RANGES.some((range) => range.test(clientIp));

/** Flags on `ctx.state.payoneAllowed` whether the request comes from Payone. Never blocks the request. */
module.exports = async (ctx) => {
  const { headers } = ctx.request;
  const userAgent = headers["user-agent"] || "";
  const clientIp = clientIpOf(headers, ctx.request.ip);
  const isValid = isAllowedIp(clientIp) && userAgent === NOTIFICATION_USER_AGENT;

  ctx.state.payoneAllowed = isValid;
  if (!isValid) console.warn("[Payone] Policy failed", { userAgent, clientIp });

  return true;
};
