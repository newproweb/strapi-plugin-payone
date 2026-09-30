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

export const COUNTRY_LANGUAGE_MAP = {
  US: "en", GB: "en", CA: "en", AU: "en", NZ: "en", IE: "en",
  DE: "de", AT: "de", CH: "de",
  FR: "fr", BE: "fr",
  IT: "it", ES: "es", PT: "pt", NL: "nl", PL: "pl", CZ: "cs", HU: "hu",
  SE: "sv", NO: "no", DK: "da", FI: "fi", GR: "el",
  JP: "ja", CN: "zh", HK: "zh", TW: "zh", SG: "en",
  BR: "pt", MX: "es", AE: "ar", SA: "ar", RU: "ru", UA: "uk", TR: "tr", ZA: "en", IN: "en",
};

export const COUNTRY_CURRENCY_MAP = {
  US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", NZ: "NZD",
  IE: "EUR", DE: "EUR", AT: "EUR", CH: "CHF", FR: "EUR", BE: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
  PL: "PLN", CZ: "CZK", HU: "HUF", PT: "EUR", GR: "EUR",
  SE: "SEK", NO: "NOK", DK: "DKK", FI: "EUR",
  JP: "JPY", CN: "CNY", HK: "HKD", TW: "TWD", SG: "SGD",
  BR: "BRL", MX: "MXN", AE: "AED", SA: "SAR", RU: "RUB", UA: "UAH", TR: "TRY", ZA: "ZAR", IN: "INR",
};

const option = (value, label = value) => ({ value, label });

export const SALUTATION_OPTIONS = {
  en: [option("Mr"), option("Mrs"), option("Ms"), option("Dr")],
  de: [option("Herr"), option("Frau"), option("Dr")],
  fr: [option("Monsieur"), option("Madame"), option("Mademoiselle")],
  it: [option("Signore"), option("Signora"), option("Signorina")],
  es: [option("Señor"), option("Señora"), option("Señorita")],
  nl: [option("Dhr"), option("Mevr")],
  pt: [option("Senhor"), option("Senhora")],
  default: [option("Mr"), option("Mrs"), option("Ms")],
};

const genderOptions = (male, female) => [option("m", male), option("f", female)];

export const GENDER_OPTIONS = {
  en: genderOptions("Male", "Female"),
  de: genderOptions("Männlich", "Weiblich"),
  fr: genderOptions("Masculin", "Féminin"),
  it: genderOptions("Maschio", "Femmina"),
  es: genderOptions("Masculino", "Femenino"),
  nl: genderOptions("Man", "Vrouw"),
  pt: genderOptions("Masculino", "Feminino"),
  default: genderOptions("Male", "Female"),
};

export const APPLE_PAY_COUNTRY_CODES = COUNTRIES.map((country) => country.code).filter((code) => code !== "IN");

export const GOOGLE_PAY_COUNTRY_CODES = [
  "US", "GB", "CA", "AU", "DE", "FR", "IT", "ES", "NL", "BE", "CH", "AT", "IE",
  "SE", "NO", "DK", "FI", "PL", "BR", "MX", "JP", "SG", "NZ", "IN",
];

export const countriesByCode = (codes) => codes.map((code) => COUNTRIES.find((country) => country.code === code));
