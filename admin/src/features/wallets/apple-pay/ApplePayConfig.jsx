import { Box, Divider, Flex, Typography } from "@strapi/design-system";
import { FormField } from "../../../components/FormField";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { toCountryOption, toCurrencyOption } from "../../../utils/locale-options";
import { getSupportedCurrenciesForCountry, getSupportedNetworksForCountry } from "../../../utils/apple-pay-options";
import {
  APPLE_PAY_SUPPORTED_COUNTRIES,
  APPLE_PAY_SUPPORTED_NETWORKS,
  APPLE_PAY_MERCHANT_CAPABILITIES,
  APPLE_PAY_BUTTON_STYLES,
  APPLE_PAY_BUTTON_TYPES,
  DEFAULT_APPLE_PAY_CONFIG,
  APPLE_PAY_DOCS_URL,
  APPLE_PAY_DOMAIN_FILE_PATH,
} from "../../../constants/apple-pay";
import { CheckboxGroup, toggleItem } from "../CheckboxGroup";

const HALF_WIDTH_ITEM = { flex: "0 0 calc(50% - 8px)", minWidth: "250px" };
const toNamedOption = (item) => ({ value: item.code, label: item.name });

export const ApplePayConfig = ({ config, onConfigChange }) => {
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
  const networksForCountry = getSupportedNetworksForCountry(countryCode);

  const updateConfig = (changes) => onConfigChange({ ...config, ...changes });

  const handleCountryChange = (value) => {
    const currencies = getSupportedCurrenciesForCountry(value);
    const keepsCurrency = currencies.find((currency) => currency.code === currencyCode);
    updateConfig({
      countryCode: value,
      ...(keepsCurrency ? {} : { currencyCode: currencies[0]?.code || "USD" }),
      supportedNetworks: getSupportedNetworksForCountry(value),
    });
  };

  const selectHandler = (update) => (e) => update(e.target?.value || e);

  const renderSelects = () => (
    <Box style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", width: "100%" }}>
      <Box>
        <FormField
          name="countryCode"
          label={t("applePayConfig.countryCode", "Country Code")}
          value={countryCode || ""}
          onChange={selectHandler(handleCountryChange)}
          inputType="select"
          required
          tooltipContent={t("applePayConfig.countryTooltip", "Select the country where your business operates")}
          options={APPLE_PAY_SUPPORTED_COUNTRIES.map(toCountryOption)}
        />
      </Box>
      <Box>
        <FormField
          name="currencyCode"
          label={t("applePayConfig.currencyCode", "Currency Code")}
          value={currencyCode || ""}
          onChange={selectHandler((value) => updateConfig({ currencyCode: value }))}
          inputType="select"
          required
          tooltipContent={t("applePayConfig.currencyTooltip", "Supported currencies for {{country}}", { country: countryCode })}
          options={supportedCurrencies.map(toCurrencyOption)}
        />
        {supportedCurrencies.length === 0 && (
          <Typography variant="pi" textColor="danger600" style={{ marginTop: "4px" }}>
            {t("applePayConfig.noCurrencies", "No supported currencies for this country. Please select a different country.")}
          </Typography>
        )}
      </Box>
      <Box>
        <FormField
          name="buttonStyle"
          label={t("applePayConfig.buttonStyle", "Button Style")}
          value={buttonStyle || ""}
          onChange={selectHandler((value) => updateConfig({ buttonStyle: value }))}
          inputType="select"
          tooltipContent={t("applePayConfig.buttonStyleTooltip", "Visual style of the Apple Pay button")}
          options={APPLE_PAY_BUTTON_STYLES.map(toNamedOption)}
        />
      </Box>
      <Box>
        <FormField
          name="buttonType"
          label={t("applePayConfig.buttonType", "Button Type")}
          value={buttonType || ""}
          onChange={selectHandler((value) => updateConfig({ buttonType: value }))}
          inputType="select"
          tooltipContent={t("applePayConfig.buttonTypeTooltip", "Type of action the button represents")}
          options={APPLE_PAY_BUTTON_TYPES.map(toNamedOption)}
        />
      </Box>
    </Box>
  );

  const renderNetworkLabel = (network) => (
    <>
      {network.name} ({network.code})
      {!networksForCountry.includes(network.code) && (
        <Typography variant="sigma" textColor="neutral500" style={{ marginLeft: "8px" }}>
          {t("applePayConfig.notAvailable", "(Not available)")}
        </Typography>
      )}
    </>
  );

  const renderDomainVerification = () => (
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
          <a href={APPLE_PAY_DOCS_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#0066ff", textDecoration: "underline" }}>
            {APPLE_PAY_DOCS_URL}
          </a>
        </Typography>
      </Box>
      <Typography variant="pi" textColor="neutral700">
        <strong>{t("applePayConfig.placeFileAt", "Place the file at:")}</strong>
      </Typography>
      <Box padding={2} background="neutral0" borderRadius="4px">
        <Typography variant="pi" style={{ fontFamily: "monospace", fontSize: "12px" }}>
          <strong>Strapi:</strong> <code>{APPLE_PAY_DOMAIN_FILE_PATH}</code>
          <br />
          <strong>Frontend:</strong> <code>{APPLE_PAY_DOMAIN_FILE_PATH}</code>
        </Typography>
      </Box>
      <Typography variant="pi" textColor="neutral700" marginTop={2}>
        {t("applePayConfig.fileMustBeAccessible", "The file must be accessible at:")}{" "}
        <code>https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association</code>
      </Typography>
      <Typography variant="pi" fontWeight="bold" textColor="danger600">
        {t("applePayConfig.withoutFileWarning", "Without this file, Apple Pay will NOT work on your domain!")}
      </Typography>
    </Flex>
  );

  return (
    <Box>
      <Flex direction="column" gap={6} alignItems="stretch">
        {renderSelects()}
        <Divider />
        <Box>
          <CheckboxGroup
            title={t("applePayConfig.supportedNetworks", "Supported Networks")}
            hint={t("applePayConfig.supportedNetworksHint", "Select payment networks supported in {{country}}", { country: countryCode })}
            items={APPLE_PAY_SUPPORTED_NETWORKS}
            selected={supportedNetworks}
            namePrefix="network"
            onToggle={(code) => updateConfig({ supportedNetworks: toggleItem(supportedNetworks, code) })}
            renderLabel={renderNetworkLabel}
            isDisabled={(network) => !networksForCountry.includes(network.code)}
            emptyMessage={t("applePayConfig.atLeastOneNetwork", "At least one network must be selected")}
            listProps={{ style: { marginTop: "12px" } }}
            itemStyle={HALF_WIDTH_ITEM}
          />
        </Box>
        <Divider />
        <Box>
          <CheckboxGroup
            title={t("applePayConfig.merchantCapabilities", "Merchant Capabilities")}
            hint={t("applePayConfig.merchantCapabilitiesHint", "Select payment capabilities. \"3D Secure\" is required for most payment methods.")}
            items={APPLE_PAY_MERCHANT_CAPABILITIES}
            selected={merchantCapabilities}
            namePrefix="capability"
            onToggle={(code) => updateConfig({ merchantCapabilities: toggleItem(merchantCapabilities, code) })}
            renderLabel={(capability) => `${capability.name} - ${capability.description}`}
            emptyMessage={t("applePayConfig.atLeastOneCapability", "At least one capability must be selected. \"supports3DS\" is recommended.")}
            headerStyle={{ marginLeft: "2px" }}
            listProps={{ style: { marginTop: "12px" } }}
            itemStyle={HALF_WIDTH_ITEM}
          />
        </Box>
        <Divider />
        {renderDomainVerification()}
      </Flex>
    </Box>
  );
};
