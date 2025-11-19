"use strict";

/**
 * Add payment method specific parameters
 * @param {Object} params - Request parameters
 * @param {Object} logger - Logger instance
 * @returns {Object} Updated parameters with payment method defaults
 */
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
      wallettype: "GPP"
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

  const defaults = methodDefaults[clearingtype] || methodDefaults.cc;

  // Apply defaults
  Object.entries(defaults).forEach(([key, value]) => {
    if (!updated[key]) {
      updated[key] = value;
    }
  });

  // Handle special cases (gpp, apl)
  if (clearingtype === "gpp" || clearingtype === "apl") {
    updated.clearingtype = "wlt";
  }

  // Warn for unknown clearing types
  if (!methodDefaults[clearingtype] && logger) {
    logger.warn(`Unknown clearingtype: ${clearingtype}, using credit card defaults`);
  }

  // Common defaults
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

