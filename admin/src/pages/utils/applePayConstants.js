/**
 * Apple Pay Constants
 * Based on Apple Pay documentation and Payone requirements
 * https://developer.apple.com/documentation/applepayontheweb
 * https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev
 */

// Apple Pay supported countries
// Note: Apple Pay availability varies by country
export const APPLE_PAY_SUPPORTED_COUNTRIES = [
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
  { code: "CZ", name: "Czech Republic" },
  { code: "HU", name: "Hungary" },
  { code: "PT", name: "Portugal" },
  { code: "GR", name: "Greece" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "TW", name: "Taiwan" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "RU", name: "Russia" },
  { code: "UA", name: "Ukraine" },
  { code: "TR", name: "Turkey" },
  { code: "ZA", name: "South Africa" }
];

// Apple Pay supported currencies
// Note: Some currencies may be restricted in certain countries
export const APPLE_PAY_SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" }
];

// Apple Pay supported payment networks
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
  { code: "privateLabel", name: "Private Label" }
];

// Merchant capabilities
export const APPLE_PAY_MERCHANT_CAPABILITIES = [
  { code: "supports3DS", name: "3D Secure", description: "Required for most payment methods" },
  { code: "supportsCredit", name: "Credit Cards", description: "Support credit card payments" },
  { code: "supportsDebit", name: "Debit Cards", description: "Support debit card payments" }
];

// Country-currency restrictions
// Some currencies are not available in certain countries
export const COUNTRY_CURRENCY_RESTRICTIONS = {
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
  ZA: ["ZAR"]
};

// Get supported currencies for a country
export const getSupportedCurrenciesForCountry = (countryCode) => {
  const restrictions = COUNTRY_CURRENCY_RESTRICTIONS[countryCode];
  if (restrictions) {
    return APPLE_PAY_SUPPORTED_CURRENCIES.filter(currency => 
      restrictions.includes(currency.code)
    );
  }
  // Default: return all currencies if no restrictions
  return APPLE_PAY_SUPPORTED_CURRENCIES;
};

// Get supported networks for a country
// Some networks are country-specific
export const getSupportedNetworksForCountry = (countryCode) => {
  const countryNetworks = {
    US: ["amex", "discover", "masterCard", "visa"],
    GB: ["amex", "masterCard", "visa", "maestro"],
    DE: ["masterCard", "visa", "girocard", "maestro"],
    FR: ["masterCard", "visa", "cartesBancaires"],
    CN: ["chinaUnionPay", "visa", "masterCard"],
    JP: ["jcb", "visa", "masterCard", "amex"],
    CA: ["visa", "masterCard", "amex", "interac"],
    AU: ["visa", "masterCard", "amex"],
    // Default networks for other countries
    default: ["visa", "masterCard", "amex"]
  };

  return countryNetworks[countryCode] || countryNetworks.default;
};

// Test data for Apple Pay
// Based on Apple Pay sandbox testing documentation
export const APPLE_PAY_TEST_DATA = {
  // Test card numbers (for sandbox testing)
  testCards: {
    visa: "4111111111111111",
    mastercard: "5555555555554444",
    amex: "378282246310005",
    discover: "6011111111111117"
  },
  // Test merchant identifiers (for development)
  testMerchantIdentifier: "merchant.com.payone.test",
  // Test domain
  testDomain: "test.payone.com"
};

// Apple Pay button styles
export const APPLE_PAY_BUTTON_STYLES = [
  { code: "black", name: "Black" },
  { code: "white", name: "White with outline" },
  { code: "white-outline", name: "White" }
];

// Apple Pay button types
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
  { code: "set-up", name: "Set Up" }
];

// Default Apple Pay configuration
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
  shippingType: "shipping"
};




