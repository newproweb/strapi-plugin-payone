"use strict";


function getValidCardExpiryDate(cardexpiredate) {
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (!cardexpiredate || cardexpiredate.trim() === "") {
    const nextYear = currentYear + 1;
    const monthStr = String(currentMonth).padStart(2, '0');
    return `${nextYear}${monthStr}`;
  }

  if (!/^\d{4}$/.test(cardexpiredate)) {
    const nextYear = currentYear + 1;
    const monthStr = String(currentMonth).padStart(2, '0');
    return `${nextYear}${monthStr}`;
  }

  const year = parseInt(cardexpiredate.substring(0, 2), 10);
  const month = parseInt(cardexpiredate.substring(2, 4), 10);

  if (month < 1 || month > 12) {
    const nextYear = currentYear + 1;
    const monthStr = String(currentMonth).padStart(2, '0');
    return `${nextYear}${monthStr}`;
  }

  const currentDate = new Date(2000 + currentYear, currentMonth - 1);
  const expiryDate = new Date(2000 + year, month - 1);

  if (expiryDate < currentDate) {
    const nextYear = currentYear + 1;
    const monthStr = String(currentMonth).padStart(2, '0');
    return `${nextYear}${monthStr}`;
  }

  return cardexpiredate;
}

const addPaymentMethodParams = (params, logger) => {
  const updated = { ...params };
  const clearingtype = updated.clearingtype || "cc";

  const customParams = {};
  const knownParams = new Set([
    'cardexpiredate', 'cardtype', 'wallettype',
    'bankcountry', 'iban', 'bic', 'bankaccountholder', 'onlinebanktransfertype',
    'recurrence', 'financingtype', 'invoicetype',
    // Common defaults
    'salutation', 'gender', 'telephonenumber', 'ip', 'language', 'customer_is_present',
    // Payment method tokens
    'applePayToken', 'googlePayToken',
    // Other known params
    'clearingtype', 'paymentMethod', 'settings', 'enable3DSecure', 'ecommercemode'
  ]);

  // Extract custom params that are not in known params
  Object.keys(updated).forEach(key => {
    if (!knownParams.has(key) && !key.startsWith('add_paydata[')) {
      customParams[key] = updated[key];
    }
  });

  const methodDefaults = {
    cc: {
      cardexpiredate: getValidCardExpiryDate(null),
      cardtype: "V"
    },
    wlt: {
      wallettype: "PPE"
    },
    gpp: {
      clearingtype: "wlt",
      wallettype: "GGP"
    },
    apl: {
      clearingtype: "wlt",
      wallettype: "APL"
    },
    elv: {
      bankcountry: "DE",
      iban: "DE89370400440532013000",
      bic: "COBADEFFXXX",
      bankaccountholder: `${updated.firstname || "Test"} ${updated.lastname || "User"}`
    },
    sb: {
      bankcountry: "DE",
      onlinebanktransfertype: "PNT"
    },
    gp: {
      bankcountry: "DE",
      onlinebanktransfertype: "GPY"
    },
    idl: {
      bankcountry: "NL",
      onlinebanktransfertype: "IDL"
    },
    bct: {
      bankcountry: "BE",
      onlinebanktransfertype: "BCT"
    },
    rec: {
      recurrence: "recurring"
    },
    fnc: {
      financingtype: "fnc"
    },
    iv: {
      invoicetype: "invoice"
    }
  };

  if (clearingtype === "gpp" || clearingtype === "apl") {
    if (clearingtype === "gpp") {
      updated.wallettype = "GGP";
    } else if (clearingtype === "apl") {
      updated.wallettype = "APL";
    }
    updated.clearingtype = "wlt";
  }

  const defaults = methodDefaults[clearingtype] || methodDefaults.cc;

  Object.entries(defaults).forEach(([key, value]) => {
    if (key === "wallettype" && updated.wallettype) {
      return;
    }
    if (key === "cardexpiredate") {
      if (!updated[key] || updated[key].trim() === "") {
        updated[key] = getValidCardExpiryDate(null);
      } else {
        updated[key] = getValidCardExpiryDate(updated[key]);
      }
    } else if (!updated[key]) {
      updated[key] = value;
    }
  });

  if (updated.applePayToken) {
    let tokenData;
    try {
      const tokenString = Buffer.from(updated.applePayToken, 'base64').toString('utf-8');
      tokenData = JSON.parse(tokenString);

      if (logger) {
        logger.info("[Apple Pay] Token decoded from Base64 successfully");
      }
    } catch (e) {
      try {
        tokenData = typeof updated.applePayToken === 'string'
          ? JSON.parse(updated.applePayToken)
          : updated.applePayToken;

        if (logger) {
          logger.info("[Apple Pay] Token parsed as JSON string directly");
        }
      } catch (e2) {
        tokenData = updated.applePayToken;

        if (logger) {
          logger.info("[Apple Pay] Token used as-is (already an object)");
        }
      }
    }

    if (tokenData && typeof tokenData === 'object') {
      const paymentData = tokenData.paymentData;

      if (!paymentData) {
        if (logger) {
          logger.error("[Apple Pay] Invalid token structure: missing paymentData field", {
            tokenKeys: Object.keys(tokenData),
            tokenStructure: JSON.stringify(tokenData).substring(0, 500)
          });
        }
        delete updated.applePayToken;
        return updated;
      }

      const header = paymentData.header || {};

      // Payone required fields according to docs
      // Extract version, data, signature from paymentData
      const tokenVersion = paymentData.version || "EC_v1";
      const tokenDataValue = paymentData.data || "";
      const tokenSignature = paymentData.signature || "";

      // Extract from header
      const ephemeralPublicKey = header.ephemeralPublicKey || "";
      const publicKeyHash = header.publicKeyHash || "";
      const transactionId = paymentData.transactionId || header.transactionId || "";

      // Set Payone required fields
      updated["add_paydata[paymentdata_token_version]"] = tokenVersion;
      updated["add_paydata[paymentdata_token_data]"] = tokenDataValue;
      updated["add_paydata[paymentdata_token_signature]"] = tokenSignature;
      updated["add_paydata[paymentdata_token_ephemeral_publickey]"] = ephemeralPublicKey;
      updated["add_paydata[paymentdata_token_publickey_hash]"] = publicKeyHash;

      // Transaction ID is optional according to Payone docs
      if (transactionId) {
        updated["add_paydata[paymentdata_token_transaction_id]"] = transactionId;
      }

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

      // Validate required fields
      if (!tokenDataValue ||
        !tokenSignature ||
        !ephemeralPublicKey ||
        !publicKeyHash) {
        if (logger) {
          logger.error("[Apple Pay] Missing required token fields:", {
            hasData: !!tokenDataValue,
            hasSignature: !!tokenSignature,
            hasEphemeralPublicKey: !!ephemeralPublicKey,
            hasPublicKeyHash: !!publicKeyHash,
            paymentDataKeys: Object.keys(paymentData),
            headerKeys: Object.keys(header)
          });
        }
      }
    } else {
      if (logger) {
        logger.error("[Apple Pay] Token is not a valid object:", {
          tokenType: typeof tokenData,
          tokenValue: typeof tokenData === 'string' ? tokenData.substring(0, 200) : String(tokenData).substring(0, 200)
        });
      }
    }

    delete updated.applePayToken;
  }

  if (updated.clearingtype === "wlt" && !updated.wallettype) {
    if (clearingtype === "gpp" || updated.paymentMethod === "gpp" || (updated["add_paydata[paymentmethod]"] === "GGP")) {
      updated.wallettype = "GGP";
    } else if (clearingtype === "apl" || updated.paymentMethod === "apl" || (updated["add_paydata[paymentmethod]"] === "APL")) {
      updated.wallettype = "APL";
    } else {
      updated.wallettype = "PPE";
    }
  }
  if (updated.clearingtype === "wlt" && updated.cardtype) {
    delete updated.cardtype;
  }


  const commonDefaults = {
    salutation: "Herr",
    gender: "m",
    telephonenumber: "01752345678",
    ip: "127.0.0.1",
    language: "de",
    customer_is_present: "yes"
  };

  Object.entries(commonDefaults).forEach(([key, value]) => {
    if (!updated[key]) {
      updated[key] = value;
    }
  });

  Object.assign(updated, customParams);

  return updated;
};

module.exports = {
  addPaymentMethodParams
};

