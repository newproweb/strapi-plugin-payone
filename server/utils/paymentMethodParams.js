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

  // Handle special cases (gpp, apl) FIRST - set wallettype BEFORE changing clearingtype
  if (clearingtype === "gpp" || clearingtype === "apl") {
    if (clearingtype === "gpp") {
      updated.wallettype = "GGP";
    } else if (clearingtype === "apl") {
      updated.wallettype = "APL";
    }
    updated.clearingtype = "wlt";
  }

  const defaults = methodDefaults[clearingtype] || methodDefaults.cc;

  // Apply defaults (but don't override wallettype if already set)
  Object.entries(defaults).forEach(([key, value]) => {
    if (key === "wallettype" && updated.wallettype) {
      return; // Don't override wallettype if already set
    }
    if (!updated[key]) {
      updated[key] = value;
    }
  });
  
  // Handle Apple Pay token if present
  if (updated.applePayToken || updated["add_paydata[paymentmethod_token_data]"]) {
    const token = updated.applePayToken || updated["add_paydata[paymentmethod_token_data]"];
    const gatewayMerchantId = updated.mid || updated.portalid || '';
    
    updated["add_paydata[paymentmethod_token_data]"] = token;
    updated["add_paydata[paymentmethod]"] = "APL";
    updated["add_paydata[paymentmethod_type]"] = "APPLEPAY";
    updated["add_paydata[gatewayid]"] = "payonegmbh";
    if (gatewayMerchantId) {
      updated["add_paydata[gateway_merchantid]"] = gatewayMerchantId;
    }
    
    // Remove applePayToken from params as it's now in add_paydata
    delete updated.applePayToken;
  }

  // Ensure wallettype is set for wallet payments
  if (updated.clearingtype === "wlt" && !updated.wallettype) {
    if (clearingtype === "gpp" || updated.paymentMethod === "gpp" || (updated["add_paydata[paymentmethod]"] === "GGP")) {
      updated.wallettype = "GGP";
    } else if (clearingtype === "apl" || updated.paymentMethod === "apl" || (updated["add_paydata[paymentmethod]"] === "APL")) {
      updated.wallettype = "APL";
    } else {
      updated.wallettype = "PPE";
    }
  }
  
  // Remove cardtype if clearingtype is wallet payment
  if (updated.clearingtype === "wlt" && updated.cardtype) {
    delete updated.cardtype;
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

