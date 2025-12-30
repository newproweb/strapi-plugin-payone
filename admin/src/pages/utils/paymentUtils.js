
export function generateLagOrderNumber(sequence = 1000) {
  const paddedSequence = sequence.toString().padStart(5, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${paddedSequence}-${randomPart}`;
}


export const getBaseParams = (options = {}) => {
  const {
    amount,
    currency = "EUR",
    reference,
    customerid,
    firstname = "John",
    lastname = "Doe",
    street = "Test Street 123",
    zip = "12345",
    city = "Test City",
    country = "DE",
    email = "test@example.com",
    salutation = "Herr",
    gender = "m",
    telephonenumber = "01752345678",
    ip = "127.0.0.1",
    customer_is_present = "yes",
    language = "de",
    successurl = "https://www.example.com/success",
    errorurl = "https://www.example.com/error",
    backurl = "https://www.example.com/back"
  } = options;

  const generateCustomerId = () => {
    const timestamp = Date.now().toString().slice(-10);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const id = `${timestamp}${random}`.slice(0, 17);
    return id;
  };

  let finalCustomerId = customerid || generateCustomerId();

  if (finalCustomerId && finalCustomerId.length > 17) {
    finalCustomerId = finalCustomerId.slice(0, 17);
  }

  return {
    // Required core parameters (Payone v1)
    amount: parseInt(amount),
    currency: currency.toUpperCase(),
    reference: reference || `REF-${Date.now()}`,
    customerid: finalCustomerId,

    // Customer information (required for preauthorization/authorization)
    firstname,
    lastname,
    street,
    zip,
    city,
    country: country.toUpperCase(),
    email,

    // Additional customer details
    salutation,
    gender,
    telephonenumber,
    ip,
    customer_is_present,
    language,

    // URL parameters (required for redirect-based payments)
    successurl,
    errorurl,
    backurl
  };
};


export const getPaymentMethodParams = (paymentMethod, options = {}) => {
  const {
    cardType,
    cardtype,
    captureMode = "full",
    cardpan,
    cardexpiredate,
    cardcvc2,
    iban,
    bic,
    bankaccountholder,
    // Shipping address for wallet payments (Google Pay, Apple Pay, PayPal)
    shipping_firstname,
    shipping_lastname,
    shipping_street,
    shipping_zip,
    shipping_city,
    shipping_country,
    // Billing address (used as fallback for shipping)
    firstname,
    lastname,
    street,
    zip,
    city,
    country
  } = options;

  // Use cardtype if provided, otherwise fall back to cardType, otherwise default to "V"
  const finalCardType = cardtype || cardType || "V";

  // Helper to get shipping params for wallet payments
  const getShippingParams = () => ({
    shipping_firstname: shipping_firstname || firstname || "John",
    shipping_lastname: shipping_lastname || lastname || "Doe",
    shipping_street: shipping_street || street || "Test Street 123",
    shipping_zip: shipping_zip || zip || "12345",
    shipping_city: shipping_city || city || "Test City",
    shipping_country: (shipping_country || country || "DE").toUpperCase()
  });

  switch (paymentMethod) {
    case "cc": // Credit Card (Visa, Mastercard, Amex)
      return {
        clearingtype: "cc",
        cardtype: finalCardType, // V = Visa, M = Mastercard, A = Amex
        cardpan: cardpan || "4111111111111111", // Test Visa card
        cardexpiredate: cardexpiredate || "2512", // MMYY format
        cardcvc2: cardcvc2 || "123" // 3-digit security code
      };

    case "wlt": // PayPal
      return {
        clearingtype: "wlt",
        wallettype: "PPE", // PayPal Express
        ...getShippingParams()
      };

    case "gpp":
      const googlePayParams = {
        clearingtype: "wlt",
        wallettype: "GGP",
        ...getShippingParams()
      };

      if (options.googlePayToken) {
        const gatewayMerchantId = options.settings?.mid || options.settings?.portalid || '';
        googlePayParams["add_paydata[paymentmethod_token_data]"] = options.googlePayToken;
        googlePayParams["add_paydata[paymentmethod]"] = "GGP";
        googlePayParams["add_paydata[paymentmethod_type]"] = "GOOGLEPAY";
        googlePayParams["add_paydata[gatewayid]"] = "payonegmbh";
        if (gatewayMerchantId) {
          googlePayParams["add_paydata[gateway_merchantid]"] = gatewayMerchantId;
        }
      }

      return googlePayParams;

    case "apl": // Apple Pay
      const applePayParams = {
        clearingtype: "wlt",
        wallettype: "APL", // Apple Pay
        ...getShippingParams()
      };

      if (options.applePayToken) {
        const gatewayMerchantId = options.settings?.mid || options.settings?.portalid || '';
        applePayParams["add_paydata[paymentmethod_token_data]"] = options.applePayToken;
        applePayParams["add_paydata[paymentmethod]"] = "APL";
        applePayParams["add_paydata[paymentmethod_type]"] = "APPLEPAY";
        applePayParams["add_paydata[gatewayid]"] = "payonegmbh";
        if (gatewayMerchantId) {
          applePayParams["add_paydata[gateway_merchantid]"] = gatewayMerchantId;
        }
      }

      return applePayParams;

    case "sb": // Sofort Banking
      return {
        clearingtype: "sb",
        bankcountry: "DE",
        onlinebanktransfertype: "PNT" // Sofort Banking
      };

    case "elv": // SEPA Direct Debit
      return {
        clearingtype: "elv",
        bankcountry: "DE",
        iban: iban || "DE89370400440532013000", // Test IBAN
        bic: bic || "COBADEFFXXX", // Test BIC
        bankaccountholder: bankaccountholder || "John Doe"
      };

    default:
      // Default to credit card for unknown payment methods
      return {
        clearingtype: "cc",
        cardtype: "V",
        cardpan: "4111111111111111",
        cardexpiredate: "2512",
        cardcvc2: "123"
      };
  }
};


export const getPreauthorizationParams = (paymentMethod, options = {}) => {
  const baseParams = getBaseParams(options);
  const methodParams = getPaymentMethodParams(paymentMethod, options);

  const params = {
    ...baseParams,
    ...methodParams,
    request: "preauthorization" // Required for Payone API
  };

  // Add 3D Secure parameters for credit card payments if enabled
  if (paymentMethod === "cc" && options.enable3DSecure !== false) {
    params["3dsecure"] = "yes";
    params.ecommercemode = options.ecommercemode || "internet";
  }

  return params;
};


export const getAuthorizationParams = (paymentMethod, options = {}) => {
  const baseParams = getBaseParams(options);
  const methodParams = getPaymentMethodParams(paymentMethod, options);

  const params = {
    ...baseParams,
    ...methodParams,
    request: "authorization" // Required for Payone API
  };

  // Add 3D Secure parameters for credit card payments if enabled
  if (paymentMethod === "cc" && options.enable3DSecure !== false) {
    params["3dsecure"] = "yes";
    params.ecommercemode = options.ecommercemode || "internet";
  }

  return params;
};


export const getCaptureParams = (paymentMethod, options = {}) => {
  const {
    txid,
    amount,
    currency = "EUR",
    captureMode = "full",
    sequencenumber = 1,
    reference
  } = options;

  // Base parameters for all payment methods (Payone v1 documentation)
  const baseParams = {
    request: "capture", // Required for Payone API
    txid,
    sequencenumber: parseInt(sequencenumber),
    amount: parseInt(amount),
    currency: currency.toUpperCase(),
    reference: reference || `CAPTURE-${Date.now()}`
  };

  // Payment method specific parameters
  let methodParams = {};

  switch (paymentMethod) {
    case "cc": // Credit Card (Visa, Mastercard)
      // Credit card capture only needs basic parameters
      break;

    case "wlt": // PayPal
    case "gpp": // Google Pay
    case "apl": // Apple Pay
      methodParams = {
        capturemode: captureMode // full or partial
      };
      break;

    case "sb": // Sofort Banking
      // Sofort capture parameters (if needed)
      break;

    case "elv": // SEPA Direct Debit
      // SEPA capture parameters (if needed)
      break;

    default:
      // Default to credit card behavior
      break;
  }

  return {
    ...baseParams,
    ...methodParams
  };
};


export const getRefundParams = (paymentMethod, options = {}) => {
  const {
    txid,
    amount,
    currency = "EUR",
    reference,
    sequencenumber = 2
  } = options;

  // Base parameters for all payment methods (Payone v1 documentation)
  const baseParams = {
    request: "refund", // Required for Payone API
    txid,
    sequencenumber: parseInt(sequencenumber),
    amount: -Math.abs(parseInt(amount)), // Refund amount must be negative
    currency: currency.toUpperCase(),
    reference: reference || `REFUND-${Date.now()}`
  };

  // Payment method specific parameters
  let methodParams = {};

  switch (paymentMethod) {
    case "cc": // Credit Card (Visa, Mastercard)
      // Credit card refund only needs basic parameters
      break;

    case "wlt": // PayPal
    case "gpp": // Google Pay
    case "apl": // Apple Pay
      // Wallet payment specific refund parameters (if needed)
      break;

    case "sb": // Sofort Banking
      // Sofort specific refund parameters (if needed)
      break;

    case "elv": // SEPA Direct Debit
      // SEPA specific refund parameters (if needed)
      break;

    default:
      // Default to credit card behavior
      break;
  }

  return {
    ...baseParams,
    ...methodParams
  };
};


export const getPaymentMethodDisplayName = (paymentMethod) => {
  const displayNames = {
    cc: "Credit Card (Visa, Mastercard)",
    wlt: "PayPal",
    gpp: "Google Pay",
    apl: "Apple Pay",
    sb: "Sofort Banking",
    elv: "SEPA Direct Debit"
  };

  return displayNames[paymentMethod] || "Unknown Payment Method";
};


export const getPaymentMethodOptions = () => {
  return [
    { value: "cc", label: "Credit Card (Visa, Mastercard)" },
    { value: "wlt", label: "PayPal" },
    { value: "gpp", label: "Google Pay" },
    { value: "apl", label: "Apple Pay" },
    { value: "sb", label: "Sofort Banking" },
    { value: "elv", label: "SEPA Direct Debit" }
  ];
};

/**
 * Check if payment method supports capture mode
 * @param {string} paymentMethod - Payment method
 * @returns {boolean} True if supports capture mode
 */
export const supportsCaptureMode = (paymentMethod) => {
  return paymentMethod === "wlt" || paymentMethod === "gpp" || paymentMethod === "apl"; // PayPal, Google Pay, and Apple Pay support capture mode
};

/**
 * Get capture mode options
 * @returns {Array} Array of capture mode options
 */
export const getCaptureModeOptions = () => {
  return [
    { value: "full", label: "Full Capture" },
    { value: "partial", label: "Partial Capture" }
  ];
};

/**
 * Validate payment parameters based on Payone v1 documentation
 * Comprehensive validation for all operations and payment methods
 * @param {string} operation - Operation type (preauthorization, authorization, capture, refund)
 * @param {string} paymentMethod - Payment method
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result with detailed error messages
 */
export const validatePaymentParams = (operation, paymentMethod, params) => {
  const errors = [];

  // Common validations for all operations
  if (!params.amount || params.amount <= 0) {
    errors.push("Amount is required and must be greater than 0");
  }

  if (!params.currency) {
    errors.push("Currency is required");
  }

  // Validate currency format (ISO 4217)
  if (params.currency && !/^[A-Z]{3}$/.test(params.currency)) {
    errors.push("Currency must be in ISO 4217 format (e.g., EUR, USD)");
  }

  // Operation specific validations (Payone v1 documentation)
  switch (operation) {
    case "preauthorization":
      if (!params.reference) {
        errors.push("Reference is required for preauthorization");
      }
      if (!params.customerid) {
        errors.push("Customer ID is required for preauthorization");
      }
      if (!params.firstname || !params.lastname) {
        errors.push("First name and last name are required for preauthorization");
      }
      if (!params.street || !params.zip || !params.city || !params.country) {
        errors.push("Address details (street, zip, city, country) are required for preauthorization");
      }
      if (!params.email) {
        errors.push("Email is required for preauthorization");
      }
      if (!params.successurl || !params.errorurl || !params.backurl) {
        errors.push("Success, error, and back URLs are required for preauthorization");
      }
      // Validate email format
      if (params.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
        errors.push("Email format is invalid");
      }
      break;

    case "authorization":
      if (!params.reference) {
        errors.push("Reference is required for authorization");
      }
      if (!params.customerid) {
        errors.push("Customer ID is required for authorization");
      }
      if (!params.firstname || !params.lastname) {
        errors.push("First name and last name are required for authorization");
      }
      if (!params.street || !params.zip || !params.city || !params.country) {
        errors.push("Address details (street, zip, city, country) are required for authorization");
      }
      if (!params.email) {
        errors.push("Email is required for authorization");
      }
      if (!params.successurl || !params.errorurl || !params.backurl) {
        errors.push("Success, error, and back URLs are required for authorization");
      }
      // Validate email format
      if (params.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
        errors.push("Email format is invalid");
      }
      break;

    case "capture":
      if (!params.txid) {
        errors.push("Transaction ID (txid) is required for capture");
      }
      if (!params.sequencenumber || params.sequencenumber < 1) {
        errors.push("Sequence number is required for capture and must be >= 1");
      }
      if (!params.reference) {
        errors.push("Reference is required for capture");
      }
      break;

    case "refund":
      if (!params.txid) {
        errors.push("Transaction ID (txid) is required for refund");
      }
      if (!params.sequencenumber || params.sequencenumber < 1) {
        errors.push("Sequence number is required for refund and must be >= 1");
      }
      if (!params.reference) {
        errors.push("Reference is required for refund");
      }
      if (params.amount > 0) {
        errors.push("Refund amount must be negative");
      }
      break;
  }

  // Payment method specific validations (Payone v1 documentation)
  switch (paymentMethod) {
    case "cc":
      if (!params.cardpan || !params.cardexpiredate || !params.cardcvc2) {
        errors.push("Card details (cardpan, cardexpiredate, cardcvc2) are required for credit card payments");
      }
      if (!params.cardtype) {
        errors.push("Card type is required for credit card payments");
      }
      // Validate card number format (basic check)
      if (params.cardpan && !/^\d{13,19}$/.test(params.cardpan.replace(/\s/g, ''))) {
        errors.push("Card number must be 13-19 digits");
      }
      // Validate expiry date format (MMYY)
      if (params.cardexpiredate && !/^\d{4}$/.test(params.cardexpiredate)) {
        errors.push("Card expiry date must be in MMYY format");
      }
      // Validate CVC format (3-4 digits)
      if (params.cardcvc2 && !/^\d{3,4}$/.test(params.cardcvc2)) {
        errors.push("CVC must be 3-4 digits");
      }
      break;

    case "wlt":
      if (!params.wallettype) {
        errors.push("Wallet type is required for PayPal payments");
      }
      if (params.wallettype && !["PPE", "PAP"].includes(params.wallettype)) {
        errors.push("Wallet type must be PPE (PayPal Express) or PAP (PayPal Plus)");
      }
      break;

    case "gpp":
      if (!params.wallettype) {
        errors.push("Wallet type is required for Google Pay payments");
      }
      if (params.wallettype && params.wallettype !== "GGP") {
        errors.push("Wallet type must be GGP for Google Pay payments");
      }
      break;

    case "apl":
      if (!params.wallettype) {
        errors.push("Wallet type is required for Apple Pay payments");
      }
      if (params.wallettype && params.wallettype !== "APL") {
        errors.push("Wallet type must be APL for Apple Pay payments");
      }
      break;

    case "sb":
      if (!params.bankcountry) {
        errors.push("Bank country is required for Sofort payments");
      }
      if (!params.onlinebanktransfertype) {
        errors.push("Online bank transfer type is required for Sofort payments");
      }
      if (params.onlinebanktransfertype && params.onlinebanktransfertype !== "PNT") {
        errors.push("Online bank transfer type must be PNT for Sofort payments");
      }
      break;

    case "elv":
      if (!params.iban || !params.bic) {
        errors.push("IBAN and BIC are required for SEPA payments");
      }
      if (!params.bankaccountholder) {
        errors.push("Bank account holder is required for SEPA payments");
      }
      if (!params.bankcountry) {
        errors.push("Bank country is required for SEPA payments");
      }
      // Basic IBAN validation
      if (params.iban && params.iban.length < 15) {
        errors.push("IBAN must be at least 15 characters");
      }
      // Basic BIC validation
      if (params.bic && params.bic.length < 8) {
        errors.push("BIC must be at least 8 characters");
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    errorCount: errors.length
  };
};
