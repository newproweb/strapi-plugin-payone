"use strict";

module.exports = async (ctx, config, { strapi }) => {
  const { request } = ctx;
  const userAgent = request.header["user-agent"] || request.header["User-Agent"] || "";
  const clientIp = request.ip || request.connection?.remoteAddress || "";

  if (userAgent !== "PAYONE FinanceGate") {
    console.log(`[Payone TransactionStatus] Invalid User-Agent: ${userAgent}, IP: ${clientIp}`);
    return false;
  }


  const isValidIp = (ip) => {
    if (ip.startsWith("185.60.20.")) {
      return true;
    }

    if (ip === "54.246.203.105") {
      return true;
    }
    return false;
  };

  if (!isValidIp(clientIp)) {
    console.log(`[Payone TransactionStatus] Invalid IP address: ${clientIp}, User-Agent: ${userAgent}`);
    return false;
  }

  return true;
};
