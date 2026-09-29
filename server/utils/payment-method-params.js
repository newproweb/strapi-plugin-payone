"use strict";

const {
  CUSTOMER_DEFAULTS,
  PAYMENT_METHOD_DEFAULTS,
  WALLET_TYPE_BY_CLEARINGTYPE
} = require("../constants");
const { applyMissingDefaults } = require("./request-params");

const nextYearExpiry = () => {
  const now = new Date();
  const nextYear = (now.getFullYear() % 100) + 1;
  return `${nextYear}${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/** Returns `cardexpiredate` (YYMM) when it is a valid future month, otherwise this month next year. */
const getValidCardExpiryDate = (cardexpiredate) => {
  if (!cardexpiredate || cardexpiredate.trim() === "" || !/^\d{4}$/.test(cardexpiredate)) {
    return nextYearExpiry();
  }

  const year = parseInt(cardexpiredate.substring(0, 2), 10);
  const month = parseInt(cardexpiredate.substring(2, 4), 10);
  if (month < 1 || month > 12) return nextYearExpiry();

  const now = new Date();
  const currentDate = new Date(2000 + (now.getFullYear() % 100), now.getMonth());
  const expiryDate = new Date(2000 + year, month - 1);
  return expiryDate < currentDate ? nextYearExpiry() : cardexpiredate;
};

const methodDefaultsFor = (clearingtype, params) => {
  const defaults = { ...(PAYMENT_METHOD_DEFAULTS[clearingtype] || PAYMENT_METHOD_DEFAULTS.cc) };
  if (clearingtype === "elv") {
    defaults.bankaccountholder = `${params.firstname || "Test"} ${params.lastname || "User"}`;
  }
  return defaults;
};

const applyMethodDefaults = (params, clearingtype) => {
  for (const [key, value] of Object.entries(methodDefaultsFor(clearingtype, params))) {
    if (key === "wallettype" && params.wallettype) continue;
    if (key === "cardexpiredate") {
      params[key] = getValidCardExpiryDate(params[key]);
    } else if (!params[key]) {
      params[key] = value;
    }
  }
};

const attempt = (parse) => {
  try {
    return { ok: true, value: parse() };
  } catch (e) {
    return { ok: false };
  }
};

/** Apple Pay tokens arrive Base64-encoded, as a JSON string or already as an object. */
const decodeApplePayToken = (token, logger) => {
  const fromBase64 = attempt(() => JSON.parse(Buffer.from(token, "base64").toString("utf-8")));
  if (fromBase64.ok) {
    if (logger) logger.info("[Apple Pay] Token decoded from Base64 successfully");
    return fromBase64.value;
  }

  const fromJson = attempt(() => (typeof token === "string" ? JSON.parse(token) : token));
  if (fromJson.ok) {
    if (logger) logger.info("[Apple Pay] Token parsed as JSON string directly");
    return fromJson.value;
  }

  if (logger) logger.info("[Apple Pay] Token used as-is (already an object)");
  return token;
};

/**
 * Copies the Apple Pay token fields Payone expects into `add_paydata[…]`.
 * Returns false when the token has no `paymentData`, which stops any further defaults.
 */
const applyApplePayToken = (params, logger) => {
  const tokenData = decodeApplePayToken(params.applePayToken, logger);

  if (!tokenData || typeof tokenData !== "object") {
    if (logger) {
      logger.error("[Apple Pay] Token is not a valid object:", {
        tokenType: typeof tokenData,
        tokenValue: typeof tokenData === "string" ? tokenData.substring(0, 200) : String(tokenData).substring(0, 200)
      });
    }
    return true;
  }

  const paymentData = tokenData.paymentData;
  if (!paymentData) {
    if (logger) {
      logger.error("[Apple Pay] Invalid token structure: missing paymentData field", {
        tokenKeys: Object.keys(tokenData),
        tokenStructure: JSON.stringify(tokenData).substring(0, 500)
      });
    }
    return false;
  }

  const header = paymentData.header || {};
  const tokenVersion = paymentData.version || "EC_v1";
  const tokenDataValue = paymentData.data || "";
  const tokenSignature = paymentData.signature || "";
  const ephemeralPublicKey = header.ephemeralPublicKey || "";
  const publicKeyHash = header.publicKeyHash || "";
  const transactionId = paymentData.transactionId || header.transactionId || "";

  params["add_paydata[paymentdata_token_version]"] = tokenVersion;
  params["add_paydata[paymentdata_token_data]"] = tokenDataValue;
  params["add_paydata[paymentdata_token_signature]"] = tokenSignature;
  params["add_paydata[paymentdata_token_ephemeral_publickey]"] = ephemeralPublicKey;
  params["add_paydata[paymentdata_token_publickey_hash]"] = publicKeyHash;
  if (transactionId) params["add_paydata[paymentdata_token_transaction_id]"] = transactionId;

  if (logger) {
    logger.info("[Apple Pay] Token extracted successfully:", {
      hasVersion: !!tokenVersion,
      hasData: !!tokenDataValue,
      hasSignature: !!tokenSignature,
      hasEphemeralPublicKey: !!ephemeralPublicKey,
      hasPublicKeyHash: !!publicKeyHash,
      hasTransactionId: !!transactionId,
      dataLength: tokenDataValue.length,
      signatureLength: tokenSignature.length,
      ephemeralPublicKeyLength: ephemeralPublicKey.length,
      publicKeyHashLength: publicKeyHash.length
    });
  }

  if (logger && (!tokenDataValue || !tokenSignature || !ephemeralPublicKey || !publicKeyHash)) {
    logger.error("[Apple Pay] Missing required token fields:", {
      hasData: !!tokenDataValue,
      hasSignature: !!tokenSignature,
      hasEphemeralPublicKey: !!ephemeralPublicKey,
      hasPublicKeyHash: !!publicKeyHash,
      paymentDataKeys: Object.keys(paymentData),
      headerKeys: Object.keys(header)
    });
  }

  return true;
};

const inferWalletType = (clearingtype, params) => {
  if (clearingtype === "gpp" || params.paymentMethod === "gpp" || params["add_paydata[paymentmethod]"] === "GGP") return "GGP";
  if (clearingtype === "apl" || params.paymentMethod === "apl" || params["add_paydata[paymentmethod]"] === "APL") return "APL";
  return "PPE";
};

/**
 * Normalises a payment request for its clearing type: maps the `gpp`/`apl` shortcuts to wallets,
 * fills the per-method defaults, unpacks an Apple Pay token and adds the customer defaults.
 */
const addPaymentMethodParams = (params, logger) => {
  const updated = { ...params };
  const clearingtype = updated.clearingtype || "cc";

  if (WALLET_TYPE_BY_CLEARINGTYPE[clearingtype]) {
    updated.wallettype = WALLET_TYPE_BY_CLEARINGTYPE[clearingtype];
    updated.clearingtype = "wlt";
  }

  applyMethodDefaults(updated, clearingtype);

  if (updated.applePayToken) {
    const tokenApplied = applyApplePayToken(updated, logger);
    delete updated.applePayToken;
    if (!tokenApplied) return updated;
  }

  if (updated.clearingtype === "wlt" && !updated.wallettype) {
    updated.wallettype = inferWalletType(clearingtype, updated);
  }
  if (updated.clearingtype === "wlt" && updated.cardtype) {
    delete updated.cardtype;
  }

  return applyMissingDefaults(updated, CUSTOMER_DEFAULTS);
};

module.exports = { addPaymentMethodParams };
