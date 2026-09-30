import {
  APPLE_PAY_SUPPORTED_CURRENCIES,
  APPLE_PAY_CURRENCIES_BY_COUNTRY,
  APPLE_PAY_NETWORKS_BY_COUNTRY,
} from "../constants/apple-pay";

export const getSupportedCurrenciesForCountry = (countryCode) => {
  const allowed = APPLE_PAY_CURRENCIES_BY_COUNTRY[countryCode];
  if (!allowed) return APPLE_PAY_SUPPORTED_CURRENCIES;
  return APPLE_PAY_SUPPORTED_CURRENCIES.filter((currency) => allowed.includes(currency.code));
};

export const getSupportedNetworksForCountry = (countryCode) =>
  APPLE_PAY_NETWORKS_BY_COUNTRY[countryCode] || APPLE_PAY_NETWORKS_BY_COUNTRY.default;
