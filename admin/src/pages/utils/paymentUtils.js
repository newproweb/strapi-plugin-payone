/**
 * Payment Utils - Universal functions for different payment methods and operations
 * Based on Payone v1 API Documentation
 * 
 * This file contains all necessary parameters and validations for:
 * - Preauthorization
 * - Authorization  
 * - Capture
 * - Refund
 * 
 * Supported Payment Methods:
 * - Credit Card (cc)
 * - PayPal (wlt)
 * - Sofort Banking (sb)
 * - SEPA Direct Debit (elv)
 */

/**
 * Get base parameters for all payment methods
 * Based on Payone v1 API Documentation
 * @param {Object} options - Base options
 * @returns {Object} Base parameters with all required fields
 */
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

  // Generate unique customer ID if not provided
  const finalCustomerId = customerid || `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

/**
 * Get payment method specific parameters
 * Based on Payone v1 API Documentation
 * @param {string} paymentMethod - Payment method (cc, wlt, sb, elv)
 * @param {Object} options - Additional options
 * @returns {Object} Payment method specific parameters
 */
export const getPaymentMethodParams = (paymentMethod, options = {}) => {
  const {
    cardType = "V",
    captureMode = "full",
    cardpan,
    cardexpiredate,
    cardcvc2,
    iban,
    bic,
    bankaccountholder
  } = options;

  switch (paymentMethod) {
    case "cc": // Credit Card (Visa, Mastercard, Amex)
      return {
        clearingtype: "cc",
        cardtype: cardType, // V = Visa, M = Mastercard, A = Amex
        cardpan: cardpan || "4111111111111111", // Test Visa card
        cardexpiredate: cardexpiredate || "2512", // MMYY format
        cardcvc2: cardcvc2 || "123" // 3-digit security code
      };

    case "wlt": // PayPal
      return {
        clearingtype: "wlt",
        wallettype: "PPE", // PayPal Express
        shipping_firstname: "John",
        shipping_lastname: "Doe",
        shipping_street: "Test Street 123",
        shipping_zip: "12345",
        shipping_city: "Test City",
        shipping_country: "DE"
      };

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

/**
 * Get preauthorization parameters for specific payment method
 * Based on Payone v1 API Documentation
 * @param {string} paymentMethod - Payment method
 * @param {Object} options - Options including amount, reference, etc.
 * @returns {Object} Complete preauthorization parameters
 */
export const getPreauthorizationParams = (paymentMethod, options = {}) => {
  const baseParams = getBaseParams(options);
  const methodParams = getPaymentMethodParams(paymentMethod, options);

  return {
    ...baseParams,
    ...methodParams,
    request: "preauthorization" // Required for Payone API
  };
};

/**
 * Get authorization parameters for specific payment method
 * Based on Payone v1 API Documentation
 * @param {string} paymentMethod - Payment method
 * @param {Object} options - Options including amount, reference, etc.
 * @returns {Object} Complete authorization parameters
 */
export const getAuthorizationParams = (paymentMethod, options = {}) => {
  const baseParams = getBaseParams(options);
  const methodParams = getPaymentMethodParams(paymentMethod, options);

  return {
    ...baseParams,
    ...methodParams,
    request: "authorization" // Required for Payone API
  };
};

/**
 * Get capture parameters for specific payment method
 * Based on Payone v1 API Documentation
 * @param {string} paymentMethod - Payment method
 * @param {Object} options - Options including txid, amount, captureMode, etc.
 * @returns {Object} Complete capture parameters
 */
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

/**
 * Get refund parameters for specific payment method
 * Based on Payone v1 API Documentation
 * @param {string} paymentMethod - Payment method
 * @param {Object} options - Options including txid, amount, sequencenumber, etc.
 * @returns {Object} Complete refund parameters
 */
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
      // PayPal specific refund parameters (if needed)
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

/**
 * Get payment method display name
 * @param {string} paymentMethod - Payment method code
 * @returns {string} Display name
 */
export const getPaymentMethodDisplayName = (paymentMethod) => {
  const displayNames = {
    cc: "Credit Card (Visa, Mastercard)",
    wlt: "PayPal",
    sb: "Sofort Banking",
    elv: "SEPA Direct Debit"
  };

  return displayNames[paymentMethod] || "Unknown Payment Method";
};

/**
 * Get payment method options for dropdown
 * @returns {Array} Array of payment method options
 */
export const getPaymentMethodOptions = () => {
  return [
    { value: "cc", label: "Credit Card (Visa, Mastercard)" },
    { value: "wlt", label: "PayPal" },
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
  return paymentMethod === "wlt"; // Only PayPal supports capture mode
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
