import React from "react";
import { Box, Flex, Typography, Select, Option, Checkbox, TextInput } from "@strapi/design-system";
import {
  APPLE_PAY_SUPPORTED_COUNTRIES,
  APPLE_PAY_SUPPORTED_CURRENCIES,
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
    requestPayerName = DEFAULT_APPLE_PAY_CONFIG.requestPayerName,
    requestBillingAddress = DEFAULT_APPLE_PAY_CONFIG.requestBillingAddress,
    requestPayerEmail = DEFAULT_APPLE_PAY_CONFIG.requestPayerEmail,
    requestPayerPhone = DEFAULT_APPLE_PAY_CONFIG.requestPayerPhone,
    requestShipping = DEFAULT_APPLE_PAY_CONFIG.requestShipping,
    shippingType = DEFAULT_APPLE_PAY_CONFIG.shippingType
  } = config || {};

  // Get supported currencies and networks based on selected country
  const supportedCurrencies = getSupportedCurrenciesForCountry(countryCode);
  const supportedNetworksForCountry = getSupportedNetworksForCountry(countryCode);

  const handleCountryChange = (value) => {
    const newConfig = {
      ...config,
      countryCode: value
    };
    
    // Auto-update currency if current currency is not supported in new country
    const newSupportedCurrencies = getSupportedCurrenciesForCountry(value);
    if (!newSupportedCurrencies.find(c => c.code === currencyCode)) {
      newConfig.currencyCode = newSupportedCurrencies[0]?.code || "USD";
    }
    
    // Auto-update networks based on country
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
    <Box padding={4}>
      <Flex direction="column" gap={4}>
        <Typography variant="omega" fontWeight="semiBold">
          Apple Pay Configuration
        </Typography>

        {/* Country Code */}
        <Box>
          <Select
            label="Country Code *"
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

        {/* Currency Code */}
        <Box>
          <Select
            label="Currency Code *"
            name="currencyCode"
            value={currencyCode}
            onChange={handleCurrencyChange}
            hint={`Supported currencies for ${countryCode}. Some currencies may be restricted.`}
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

        {/* Supported Networks */}
        <Box>
          <Typography variant="pi" fontWeight="semiBold" style={{ marginBottom: "8px" }}>
            Supported Networks *
          </Typography>
          <Typography variant="sigma" textColor="neutral600" style={{ marginBottom: "12px" }}>
            Select payment networks supported in {countryCode}
          </Typography>
          <Flex direction="column" gap={2}>
            {APPLE_PAY_SUPPORTED_NETWORKS.map(network => {
              const isSupported = supportedNetworksForCountry.includes(network.code);
              const isSelected = supportedNetworks?.includes(network.code);
              
              return (
                <Checkbox
                  key={network.code}
                  name={`network-${network.code}`}
                  checked={isSelected}
                  onChange={() => handleNetworkToggle(network.code)}
                  disabled={!isSupported}
                  hint={!isSupported ? `Not supported in ${countryCode}` : undefined}
                >
                  {network.name} ({network.code})
                  {!isSupported && (
                    <Typography variant="sigma" textColor="neutral500" style={{ marginLeft: "8px" }}>
                      (Not available in {countryCode})
                    </Typography>
                  )}
                </Checkbox>
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
          <Typography variant="pi" fontWeight="semiBold" style={{ marginBottom: "8px" }}>
            Merchant Capabilities *
          </Typography>
          <Typography variant="sigma" textColor="neutral600" style={{ marginBottom: "12px" }}>
            Select payment capabilities. "3D Secure" is required for most payment methods.
          </Typography>
          <Flex direction="column" gap={2}>
            {APPLE_PAY_MERCHANT_CAPABILITIES.map(capability => {
              const isSelected = merchantCapabilities?.includes(capability.code);
              
              return (
                <Checkbox
                  key={capability.code}
                  name={`capability-${capability.code}`}
                  checked={isSelected}
                  onChange={() => handleCapabilityToggle(capability.code)}
                >
                  {capability.name} - {capability.description}
                </Checkbox>
              );
            })}
          </Flex>
          {merchantCapabilities?.length === 0 && (
            <Typography variant="pi" textColor="danger600" style={{ marginTop: "8px" }}>
              At least one capability must be selected. "supports3DS" is recommended.
            </Typography>
          )}
        </Box>

        {/* Button Style */}
        <Box>
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

        {/* Button Type */}
        <Box>
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

        {/* Payment Options */}
        <Box>
          <Typography variant="pi" fontWeight="semiBold" style={{ marginBottom: "8px" }}>
            Payment Options
          </Typography>
          <Flex direction="column" gap={2}>
            <Checkbox
              name="requestPayerName"
              checked={requestPayerName}
              onChange={(checked) => onConfigChange({ ...config, requestPayerName: checked })}
            >
              Request Payer Name
            </Checkbox>
            <Checkbox
              name="requestBillingAddress"
              checked={requestBillingAddress}
              onChange={(checked) => onConfigChange({ ...config, requestBillingAddress: checked })}
            >
              Request Billing Address
            </Checkbox>
            <Checkbox
              name="requestPayerEmail"
              checked={requestPayerEmail}
              onChange={(checked) => onConfigChange({ ...config, requestPayerEmail: checked })}
            >
              Request Payer Email
            </Checkbox>
            <Checkbox
              name="requestPayerPhone"
              checked={requestPayerPhone}
              onChange={(checked) => onConfigChange({ ...config, requestPayerPhone: checked })}
            >
              Request Payer Phone
            </Checkbox>
            <Checkbox
              name="requestShipping"
              checked={requestShipping}
              onChange={(checked) => onConfigChange({ ...config, requestShipping: checked })}
            >
              Request Shipping Address
            </Checkbox>
          </Flex>
        </Box>

        {/* Merchant Identifier Info */}
        <Box padding={3} background="neutral100" borderRadius="4px">
          <Typography variant="pi" fontWeight="semiBold" style={{ marginBottom: "4px" }}>
            Merchant Identifier
          </Typography>
          <Typography variant="sigma" textColor="neutral600">
            {settings?.mid || settings?.portalid 
              ? `Using: ${settings.mid || settings.portalid}`
              : "Merchant identifier will be obtained from Payone after domain verification. See documentation for setup instructions."
            }
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

export default ApplePayConfig;




