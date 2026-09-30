import {
  PAYMENT_METHODS,
  TEST_MODE_METHODS,
  LIVE_MODE_METHODS,
  WALLET_METHODS,
  TEST_CARD,
  TEST_IBAN,
  EXAMPLE_REDIRECT_URLS,
} from "../constants/payment";
import { GOOGLE_PAY_GATEWAY } from "../constants/google-pay";

const MAX_CUSTOMER_ID_LENGTH = 17;
const ORDER_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const nextYearExpiry = () => {
  const now = new Date();
  const nextYear = (now.getFullYear() % 100) + 1;
  return `${nextYear}${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/** Returns `cardexpiredate` (YYMM) when it is a valid future month, otherwise this month next year. */
export const getValidCardExpiryDate = (cardexpiredate) => {
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

/** Test order reference in the `ORD-01234-ABCD` format. */
export const generateOrderReference = () => {
  const sequence = 1000 + Math.floor(Date.now() % 99000);
  const letters = Array.from({ length: 4 }, () => ORDER_LETTERS.charAt(Math.floor(Math.random() * ORDER_LETTERS.length)));
  return `ORD-${sequence.toString().padStart(5, "0")}-${letters.join("")}`;
};

const generateCustomerId = () => {
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${timestamp}${random}`.slice(0, MAX_CUSTOMER_ID_LENGTH);
};

const getBaseParams = (options = {}) => {
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
    successurl = EXAMPLE_REDIRECT_URLS.successurl,
    errorurl = EXAMPLE_REDIRECT_URLS.errorurl,
    backurl = EXAMPLE_REDIRECT_URLS.backurl,
  } = options;

  const finalCustomerId = customerid || generateCustomerId();

  return {
    amount: parseInt(amount),
    currency: currency.toUpperCase(),
    reference: reference || `REF-${Date.now()}`,
    customerid: finalCustomerId.length > MAX_CUSTOMER_ID_LENGTH ? finalCustomerId.slice(0, MAX_CUSTOMER_ID_LENGTH) : finalCustomerId,
    firstname,
    lastname,
    street,
    zip,
    city,
    country: country.toUpperCase(),
    email,
    salutation,
    gender,
    telephonenumber,
    ip,
    customer_is_present,
    language,
    successurl,
    errorurl,
    backurl,
  };
};

const shippingParams = (options) => ({
  shipping_firstname: options.shipping_firstname || options.firstname || "John",
  shipping_lastname: options.shipping_lastname || options.lastname || "Doe",
  shipping_street: options.shipping_street || options.street || "Test Street 123",
  shipping_zip: options.shipping_zip || options.zip || "12345",
  shipping_city: options.shipping_city || options.city || "Test City",
  shipping_country: (options.shipping_country || options.country || "DE").toUpperCase(),
});

/** Google Pay / Apple Pay: the wallet token goes to Payone as `add_paydata[…]`. */
const walletTokenParams = (token, settings, paymentmethod, paymentmethodType) => {
  if (!token) return {};

  const gatewayMerchantId = settings?.mid || settings?.portalid || "";
  return {
    "add_paydata[paymentmethod_token_data]": token,
    "add_paydata[paymentmethod]": paymentmethod,
    "add_paydata[paymentmethod_type]": paymentmethodType,
    "add_paydata[gatewayid]": GOOGLE_PAY_GATEWAY,
    ...(gatewayMerchantId ? { "add_paydata[gateway_merchantid]": gatewayMerchantId } : {}),
  };
};

const getPaymentMethodParams = (paymentMethod, options = {}) => {
  switch (paymentMethod) {
    case "cc":
      return {
        clearingtype: "cc",
        cardtype: options.cardtype || options.cardType || TEST_CARD.cardtype,
        cardpan: options.cardpan || TEST_CARD.cardpan,
        cardexpiredate: getValidCardExpiryDate(options.cardexpiredate),
        cardcvc2: options.cardcvc2 || TEST_CARD.cardcvc2,
      };
    case "wlt":
      return { clearingtype: "wlt", wallettype: "PPE", ...shippingParams(options) };
    case "gpp":
      return {
        clearingtype: "wlt",
        wallettype: "GGP",
        ...shippingParams(options),
        ...walletTokenParams(options.googlePayToken, options.settings, "GGP", "GOOGLEPAY"),
      };
    case "apl":
      return {
        clearingtype: "wlt",
        wallettype: "APL",
        ...shippingParams(options),
        ...walletTokenParams(options.applePayToken, options.settings, "APL", "APPLEPAY"),
      };
    case "sb":
      return { clearingtype: "sb", bankcountry: "DE", onlinebanktransfertype: "PNT" };
    case "elv":
      return {
        clearingtype: "elv",
        bankcountry: TEST_IBAN.bankcountry,
        iban: options.iban || TEST_IBAN.iban,
        bic: options.bic || TEST_IBAN.bic,
        bankaccountholder: options.bankaccountholder || TEST_IBAN.bankaccountholder,
      };
    default:
      return { clearingtype: "cc", ...TEST_CARD };
  }
};

/**
 * Builds a preauthorization or authorization request: base customer params, the payment method
 * params, then every remaining option passed through unchanged.
 */
export const buildPaymentParams = (request, paymentMethod, options = {}) => {
  const {
    amount, currency, reference, customerid, firstname, lastname, street, zip, city, country, email,
    salutation, gender, telephonenumber, ip, customer_is_present, language, successurl, errorurl, backurl,
    enable3DSecure, cardtype, cardpan, cardexpiredate, cardcvc2,
    ...additionalParams
  } = options;

  return {
    ...getBaseParams(options),
    ...getPaymentMethodParams(paymentMethod, options),
    ...additionalParams,
    request,
  };
};

export const buildCaptureParams = (paymentMethod, options = {}) => {
  const { txid, amount, currency = "EUR", captureMode = "full", sequencenumber = 1, reference } = options;
  return {
    request: "capture",
    txid,
    sequencenumber: parseInt(sequencenumber),
    amount: parseInt(amount),
    currency: currency.toUpperCase(),
    reference: reference || `CAPTURE-${Date.now()}`,
    ...(supportsCaptureMode(paymentMethod) ? { capturemode: captureMode } : {}),
  };
};

export const buildRefundParams = (options = {}) => {
  const { txid, amount, currency = "EUR", reference, sequencenumber = 2 } = options;
  return {
    request: "refund",
    txid,
    sequencenumber: parseInt(sequencenumber),
    amount: -Math.abs(parseInt(amount)),
    currency: currency.toUpperCase(),
    reference: reference || `REFUND-${Date.now()}`,
  };
};

export const getPaymentMethodDisplayName = (paymentMethod) => PAYMENT_METHODS[paymentMethod] || "Unknown Payment Method";

export const getPaymentMethodOptions = (isLiveMode = false) =>
  (isLiveMode ? LIVE_MODE_METHODS : TEST_MODE_METHODS).map((value) => ({ value, label: PAYMENT_METHODS[value] }));

export const supportsCaptureMode = (paymentMethod) => WALLET_METHODS.includes(paymentMethod);
