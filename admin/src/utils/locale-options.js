import {
  COUNTRIES,
  COUNTRY_LANGUAGE_MAP,
  COUNTRY_CURRENCY_MAP,
  SALUTATION_OPTIONS,
  GENDER_OPTIONS,
  APPLE_PAY_COUNTRY_CODES,
  GOOGLE_PAY_COUNTRY_CODES,
} from "../constants/countries";
import { CURRENCIES } from "../constants/currencies";

const COUNTRY_CODES_BY_METHOD = {
  apl: APPLE_PAY_COUNTRY_CODES,
  gpp: GOOGLE_PAY_COUNTRY_CODES,
};

export const getLanguageForCountry = (countryCode) => COUNTRY_LANGUAGE_MAP[countryCode] || "en";

export const getCurrencyForCountry = (countryCode) => COUNTRY_CURRENCY_MAP[countryCode] || "EUR";

export const getSalutationOptions = (countryCode) =>
  SALUTATION_OPTIONS[getLanguageForCountry(countryCode)] || SALUTATION_OPTIONS.default;

export const getGenderOptions = (countryCode) =>
  GENDER_OPTIONS[getLanguageForCountry(countryCode)] || GENDER_OPTIONS.default;

export const toCurrencyOption = (currency) => ({
  value: currency.code,
  label: `${currency.name} (${currency.code}) ${currency.symbol}`,
});

export const toCountryOption = (country) => ({
  value: country.code,
  label: `${country.name} (${country.code})`,
});

export const getCurrencyOptions = () => CURRENCIES.map(toCurrencyOption);

/** Every country, with the ones a wallet does not support disabled. */
export const getCountryOptions = (paymentMethod) => {
  const supportedCodes = COUNTRY_CODES_BY_METHOD[paymentMethod];
  return COUNTRIES.map((country) => ({
    ...toCountryOption(country),
    disabled: !!supportedCodes && !supportedCodes.includes(country.code),
  }));
};
