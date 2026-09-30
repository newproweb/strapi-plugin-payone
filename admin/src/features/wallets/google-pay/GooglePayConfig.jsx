import { Box, Flex } from "@strapi/design-system";
import { FormField } from "../../../components/FormField";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { toCountryOption, toCurrencyOption } from "../../../utils/locale-options";
import {
  GOOGLE_PAY_SUPPORTED_COUNTRIES,
  GOOGLE_PAY_SUPPORTED_CURRENCIES,
  GOOGLE_PAY_SUPPORTED_NETWORKS,
  GOOGLE_PAY_AUTH_METHODS,
  DEFAULT_GOOGLE_PAY_CONFIG,
} from "../../../constants/google-pay";
import { CheckboxGroup, toggleItem } from "../CheckboxGroup";

const CHECKBOX_LIST_PROPS = { direction: "row", alignItems: "stretch", marginTop: 2, width: "100%" };

export const GooglePayConfig = ({ config, onConfigChange }) => {
  const { t } = usePluginTranslations();
  const {
    countryCode = DEFAULT_GOOGLE_PAY_CONFIG.countryCode,
    currencyCode = DEFAULT_GOOGLE_PAY_CONFIG.currencyCode,
    allowedCardNetworks = DEFAULT_GOOGLE_PAY_CONFIG.allowedCardNetworks,
    allowedAuthMethods = DEFAULT_GOOGLE_PAY_CONFIG.allowedAuthMethods,
    merchantName = DEFAULT_GOOGLE_PAY_CONFIG.merchantName,
  } = config || {};

  const updateConfig = (changes) => onConfigChange({ ...config, ...changes });
  const selectHandler = (field) => (e) => updateConfig({ [field]: e.target?.value || e });

  return (
    <Flex direction="column" gap={4} alignItems="center" justifyContent="center" width="100%">
      <Box style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", width: "100%" }}>
        <Box>
          <FormField
            name="countryCode"
            label={t("googlePayConfig.countryCode", "Country Code")}
            value={countryCode || ""}
            onChange={selectHandler("countryCode")}
            inputType="select"
            required
            tooltipContent={t("googlePayConfig.countryTooltip", "Select the country where your business operates")}
            options={GOOGLE_PAY_SUPPORTED_COUNTRIES.map(toCountryOption)}
          />
        </Box>
        <Box>
          <FormField
            name="currencyCode"
            label={t("googlePayConfig.currencyCode", "Currency Code")}
            value={currencyCode || ""}
            onChange={selectHandler("currencyCode")}
            inputType="select"
            required
            tooltipContent={t("googlePayConfig.currencyTooltip", "Select the currency for transactions")}
            options={GOOGLE_PAY_SUPPORTED_CURRENCIES.map(toCurrencyOption)}
          />
        </Box>
        <Box>
          <FormField
            name="merchantName"
            label={t("googlePayConfig.merchantName", "Merchant Name")}
            value={merchantName || ""}
            onChange={(e) => updateConfig({ merchantName: e.target.value })}
            inputType="textInput"
            placeholder={t("googlePayConfig.merchantNamePlaceholder", "Your Store Name")}
            tooltipContent={t("googlePayConfig.merchantNameTooltip", "The name of your business as it will appear in Google Pay")}
          />
        </Box>
      </Box>

      <Box width="100%" marginBottom={4} marginTop={4}>
        <CheckboxGroup
          title={t("googlePayConfig.allowedNetworks", "Allowed Card Networks")}
          hint={t("googlePayConfig.allowedNetworksHint", "Select payment card networks to accept")}
          items={GOOGLE_PAY_SUPPORTED_NETWORKS}
          selected={allowedCardNetworks}
          namePrefix="network"
          onToggle={(code) => updateConfig({ allowedCardNetworks: toggleItem(allowedCardNetworks, code) })}
          renderLabel={(network) => `${network.name} (${network.code})`}
          emptyMessage={t("googlePayConfig.atLeastOneNetwork", "At least one card network must be selected")}
          listProps={CHECKBOX_LIST_PROPS}
        />
      </Box>

      <Box width="100%">
        <CheckboxGroup
          title={t("googlePayConfig.allowedAuthMethods", "Allowed Authentication Methods")}
          hint={t("googlePayConfig.allowedAuthMethodsHint", "Select authentication methods for card payments")}
          items={GOOGLE_PAY_AUTH_METHODS}
          selected={allowedAuthMethods}
          namePrefix="auth-method"
          onToggle={(code) => updateConfig({ allowedAuthMethods: toggleItem(allowedAuthMethods, code) })}
          renderLabel={(method) => `${method.name} - ${method.description}`}
          emptyMessage={t("googlePayConfig.atLeastOneAuth", "At least one authentication method must be selected")}
          listProps={CHECKBOX_LIST_PROPS}
        />
      </Box>
    </Flex>
  );
};
