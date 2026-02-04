module.exports = async (ctx) => {
  const { request } = ctx;

  const userAgent = request.headers["user-agent"] || "";
  const clientIp =
    request.headers["x-payone-client-ip"]?.trim() ||
    request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    request.ip ||
    "";

  const isValid = userAgent === "PAYONE FinanceGate" && (clientIp.startsWith("185.60.20.") || clientIp === "54.246.203.105");

  ctx.state.payoneAllowed = isValid;

  if (!isValid) {
    console.log("[Payone] Policy failed", { userAgent, clientIp });
  }

  return true;
};
