module.exports = async (ctx) => {
  const userAgent = ctx.request.headers["user-agent"] || "";

  // Forwarded header parsing
  const rawForwarded = ctx.request.headers["x-forwarded-for"];
  const forwardedIp = rawForwarded?.split(",")[0]?.trim();
  const xRealIp = ctx.request.headers["x-real-ip"]?.trim();
  // Custom nginx header
  const payoneHeaderIp = ctx.request.headers["x-payone-client-ip"]?.trim();

  // Final client IP resolution priority
  const clientIp =
    payoneHeaderIp ||
    forwardedIp ||
    xRealIp ||
    ctx.request.ip ||
    "";

  // ===== Allowed IPs =====
  const allowedExactIps = [
    "54.246.203.105",
  ];

  const allowedIpRanges = [
    /^185\.60\.20\.\d+$/,   // 185.60.20.0 - 185.60.20.255
  ];

  const isIpAllowed =
    allowedExactIps.includes(clientIp) ||
    allowedIpRanges.some((regex) => regex.test(clientIp));

  const isUserAgentValid = userAgent === "PAYONE FinanceGate";

  const isValid = isIpAllowed && isUserAgentValid;

  ctx.state.payoneAllowed = isValid;

  if (!isValid) {
    console.warn("[Payone] Policy failed", {
      userAgent,
      clientIp,
    });
  }

  return true;
};