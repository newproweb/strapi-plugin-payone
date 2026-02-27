import * as React from "react";
import {
  Box,
  Flex,
  Typography,
  Checkbox,
  Divider,
} from "@strapi/design-system";
import RenderInput from "./RenderInput";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";
import {
  APPLE_PAY_SUPPORTED_COUNTRIES,
  APPLE_PAY_SUPPORTED_NETWORKS,
  APPLE_PAY_MERCHANT_CAPABILITIES,
  getSupportedCurrenciesForCountry,
  getSupportedNetworksForCountry,
  APPLE_PAY_BUTTON_STYLES,
  APPLE_PAY_BUTTON_TYPES,
  DEFAULT_APPLE_PAY_CONFIG,
} from "../../utils/applePayConstants";

const ApplePayConfig = ({ config, onConfigChange, settings }) => {
  const { t } = usePluginTranslations();
  const {
    countryCode = DEFAULT_APPLE_PAY_CONFIG.countryCode,
    currencyCode = DEFAULT_APPLE_PAY_CONFIG.currencyCode,
    merchantCapabilities = DEFAULT_APPLE_PAY_CONFIG.merchantCapabilities,
    supportedNetworks = DEFAULT_APPLE_PAY_CONFIG.supportedNetworks,
    buttonStyle = DEFAULT_APPLE_PAY_CONFIG.buttonStyle,
    buttonType = DEFAULT_APPLE_PAY_CONFIG.buttonType,
  } = config || {};

  const supportedCurrencies = getSupportedCurrenciesForCountry(countryCode);
  const supportedNetworksForCountry =
    getSupportedNetworksForCountry(countryCode);

  const handleCountryChange = (value) => {
    const newConfig = {
      ...config,
      countryCode: value,
    };

    const newSupportedCurrencies = getSupportedCurrenciesForCountry(value);
    if (!newSupportedCurrencies.find((c) => c.code === currencyCode)) {
      newConfig.currencyCode = newSupportedCurrencies[0]?.code || "USD";
    }

    newConfig.supportedNetworks = getSupportedNetworksForCountry(value);

    onConfigChange(newConfig);
  };

  const handleCurrencyChange = (value) => {
    onConfigChange({
      ...config,
      currencyCode: value,
    });
  };

  const handleNetworkToggle = (networkCode) => {
    const currentNetworks = supportedNetworks || [];
    const newNetworks = currentNetworks.includes(networkCode)
      ? currentNetworks.filter((n) => n !== networkCode)
      : [...currentNetworks, networkCode];

    onConfigChange({
      ...config,
      supportedNetworks: newNetworks,
    });
  };

  const handleCapabilityToggle = (capabilityCode) => {
    const currentCapabilities = merchantCapabilities || [];
    const newCapabilities = currentCapabilities.includes(capabilityCode)
      ? currentCapabilities.filter((c) => c !== capabilityCode)
      : [...currentCapabilities, capabilityCode];

    onConfigChange({
      ...config,
      merchantCapabilities: newCapabilities,
    });
  };

  return (
    <Box>
      <Flex direction="column" gap={6} alignItems="stretch">
        {/* Country and Currency */}
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            width: "100%",
          }}
        >
          <Box>
            <RenderInput
              name="countryCode"
              label={t("applePayConfig.countryCode", "Country Code")}
              value={countryCode || ""}
              onChange={(e) => {
                const value = e.target?.value || e;
                handleCountryChange(value);
              }}
              inputType="select"
              required
              tooltipContent={t("applePayConfig.countryTooltip", "Select the country where your business operates")}
              options={APPLE_PAY_SUPPORTED_COUNTRIES.map((country) => ({
                value: country.code,
                label: `${country.name} (${country.code})`,
              }))}
            />
          </Box>

          <Box>
            <RenderInput
              name="currencyCode"
              label={t("applePayConfig.currencyCode", "Currency Code")}
              value={currencyCode || ""}
              onChange={(e) => {
                const value = e.target?.value || e;
                handleCurrencyChange(value);
              }}
              inputType="select"
              required
              tooltipContent={t("applePayConfig.currencyTooltip", "Supported currencies for {{country}}", { country: countryCode })}
              options={supportedCurrencies.map((currency) => ({
                value: currency.code,
                label: `${currency.name} (${currency.code}) ${currency.symbol}`,
              }))}
            />
            {supportedCurrencies.length === 0 && (
              <Typography
                variant="pi"
                textColor="danger600"
                style={{ marginTop: "4px" }}
              >
                {t("applePayConfig.noCurrencies", "No supported currencies for this country. Please select a different country.")}
              </Typography>
            )}
          </Box>
          <Box>
            <RenderInput
              name="buttonStyle"
              label={t("applePayConfig.buttonStyle", "Button Style")}
              value={buttonStyle || ""}
              onChange={(e) => {
                const value = e.target?.value || e;
                onConfigChange({ ...config, buttonStyle: value });
              }}
              inputType="select"
              tooltipContent={t("applePayConfig.buttonStyleTooltip", "Visual style of the Apple Pay button")}
              options={APPLE_PAY_BUTTON_STYLES.map((style) => ({
                value: style.code,
                label: style.name,
              }))}
            />
          </Box>

          <Box>
            <RenderInput
              name="buttonType"
              label={t("applePayConfig.buttonType", "Button Type")}
              value={buttonType || ""}
              onChange={(e) => {
                const value = e.target?.value || e;
                onConfigChange({ ...config, buttonType: value });
              }}
              inputType="select"
              tooltipContent={t("applePayConfig.buttonTypeTooltip", "Type of action the button represents")}
              options={APPLE_PAY_BUTTON_TYPES.map((type) => ({
                value: type.code,
                label: type.name,
              }))}
            />
          </Box>
        </Box>

        <Divider />
        {/* Supported Networks */}
        <Box>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography variant="pi" fontWeight="semiBold">
              {t("applePayConfig.supportedNetworks", "Supported Networks")}
            </Typography>
            <Typography variant="pi" textColor="neutral600">
              {t("applePayConfig.supportedNetworksHint", "Select payment networks supported in {{country}}", { country: countryCode })}
            </Typography>
          </div>
          <Flex wrap="wrap" gap={4} style={{ marginTop: "12px" }}>
            {APPLE_PAY_SUPPORTED_NETWORKS.map((network) => {
              const isSupported = supportedNetworksForCountry.includes(
                network.code
              );
              const isSelected = supportedNetworks?.includes(network.code);

              return (
                <Box
                  key={network.code}
                  style={{ flex: "0 0 calc(50% - 8px)", minWidth: "250px" }}
                >
                  <Checkbox
                    name={`network-${network.code}`}
                    checked={isSelected}
                    onCheckedChange={() => handleNetworkToggle(network.code)}
                    disabled={!isSupported}
                  >
                    {network.name} ({network.code})
                    {!isSupported && (
                      <Typography
                        variant="sigma"
                        textColor="neutral500"
                        style={{ marginLeft: "8px" }}
                      >
                        {t("applePayConfig.notAvailable", "(Not available)")}
                      </Typography>
                    )}
                  </Checkbox>
                </Box>
              );
            })}
          </Flex>
          {supportedNetworks?.length === 0 && (
            <Typography
              variant="pi"
              textColor="danger600"
              style={{ marginTop: "8px" }}
            >
              {t("applePayConfig.atLeastOneNetwork", "At least one network must be selected")}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Merchant Capabilities */}
        <Box>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Typography
              variant="pi"
              fontWeight="semiBold"
              style={{ marginLeft: "2px" }}
            >
              {t("applePayConfig.merchantCapabilities", "Merchant Capabilities")}
            </Typography>
            <Typography
              variant="pi"
              textColor="neutral600"
              style={{ marginLeft: "2px" }}
            >
              {t("applePayConfig.merchantCapabilitiesHint", "Select payment capabilities. \"3D Secure\" is required for most payment methods.")}
            </Typography>
          </div>
          <Flex wrap="wrap" gap={4} style={{ marginTop: "12px" }}>
            {APPLE_PAY_MERCHANT_CAPABILITIES.map((capability) => {
              const isSelected = merchantCapabilities?.includes(
                capability.code
              );

              return (
                <Box
                  key={capability.code}
                  style={{ flex: "0 0 calc(50% - 8px)", minWidth: "250px" }}
                >
                  <Checkbox
                    name={`capability-${capability.code}`}
                    checked={isSelected}
                    onCheckedChange={() =>
                      handleCapabilityToggle(capability.code)
                    }
                  >
                    {capability.name} - {capability.description}
                  </Checkbox>
                </Box>
              );
            })}
          </Flex>
          {merchantCapabilities?.length === 0 && (
            <Typography
              variant="pi"
              textColor="danger600"
              style={{ marginTop: "8px" }}
            >
              {t("applePayConfig.atLeastOneCapability", "At least one capability must be selected. \"supports3DS\" is recommended.")}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Domain Verification File Alert */}
        <Flex
          direction="column"
          padding={3}
          background="warning100"
          borderRadius="4px"
          borderColor="warning200"
          borderWidth="1px"
          borderStyle="solid"
          alignItems="stretch"
          gap={4}
        >
          <Typography variant="pi" fontWeight="bold" textColor="warning700">
            ⚠️ {t("applePayConfig.domainVerificationTitle", "Domain Verification File Required")}
          </Typography>
          <Typography variant="pi" textColor="neutral700">
            <strong>{t("applePayConfig.domainVerificationDesc", "Download the Apple Pay domain verification file")}</strong>{" "}
            {t("applePayConfig.domainVerificationDescSuffix", "from your Payone documentation:")}
          </Typography>
          <Box padding={2} background="neutral0" borderRadius="4px">
            <Typography variant="pi" style={{ fontSize: "12px" }}>
              <strong>{t("applePayConfig.downloadUrl", "Download URL:")}</strong>{" "}
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
          <Typography variant="pi" textColor="neutral700">
            <strong>{t("applePayConfig.placeFileAt", "Place the file at:")}</strong>
          </Typography>
          <Box padding={2} background="neutral0" borderRadius="4px">
            <Typography
              variant="pi"
              style={{ fontFamily: "monospace", fontSize: "12px" }}
            >
              <strong>Strapi:</strong>{" "}
              <code>
                public/.well-known/apple-developer-merchantid-domain-association
              </code>
              <br />
              <strong>Frontend:</strong>{" "}
              <code>
                public/.well-known/apple-developer-merchantid-domain-association
              </code>
            </Typography>
          </Box>
          <Typography variant="pi" textColor="neutral700" marginTop={2}>
            {t("applePayConfig.fileMustBeAccessible", "The file must be accessible at:")}{" "}
            <code>
              https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
            </code>
          </Typography>
          <Typography variant="pi" fontWeight="bold" textColor="danger600">
            {t("applePayConfig.withoutFileWarning", "Without this file, Apple Pay will NOT work on your domain!")}
          </Typography>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ApplePayConfig;
