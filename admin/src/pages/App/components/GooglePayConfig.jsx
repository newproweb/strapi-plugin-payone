import * as React from "@strapi/strapi/admin";
import { Box, Flex, Typography, Checkbox } from "@strapi/design-system";
import RenderInput from "./RenderInput";
import {
  GOOGLE_PAY_SUPPORTED_COUNTRIES,
  GOOGLE_PAY_SUPPORTED_CURRENCIES,
  GOOGLE_PAY_SUPPORTED_NETWORKS,
  GOOGLE_PAY_AUTH_METHODS,
  DEFAULT_GOOGLE_PAY_CONFIG,
} from "../../utils/googlePayConstants";

const GooglePayConfig = ({ config, onConfigChange }) => {
  const {
    countryCode = DEFAULT_GOOGLE_PAY_CONFIG.countryCode,
    currencyCode = DEFAULT_GOOGLE_PAY_CONFIG.currencyCode,
    allowedCardNetworks = DEFAULT_GOOGLE_PAY_CONFIG.allowedCardNetworks,
    allowedAuthMethods = DEFAULT_GOOGLE_PAY_CONFIG.allowedAuthMethods,
    merchantName = DEFAULT_GOOGLE_PAY_CONFIG.merchantName,
  } = config || {};

  const handleCountryChange = (value) => {
    onConfigChange({
      ...config,
      countryCode: value,
    });
  };

  const handleCurrencyChange = (value) => {
    onConfigChange({
      ...config,
      currencyCode: value,
    });
  };

  const handleNetworkToggle = (networkCode) => {
    const currentNetworks = allowedCardNetworks || [];
    const newNetworks = currentNetworks.includes(networkCode)
      ? currentNetworks.filter((n) => n !== networkCode)
      : [...currentNetworks, networkCode];

    onConfigChange({
      ...config,
      allowedCardNetworks: newNetworks,
    });
  };

  const handleAuthMethodToggle = (authMethodCode) => {
    const currentMethods = allowedAuthMethods || [];
    const newMethods = currentMethods.includes(authMethodCode)
      ? currentMethods.filter((m) => m !== authMethodCode)
      : [...currentMethods, authMethodCode];

    onConfigChange({
      ...config,
      allowedAuthMethods: newMethods,
    });
  };

  return (
    <Flex
      direction="column"
      gap={4}
      alignItems={"center"}
      justifyContent={"center"}
      width="100%"
    >
      {/* Country and Currency */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "16px",
          width: "100%",
        }}
      >
        <Box>
          <RenderInput
            name="countryCode"
            label="Country Code"
            value={countryCode || ""}
            onChange={(e) => {
              const value = e.target?.value || e;
              handleCountryChange(value);
            }}
            inputType="select"
            required
            tooltipContent="Select the country where your business operates"
            options={GOOGLE_PAY_SUPPORTED_COUNTRIES.map((country) => ({
              value: country.code,
              label: `${country.name} (${country.code})`,
            }))}
          />
        </Box>

        <Box>
          <RenderInput
            name="currencyCode"
            label="Currency Code"
            value={currencyCode || ""}
            onChange={(e) => {
              const value = e.target?.value || e;
              handleCurrencyChange(value);
            }}
            inputType="select"
            required
            tooltipContent="Select the currency for transactions"
            options={GOOGLE_PAY_SUPPORTED_CURRENCIES.map((currency) => ({
              value: currency.code,
              label: `${currency.name} (${currency.code}) ${currency.symbol}`,
            }))}
          />
        </Box>
        <Box>
          <RenderInput
            name="merchantName"
            label="Merchant Name"
            value={merchantName || ""}
            onChange={(e) =>
              onConfigChange({ ...config, merchantName: e.target.value })
            }
            inputType="textInput"
            placeholder="Your Store Name"
            tooltipContent="The name of your business as it will appear in Google Pay"
          />
        </Box>
      </Box>

      {/* Allowed Card Networks */}
      <Box width="100%" marginBottom={4} marginTop={4}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography variant="pi" fontWeight="semiBold">
            Allowed Card Networks
          </Typography>
          <Typography variant="pi" textColor="neutral600">
            Select payment card networks to accept
          </Typography>
        </div>
        <Flex
          direction="row"
          wrap="wrap"
          alignItems="stretch"
          gap={4}
          marginTop={2}
          width="100%"
        >
          {GOOGLE_PAY_SUPPORTED_NETWORKS.map((network) => {
            const isSelected = allowedCardNetworks?.includes(network.code);

            return (
              <Box key={network.code}>
                <Checkbox
                  name={`network-${network.code}`}
                  checked={isSelected}
                  onCheckedChange={() => handleNetworkToggle(network.code)}
                >
                  {network.name} ({network.code})
                </Checkbox>
              </Box>
            );
          })}
        </Flex>
        {allowedCardNetworks?.length === 0 && (
          <Typography
            variant="pi"
            textColor="danger600"
            style={{ marginTop: "8px" }}
          >
            At least one card network must be selected
          </Typography>
        )}
      </Box>

      {/* Allowed Authentication Methods */}
      <Box width="100%">
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Typography variant="pi" fontWeight="semiBold">
            Allowed Authentication Methods
          </Typography>
          <Typography variant="pi" textColor="neutral600">
            Select authentication methods for card payments
          </Typography>
        </div>
        <Flex
          direction="row"
          wrap="wrap"
          gap={4}
          marginTop={2}
          alignItems="stretch"
          width="100%"
        >
          {GOOGLE_PAY_AUTH_METHODS.map((method) => {
            const isSelected = allowedAuthMethods?.includes(method.code);

            return (
              <Box key={method.code}>
                <Checkbox
                  name={`auth-method-${method.code}`}
                  checked={isSelected}
                  onCheckedChange={() => handleAuthMethodToggle(method.code)}
                >
                  {method.name} - {method.description}
                </Checkbox>
              </Box>
            );
          })}
        </Flex>
        {allowedAuthMethods?.length === 0 && (
          <Typography
            variant="pi"
            textColor="danger600"
            style={{ marginTop: "8px" }}
          >
            At least one authentication method must be selected
          </Typography>
        )}
      </Box>
    </Flex>
  );
};

export default GooglePayConfig;
