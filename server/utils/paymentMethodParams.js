"use strict";


const addPaymentMethodParams = (params, logger) => {
  const updated = { ...params };
  const clearingtype = updated.clearingtype || "cc";

  // Payment method specific defaults
  const methodDefaults = {
    cc: {
      cardpan: "4111111111111111",
      cardexpiredate: "2512",
      cardcvc2: "123",
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
    if (!updated[key]) {
      updated[key] = value;
    }
  });

  if (updated.applePayToken) {
    let tokenData;
    try {
      // Decode Base64 token
      const tokenString = Buffer.from(updated.applePayToken, 'base64').toString('utf-8');
      tokenData = JSON.parse(tokenString);
    } catch (e) {
      try {
        // Try parsing as JSON string directly
        tokenData = typeof updated.applePayToken === 'string'
          ? JSON.parse(updated.applePayToken)
          : updated.applePayToken;
      } catch (e2) {
        // If already an object, use as-is
        tokenData = updated.applePayToken;
      }
    }

    if (tokenData && typeof tokenData === 'object') {
      const paymentData = tokenData.paymentData;

      if (!paymentData) {
        if (logger) {
          logger.error("[Apple Pay] Invalid token structure: missing paymentData field");
        }
        delete updated.applePayToken;
        return updated;
      }

      const header = paymentData.header || {};

      // Payone required fields according to docs
      updated["add_paydata[paymentdata_token_version]"] = paymentData.version || "EC_v1";
      updated["add_paydata[paymentdata_token_data]"] = paymentData.data || "";
      updated["add_paydata[paymentdata_token_signature]"] = paymentData.signature || "";
      updated["add_paydata[paymentdata_token_ephemeral_publickey]"] = header.ephemeralPublicKey || "";
      updated["add_paydata[paymentdata_token_publickey_hash]"] = header.publicKeyHash || "";

      // Transaction ID is optional according to Payone docs
      if (paymentData.transactionId || header.transactionId) {
        updated["add_paydata[paymentdata_token_transaction_id]"] = paymentData.transactionId || header.transactionId || "";
      }

      if (!updated["add_paydata[paymentdata_token_data]"] ||
        !updated["add_paydata[paymentdata_token_signature]"] ||
        !updated["add_paydata[paymentdata_token_ephemeral_publickey]"] ||
        !updated["add_paydata[paymentdata_token_publickey_hash]"]) {
        if (logger) {
          logger.error("[Apple Pay] Missing required token fields:", {
            hasData: !!updated["add_paydata[paymentdata_token_data]"],
            hasSignature: !!updated["add_paydata[paymentdata_token_signature]"],
            hasEphemeralPublicKey: !!updated["add_paydata[paymentdata_token_ephemeral_publickey]"],
            hasPublicKeyHash: !!updated["add_paydata[paymentdata_token_publickey_hash]"]
          });
        }
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

  return updated;
};

module.exports = {
  addPaymentMethodParams
};

