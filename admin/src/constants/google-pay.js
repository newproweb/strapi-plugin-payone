import { GOOGLE_PAY_COUNTRY_CODES, countriesByCode } from "./countries";
import { currenciesByCode } from "./currencies";

export const GOOGLE_PAY_SUPPORTED_COUNTRIES = countriesByCode(GOOGLE_PAY_COUNTRY_CODES);

export const GOOGLE_PAY_SUPPORTED_CURRENCIES = currenciesByCode(
  ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK", "PLN", "BRL", "MXN", "SGD", "NZD", "INR"],
  { MXN: "$" }
);

export const GOOGLE_PAY_SUPPORTED_NETWORKS = [
  { code: "MASTERCARD", name: "Mastercard" },
  { code: "VISA", name: "Visa" },
  { code: "AMEX", name: "American Express" },
  { code: "DISCOVER", name: "Discover" },
  { code: "JCB", name: "JCB" },
];

export const GOOGLE_PAY_AUTH_METHODS = [
  { code: "PAN_ONLY", name: "PAN Only", description: "Basic card authentication" },
  { code: "CRYPTOGRAM_3DS", name: "3D Secure", description: "3D Secure authentication" },
];

export const DEFAULT_GOOGLE_PAY_CONFIG = {
  countryCode: "US",
  currencyCode: "USD",
  allowedCardNetworks: ["MASTERCARD", "VISA"],
  allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
  merchantName: "Your Store Name",
};

export const GOOGLE_PAY_SCRIPT_URL = "https://pay.google.com/gp/p/js/pay.js";
export const GOOGLE_PAY_GATEWAY = "payonegmbh";
export const GOOGLE_PAY_BUTTON_NETWORKS = ["MASTERCARD", "VISA"];
export const GOOGLE_PAY_BUTTON_AUTH_METHODS = ["PAN_ONLY", "CRYPTOGRAM_3DS"];
