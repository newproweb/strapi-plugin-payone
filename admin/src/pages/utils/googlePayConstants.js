/**
 * Google Pay Constants
 * Based on Google Pay documentation and Payone requirements
 * https://developers.google.com/pay/api/web/overview
 * https://docs.payone.com/display/public/PLATFORM/Google+Pay
 */

// Google Pay supported card networks
export const GOOGLE_PAY_SUPPORTED_NETWORKS = [
  { code: "MASTERCARD", name: "Mastercard" },
  { code: "VISA", name: "Visa" },
  { code: "AMEX", name: "American Express" },
  { code: "DISCOVER", name: "Discover" },
  { code: "JCB", name: "JCB" }
];

// Google Pay supported authentication methods
export const GOOGLE_PAY_AUTH_METHODS = [
  { code: "PAN_ONLY", name: "PAN Only", description: "Basic card authentication" },
  { code: "CRYPTOGRAM_3DS", name: "3D Secure", description: "3D Secure authentication" }
];

// Google Pay supported countries
export const GOOGLE_PAY_SUPPORTED_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "IE", name: "Ireland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
  { code: "IN", name: "India" }
];

// Google Pay supported currencies
export const GOOGLE_PAY_SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" }
];

// Default Google Pay configuration
export const DEFAULT_GOOGLE_PAY_CONFIG = {
  countryCode: "US",
  currencyCode: "USD",
  allowedCardNetworks: ["MASTERCARD", "VISA"],
  allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
  merchantName: "Your Store Name"
};

