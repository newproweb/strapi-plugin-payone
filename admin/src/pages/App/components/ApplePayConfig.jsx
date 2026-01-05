import React from "react";
import { Box, Flex, Typography, Select, Option, Checkbox, Stack } from "@strapi/design-system";
import {
  APPLE_PAY_SUPPORTED_COUNTRIES,
  APPLE_PAY_SUPPORTED_NETWORKS,
  APPLE_PAY_MERCHANT_CAPABILITIES,
  getSupportedCurrenciesForCountry,
  getSupportedNetworksForCountry,
  APPLE_PAY_BUTTON_STYLES,
  APPLE_PAY_BUTTON_TYPES,
  DEFAULT_APPLE_PAY_CONFIG
} from "../../utils/applePayConstants";

const ApplePayConfig = ({
  config,
  onConfigChange,
  settings
}) => {
  const {
    countryCode = DEFAULT_APPLE_PAY_CONFIG.countryCode,
    currencyCode = DEFAULT_APPLE_PAY_CONFIG.currencyCode,
    merchantCapabilities = DEFAULT_APPLE_PAY_CONFIG.merchantCapabilities,
    supportedNetworks = DEFAULT_APPLE_PAY_CONFIG.supportedNetworks,
    buttonStyle = DEFAULT_APPLE_PAY_CONFIG.buttonStyle,
    buttonType = DEFAULT_APPLE_PAY_CONFIG.buttonType,
  } = config || {};

  const supportedCurrencies = getSupportedCurrenciesForCountry(countryCode);
  const supportedNetworksForCountry = getSupportedNetworksForCountry(countryCode);

  const handleCountryChange = (value) => {
    const newConfig = {
      ...config,
      countryCode: value
    };

    const newSupportedCurrencies = getSupportedCurrenciesForCountry(value);
    if (!newSupportedCurrencies.find(c => c.code === currencyCode)) {
      newConfig.currencyCode = newSupportedCurrencies[0]?.code || "USD";
    }

    newConfig.supportedNetworks = getSupportedNetworksForCountry(value);

    onConfigChange(newConfig);
  };

  const handleCurrencyChange = (value) => {
    onConfigChange({
      ...config,
      currencyCode: value
    });
  };

  const handleNetworkToggle = (networkCode) => {
    const currentNetworks = supportedNetworks || [];
    const newNetworks = currentNetworks.includes(networkCode)
      ? currentNetworks.filter(n => n !== networkCode)
      : [...currentNetworks, networkCode];

    onConfigChange({
      ...config,
      supportedNetworks: newNetworks
    });
  };

  const handleCapabilityToggle = (capabilityCode) => {
    const currentCapabilities = merchantCapabilities || [];
    const newCapabilities = currentCapabilities.includes(capabilityCode)
      ? currentCapabilities.filter(c => c !== capabilityCode)
      : [...currentCapabilities, capabilityCode];

    onConfigChange({
      ...config,
      merchantCapabilities: newCapabilities
    });
  };

  return (
    <Box>
      <Stack spacing={6}>
        <Box>
          <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: "6px" }}>
            Apple Pay Configuration
          </Typography>
          <Typography variant="pi" textColor="neutral600">
            Configure Apple Pay settings for your payment gateway
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
              {APPLE_PAY_SUPPORTED_COUNTRIES.map(country => (
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
              hint={`Supported currencies for ${countryCode}`}
              required
            >
              {supportedCurrencies.map(currency => (
                <Option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code}) {currency.symbol}
                </Option>
              ))}
            </Select>
            {supportedCurrencies.length === 0 && (
              <Typography variant="pi" textColor="danger600" style={{ marginTop: "4px" }}>
                No supported currencies for this country. Please select a different country.
              </Typography>
            )}
          </Box>
        </Flex>

        {/* Button Style and Type */}
        <Flex gap={4} wrap="wrap">
          <Box style={{ flex: 1, minWidth: "300px" }}>
            <Select
              label="Button Style"
              name="buttonStyle"
              value={buttonStyle}
              onChange={(value) => onConfigChange({ ...config, buttonStyle: value })}
              hint="Visual style of the Apple Pay button"
            >
              {APPLE_PAY_BUTTON_STYLES.map(style => (
                <Option key={style.code} value={style.code}>
                  {style.name}
                </Option>
              ))}
            </Select>
          </Box>

          <Box style={{ flex: 1, minWidth: "300px" }}>
            <Select
              label="Button Type"
              name="buttonType"
              value={buttonType}
              onChange={(value) => onConfigChange({ ...config, buttonType: value })}
              hint="Type of action the button represents"
            >
              {APPLE_PAY_BUTTON_TYPES.map(type => (
                <Option key={type.code} value={type.code}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Box>
        </Flex>

        {/* Supported Networks */}
        <Box>
          <Typography variant="pi" fontWeight="semiBold" style={{ marginLeft: "2px" }}>
            Supported Networks
          </Typography>
          <Typography variant="pi" textColor="neutral600" style={{ marginLeft: "2px" }}>
            Select payment networks supported in {countryCode}
          </Typography>
          <Flex wrap="wrap" gap={4} style={{ marginTop: "12px" }}>
            {APPLE_PAY_SUPPORTED_NETWORKS.map(network => {
              const isSupported = supportedNetworksForCountry.includes(network.code);
              const isSelected = supportedNetworks?.includes(network.code);

              return (
                <Box key={network.code} style={{ flex: "0 0 calc(50% - 8px)", minWidth: "250px" }}>
                  <Checkbox
                    name={`network-${network.code}`}
                    checked={isSelected}
                    onChange={() => handleNetworkToggle(network.code)}
                    disabled={!isSupported}
                    hint={!isSupported ? `Not supported in ${countryCode}` : undefined}
                  >
                    {network.name} ({network.code})
                    {!isSupported && (
                      <Typography variant="sigma" textColor="neutral500" style={{ marginLeft: "8px" }}>
                        (Not available)
                      </Typography>
                    )}
                  </Checkbox>
                </Box>
              );
            })}
          </Flex>
          {supportedNetworks?.length === 0 && (
            <Typography variant="pi" textColor="danger600" style={{ marginTop: "8px" }}>
              At least one network must be selected
            </Typography>
          )}
        </Box>

        {/* Merchant Capabilities */}
        <Box>
          <Typography variant="pi" fontWeight="semiBold" style={{ marginLeft: "2px" }}>
            Merchant Capabilities
          </Typography>
          <Typography variant="pi" textColor="neutral600" style={{ marginLeft: "2px" }}>
            Select payment capabilities. "3D Secure" is required for most payment methods.
          </Typography>
          <Flex wrap="wrap" gap={4} style={{ marginTop: "12px" }}>
            {APPLE_PAY_MERCHANT_CAPABILITIES.map(capability => {
              const isSelected = merchantCapabilities?.includes(capability.code);

              return (
                <Box key={capability.code} style={{ flex: "0 0 calc(50% - 8px)", minWidth: "250px" }}>
                  <Checkbox
                    name={`capability-${capability.code}`}
                    checked={isSelected}
                    onChange={() => handleCapabilityToggle(capability.code)}
                  >
                    {capability.name} - {capability.description}
                  </Checkbox>
                </Box>
              );
            })}
          </Flex>
          {merchantCapabilities?.length === 0 && (
            <Typography variant="pi" textColor="danger600" style={{ marginTop: "8px" }}>
              At least one capability must be selected. "supports3DS" is recommended.
            </Typography>
          )}
        </Box>


        {/* Merchant Identifier Info */}
        <Box>
          <Typography variant="pi" fontWeight="semiBold" style={{ marginLeft: "2px" }}>
            Merchant Identifier
          </Typography>
          <Typography variant="pi" textColor="neutral600">
            {settings?.mid || settings?.portalid
              ? `Using: ${settings.mid || settings.portalid}`
              : "Merchant identifier will be obtained from Payone after domain verification. See documentation for setup instructions."
            }
          </Typography>
        </Box>

        {/* Domain Verification File Alert */}
        <Box marginTop={4}>
          <Box padding={3} background="warning100" borderRadius="4px" borderColor="warning200" borderWidth="1px" borderStyle="solid">
            <Typography variant="pi" fontWeight="bold" textColor="warning700" marginBottom={2}>
              ⚠️ Domain Verification File Required {' '}
            </Typography>
            <Typography variant="pi" textColor="neutral700" marginBottom={2}>
              <strong>Download the Apple Pay domain verification file</strong> from your Payone merchant portal:
            </Typography>
            <Box padding={2} background="neutral0" borderRadius="4px" marginTop={2} marginBottom={2}>
              <Typography variant="pi" style={{ fontSize: "12px" }}>
                <strong>Download URL:</strong> Download the domain verification file from Payone documentation:{" "}
                <a
                  href="https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0066ff", textDecoration: "underline" }}
                >
                  https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev
                </a>
              </Typography>
            </Box>
            <Typography variant="pi" textColor="neutral700" marginBottom={2}>
              <strong>Place the file at:</strong>
            </Typography>
            <Box padding={2} background="neutral0" borderRadius="4px" marginTop={2} marginBottom={2}>
              <Typography variant="pi" style={{ fontFamily: "monospace", fontSize: "12px" }}>
                <strong>Strapi:</strong> <code>public/.well-known/apple-developer-merchantid-domain-association</code><br />
                <strong>Frontend:</strong> <code>public/.well-known/apple-developer-merchantid-domain-association</code>
              </Typography>
            </Box>
            <Typography variant="pi" textColor="neutral700" marginTop={2}>
              The file must be accessible at: <code>https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association</code>
            </Typography>
            <br />
            <Typography variant="pi" fontWeight="bold" textColor="danger600" marginTop={2}>
              Without this file, Apple Pay will NOT work on your domain!
            </Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default ApplePayConfig;