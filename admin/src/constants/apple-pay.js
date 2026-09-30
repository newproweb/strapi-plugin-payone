import { APPLE_PAY_COUNTRY_CODES, countriesByCode } from "./countries";
import { CURRENCIES } from "./currencies";

export const APPLE_PAY_SUPPORTED_COUNTRIES = countriesByCode(APPLE_PAY_COUNTRY_CODES);

export const APPLE_PAY_SUPPORTED_CURRENCIES = CURRENCIES.filter((currency) => currency.code !== "INR");

export const APPLE_PAY_SUPPORTED_NETWORKS = [
  { code: "amex", name: "American Express" },
  { code: "discover", name: "Discover" },
  { code: "masterCard", name: "Mastercard" },
  { code: "visa", name: "Visa" },
  { code: "maestro", name: "Maestro" },
  { code: "girocard", name: "Girocard" },
  { code: "cartesBancaires", name: "Cartes Bancaires" },
  { code: "chinaUnionPay", name: "China UnionPay" },
  { code: "jcb", name: "JCB" },
  { code: "interac", name: "Interac" },
  { code: "privateLabel", name: "Private Label" },
];

export const APPLE_PAY_MERCHANT_CAPABILITIES = [
  { code: "supports3DS", name: "3D Secure", description: "Required for most payment methods" },
  { code: "supportsCredit", name: "Credit Cards", description: "Support credit card payments" },
  { code: "supportsDebit", name: "Debit Cards", description: "Support debit card payments" },
];

export const APPLE_PAY_CURRENCIES_BY_COUNTRY = {
  US: ["USD"],
  GB: ["GBP", "EUR"],
  CA: ["CAD", "USD"],
  AU: ["AUD"],
  DE: ["EUR"],
  FR: ["EUR"],
  IT: ["EUR"],
  ES: ["EUR"],
  JP: ["JPY"],
  CN: ["CNY"],
  HK: ["HKD"],
  TW: ["TWD"],
  SG: ["SGD"],
  NZ: ["NZD"],
  BR: ["BRL"],
  MX: ["MXN"],
  AE: ["AED"],
  SA: ["SAR"],
  RU: ["RUB", "USD", "EUR"],
  UA: ["UAH", "USD", "EUR"],
  TR: ["TRY", "USD", "EUR"],
  ZA: ["ZAR"],
};

export const APPLE_PAY_NETWORKS_BY_COUNTRY = {
  US: ["amex", "discover", "masterCard", "visa"],
  GB: ["amex", "masterCard", "visa", "maestro"],
  DE: ["masterCard", "visa", "girocard", "maestro"],
  FR: ["masterCard", "visa", "cartesBancaires"],
  CN: ["chinaUnionPay", "visa", "masterCard"],
  JP: ["jcb", "visa", "masterCard", "amex"],
  CA: ["visa", "masterCard", "amex", "interac"],
  AU: ["visa", "masterCard", "amex"],
  default: ["visa", "masterCard", "amex"],
};

export const APPLE_PAY_BUTTON_STYLES = [
  { code: "black", name: "Black" },
  { code: "white", name: "White with outline" },
  { code: "white-outline", name: "White" },
];

export const APPLE_PAY_BUTTON_TYPES = [
  { code: "plain", name: "Plain" },
  { code: "buy", name: "Buy" },
  { code: "donate", name: "Donate" },
  { code: "check-out", name: "Check Out" },
  { code: "book", name: "Book" },
  { code: "subscribe", name: "Subscribe" },
  { code: "reload", name: "Reload" },
  { code: "add-money", name: "Add Money" },
  { code: "top-up", name: "Top Up" },
  { code: "order", name: "Order" },
  { code: "rent", name: "Rent" },
  { code: "support", name: "Support" },
  { code: "contribute", name: "Contribute" },
  { code: "tip", name: "Tip" },
  { code: "continue", name: "Continue" },
  { code: "pay", name: "Pay" },
  { code: "set-up", name: "Set Up" },
];

export const NATIVE_BUTTON_STYLES = {
  black: "black",
  white: "white",
  "white-outline": "white-outline",
};

export const NATIVE_BUTTON_TYPES = {
  pay: "plain",
  buy: "buy",
  donate: "donate",
  "check-out": "check-out",
  book: "book",
  subscribe: "subscribe",
};

export const DEFAULT_APPLE_PAY_CONFIG = {
  countryCode: "DE",
  currencyCode: "EUR",
  merchantCapabilities: ["supports3DS"],
  supportedNetworks: ["visa", "masterCard", "girocard"],
  buttonStyle: "black",
  buttonType: "pay",
  requestPayerName: false,
  requestBillingAddress: false,
  requestPayerEmail: false,
  requestPayerPhone: false,
  requestShipping: false,
  shippingType: "shipping",
};

export const APPLE_PAY_DOCS_URL = "https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev";
export const APPLE_PAY_DOMAIN_FILE_PATH = "public/.well-known/apple-developer-merchantid-domain-association";
