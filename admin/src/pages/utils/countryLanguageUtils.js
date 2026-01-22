export const COUNTRY_LANGUAGE_MAP = {
  US: "en",
  GB: "en",
  CA: "en",
  AU: "en",
  NZ: "en",
  IE: "en",
  DE: "de",
  AT: "de",
  CH: "de",
  FR: "fr",
  BE: "fr",
  IT: "it",
  ES: "es",
  PT: "pt",
  NL: "nl",
  PL: "pl",
  CZ: "cs",
  HU: "hu",
  SE: "sv",
  NO: "no",
  DK: "da",
  FI: "fi",
  GR: "el",
  JP: "ja",
  CN: "zh",
  HK: "zh",
  TW: "zh",
  SG: "en",
  BR: "pt",
  MX: "es",
  AE: "ar",
  SA: "ar",
  RU: "ru",
  UA: "uk",
  TR: "tr",
  ZA: "en",
  IN: "en",
};

export const COUNTRIES = [
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
  { code: "ZA", name: "South Africa" },
  { code: "IN", name: "India" },
];

export const getLanguageForCountry = (countryCode) => {
  return COUNTRY_LANGUAGE_MAP[countryCode] || "en";
};

export const SALUTATION_OPTIONS = {
  en: [
    { value: "Mr", label: "Mr" },
    { value: "Mrs", label: "Mrs" },
    { value: "Ms", label: "Ms" },
    { value: "Dr", label: "Dr" },
  ],
  de: [
    { value: "Herr", label: "Herr" },
    { value: "Frau", label: "Frau" },
    { value: "Dr", label: "Dr" },
  ],
  fr: [
    { value: "Monsieur", label: "Monsieur" },
    { value: "Madame", label: "Madame" },
    { value: "Mademoiselle", label: "Mademoiselle" },
  ],
  it: [
    { value: "Signore", label: "Signore" },
    { value: "Signora", label: "Signora" },
    { value: "Signorina", label: "Signorina" },
  ],
  es: [
    { value: "Señor", label: "Señor" },
    { value: "Señora", label: "Señora" },
    { value: "Señorita", label: "Señorita" },
  ],
  nl: [
    { value: "Dhr", label: "Dhr" },
    { value: "Mevr", label: "Mevr" },
  ],
  pt: [
    { value: "Senhor", label: "Senhor" },
    { value: "Senhora", label: "Senhora" },
  ],
  default: [
    { value: "Mr", label: "Mr" },
    { value: "Mrs", label: "Mrs" },
    { value: "Ms", label: "Ms" },
  ],
};

export const GENDER_OPTIONS = {
  en: [
    { value: "m", label: "Male" },
    { value: "f", label: "Female" },
  ],
  de: [
    { value: "m", label: "Männlich" },
    { value: "f", label: "Weiblich" },
  ],
  fr: [
    { value: "m", label: "Masculin" },
    { value: "f", label: "Féminin" },
  ],
  it: [
    { value: "m", label: "Maschio" },
    { value: "f", label: "Femmina" },
  ],
  es: [
    { value: "m", label: "Masculino" },
    { value: "f", label: "Femenino" },
  ],
  nl: [
    { value: "m", label: "Man" },
    { value: "f", label: "Vrouw" },
  ],
  pt: [
    { value: "m", label: "Masculino" },
    { value: "f", label: "Feminino" },
  ],
  default: [
    { value: "m", label: "Male" },
    { value: "f", label: "Female" },
  ],
};

export const getSalutationOptions = (countryCode) => {
  const language = getLanguageForCountry(countryCode);
  return SALUTATION_OPTIONS[language] || SALUTATION_OPTIONS.default;
};

export const getGenderOptions = (countryCode) => {
  const language = getLanguageForCountry(countryCode);
  return GENDER_OPTIONS[language] || GENDER_OPTIONS.default;
};

export const CURRENCIES = [
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
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
];

export const getCurrencyOptions = () => {
  return CURRENCIES.map((c) => ({
    value: c.code,
    label: `${c.name} (${c.code}) ${c.symbol}`,
  }));
};

export const getCountryOptions = (paymentMethod) => {
  let supportedCountryCodes = [];

  if (paymentMethod === "apl") {
    supportedCountryCodes = [
      "US", "GB", "CA", "AU", "DE", "FR", "IT", "ES", "NL", "BE", "CH", "AT", "IE",
      "SE", "NO", "DK", "FI", "PL", "CZ", "HU", "PT", "GR", "JP", "CN", "HK", "TW",
      "SG", "NZ", "BR", "MX", "AE", "SA", "RU", "UA", "TR", "ZA"
    ];
  } else if (paymentMethod === "gpp") {
    supportedCountryCodes = [
      "US", "GB", "CA", "AU", "DE", "FR", "IT", "ES", "NL", "BE", "CH", "AT", "IE",
      "SE", "NO", "DK", "FI", "PL", "BR", "MX", "JP", "SG", "NZ", "IN"
    ];
  }

  const hasRestriction = supportedCountryCodes.length > 0;

  return COUNTRIES.map((country) => {
    const isSupported = !hasRestriction || supportedCountryCodes.includes(country.code);
    return {
      value: country.code,
      label: `${country.name} (${country.code})`,
      disabled: hasRestriction && !isSupported,
    };
  });
};

