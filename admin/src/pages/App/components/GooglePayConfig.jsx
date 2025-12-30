import React from "react";
import { Box, Flex, Typography, Select, Option, Checkbox, Stack } from "@strapi/design-system";
import {
  GOOGLE_PAY_SUPPORTED_COUNTRIES,
  GOOGLE_PAY_SUPPORTED_CURRENCIES,
  GOOGLE_PAY_SUPPORTED_NETWORKS,
  GOOGLE_PAY_AUTH_METHODS,
  DEFAULT_GOOGLE_PAY_CONFIG
} from "../../utils/googlePayConstants";

const GooglePayConfig = ({
  config,
  onConfigChange,
  settings
}) => {
  const {
    countryCode = DEFAULT_GOOGLE_PAY_CONFIG.countryCode,
    currencyCode = DEFAULT_GOOGLE_PAY_CONFIG.currencyCode,
    allowedCardNetworks = DEFAULT_GOOGLE_PAY_CONFIG.allowedCardNetworks,
    allowedAuthMethods = DEFAULT_GOOGLE_PAY_CONFIG.allowedAuthMethods,
    merchantName = DEFAULT_GOOGLE_PAY_CONFIG.merchantName
  } = config || {};

  const handleCountryChange = (value) => {
    onConfigChange({
      ...config,
      countryCode: value
    });
  };

  const handleCurrencyChange = (value) => {
    onConfigChange({
      ...config,
      currencyCode: value
    });
  };

  const handleNetworkToggle = (networkCode) => {
    const currentNetworks = allowedCardNetworks || [];
    const newNetworks = currentNetworks.includes(networkCode)
      ? currentNetworks.filter(n => n !== networkCode)
      : [...currentNetworks, networkCode];

    onConfigChange({
      ...config,
      allowedCardNetworks: newNetworks
    });
  };

  const handleAuthMethodToggle = (authMethodCode) => {
    const currentMethods = allowedAuthMethods || [];
    const newMethods = currentMethods.includes(authMethodCode)
      ? currentMethods.filter(m => m !== authMethodCode)
      : [...currentMethods, authMethodCode];

    onConfigChange({
      ...config,
      allowedAuthMethods: newMethods
    });
  };

  return (
    <Box>
      <Stack spacing={6}>
        <Box>
          <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: "6px" }}>
            Google Pay Configuration
          </Typography>
          <Typography variant="pi" textColor="neutral600">
            Configure Google Pay settings for your payment gateway
          </Typography>
        </Box>

        {/* Country and Currency */}
        <Flex gap={4} wrap="wrap">
          <Box style={{ flex: 1, minWidth: "300px" }}>
            <Select
              label="Country Code"
              name="countryCode"
              value={countryCode}
              onChange={handleCountryChange}
              hint="Select the country where your business operates"
              required
            >
              {GOOGLE_PAY_SUPPORTED_COUNTRIES.map(country => (
                <Option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </Option>
              ))}
            </Select>
          </Box>

          <Box style={{ flex: 1, minWidth: "300px" }}>
            <Select
              label="Currency Code"
              name="currencyCode"
              value={currencyCode}
              onChange={handleCurrencyChange}
              hint="Select the currency for transactions"
              required
            >
              {GOOGLE_PAY_SUPPORTED_CURRENCIES.map(currency => (
                <Option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code}) {currency.symbol}
                </Option>
              ))}
            </Select>
          </Box>
        </Flex>

        {/* Merchant Name */}
        <Box>
          <Typography variant="pi" fontWeight="semiBold" style={{ marginLeft: "2px" }}>
            Merchant Name
          </Typography>
          <Typography variant="pi" textColor="neutral600" style={{ marginLeft: "2px" }}>
            The name of your business as it will appear in Google Pay
          </Typography>
          <input
            type="text"
            value={merchantName}
            onChange={(e) => onConfigChange({ ...config, merchantName: e.target.value })}
            style={{
              width: "100%",
              padding: "8px 12px",
              marginTop: "8px",
              border: "1px solid #dcdce4",
              borderRadius: "4px",
              fontSize: "14px"
            }}
            placeholder="Your Store Name"
          />
        </Box>

        {/* Allowed Card Networks */}
        <Box>
          <Typography variant="pi" fontWeight="semiBold" style={{ marginLeft: "2px" }}>
            Allowed Card Networks
          </Typography>
          <Typography variant="pi" textColor="neutral600" style={{ marginLeft: "2px" }}>
            Select payment card networks to accept
          </Typography>
          <Flex wrap="wrap" gap={4} style={{ marginTop: "12px" }}>
            {GOOGLE_PAY_SUPPORTED_NETWORKS.map(network => {
              const isSelected = allowedCardNetworks?.includes(network.code);

              return (
                <Box key={network.code} style={{ flex: "0 0 calc(50% - 8px)", minWidth: "250px" }}>
                  <Checkbox
                    name={`network-${network.code}`}
                    checked={isSelected}
                    onChange={() => handleNetworkToggle(network.code)}
                  >
                    {network.name} ({network.code})
                  </Checkbox>
                </Box>
              );
            })}
          </Flex>
          {allowedCardNetworks?.length === 0 && (
            <Typography variant="pi" textColor="danger600" style={{ marginTop: "8px" }}>
              At least one card network must be selected
            </Typography>
          )}
        </Box>

        {/* Allowed Authentication Methods */}
        <Box>
          <Typography variant="pi" fontWeight="semiBold" style={{ marginLeft: "2px" }}>
            Allowed Authentication Methods
          </Typography>
          <Typography variant="pi" textColor="neutral600" style={{ marginLeft: "2px" }}>
            Select authentication methods for card payments
          </Typography>
          <Flex wrap="wrap" gap={4} style={{ marginTop: "12px" }}>
            {GOOGLE_PAY_AUTH_METHODS.map(method => {
              const isSelected = allowedAuthMethods?.includes(method.code);

              return (
                <Box key={method.code} style={{ flex: "0 0 calc(50% - 8px)", minWidth: "250px" }}>
                  <Checkbox
                    name={`auth-method-${method.code}`}
                    checked={isSelected}
                    onChange={() => handleAuthMethodToggle(method.code)}
                  >
                    {method.name} - {method.description}
                  </Checkbox>
                </Box>
              );
            })}
          </Flex>
          {allowedAuthMethods?.length === 0 && (
            <Typography variant="pi" textColor="danger600" style={{ marginTop: "8px" }}>
              At least one authentication method must be selected
            </Typography>
          )}
        </Box>

        {/* Gateway Merchant ID Info */}
        <Box>
          <Typography variant="pi" fontWeight="semiBold" style={{ marginLeft: "2px" }}>
            Gateway Merchant ID
          </Typography>
          <Typography variant="pi" textColor="neutral600">
            {settings?.mid || settings?.portalid
              ? `Using: ${settings.mid || settings.portalid}`
              : "Gateway merchant ID will be obtained from your Payone Merchant ID (MID) or Portal ID. Make sure these are configured in the main Configuration tab."
            }
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default GooglePayConfig;

