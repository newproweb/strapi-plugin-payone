import { Button, Card, CardBody, Flex, Typography } from "@strapi/design-system";
import { Cog } from "@strapi/icons";
import { FormField } from "../../../components/FormField";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const PAYMENT_METHOD_TOGGLES = [
  { field: "enableCreditCard", labelKey: "creditCard", label: "Credit Card (Visa, Mastercard)", tooltip: "Enable or disable credit card payments" },
  { field: "enablePayPal", labelKey: "paypal", label: "PayPal", tooltip: "Enable or disable PayPal payments" },
  { field: "enableGooglePay", labelKey: "googlePay", label: "Google Pay", tooltip: "Enable or disable Google Pay payments" },
  { field: "enableApplePay", labelKey: "applePay", label: "Apple Pay", tooltip: "Enable or disable Apple Pay payments" },
  { field: "enableSepaDirectDebit", labelKey: "sepa", label: "SEPA Direct Debit", tooltip: "Enable or disable SEPA Direct Debit payments" },
];

export const ConfigurationFields = ({ settings, onInputChange, onPaymentMethodToggle, onNavigateToConfig }) => {
  const { t } = usePluginTranslations();

  const handleNavigate = (view) => () => onNavigateToConfig && onNavigateToConfig(view);

  const textField = (name, labelKey, label, tooltipKey, tooltip, extra = {}) => (
    <FormField
      label={t(`config.fields.${labelKey}`, label)}
      name={name}
      value={settings[name]}
      onChange={(e) => onInputChange(name, e.target.value)}
      inputType="textInput"
      tooltipContent={t(`config.fields.${tooltipKey}`, tooltip)}
      {...extra}
    />
  );

  const renderCredentials = () => (
    <Flex direction="column" alignItems="stretch" gap={6}>
      <Flex direction="row" gap={2}>
        {textField("aid", "aid", "Account ID (aid)", "aidTooltip", "Your Payone account ID", { required: true })}
        {textField("portalid", "portalid", "Portal ID", "portalidTooltip", "Your Payone portal ID", { required: true })}
      </Flex>
      <Flex direction="row" gap={2}>
        {textField("mid", "mid", "Merchant ID (mid)", "midTooltip", "Your Payone merchant ID", { required: true })}
        {textField("key", "key", "Portal Key", "keyTooltip", "Your Payone portal key (will be encrypted)", { required: true, type: "password" })}
      </Flex>
      <Flex direction="row" gap={2}>
        {textField("domainName", "domainName", "Domain Name", "domainNameTooltip", "Your Payone domain name")}
        {textField("displayName", "displayName", "Display Name", "displayNameTooltip", "Display name for payment methods (optional)")}
      </Flex>
      <Flex direction="row" gap={2}>
        <FormField
          label={t("config.fields.mode", "Mode")}
          name="mode"
          value={settings.mode || "test"}
          onChange={(e) => onInputChange("mode", e.target.value)}
          required
          inputType="select"
          tooltipContent={t("config.fields.modeTooltip", "Select the API mode")}
          options={[
            { value: "test", label: t("config.fields.modeTest", "Test") },
            { value: "live", label: t("config.fields.modeLive", "Live") },
          ]}
        />
        <FormField
          label={t("config.fields.enable3DSecure", "Enable 3D Secure")}
          name="enable3DSecure"
          value={settings.enable3DSecure ? "yes" : "no"}
          onChange={(e) => onInputChange("enable3DSecure", e.target.value === "yes")}
          required
          inputType="select"
          tooltipContent={t("config.fields.enable3DSecureTooltip", "Enable 3D Secure authentication for credit card payments")}
          options={[
            { value: "yes", label: t("config.fields.enabled", "Enabled") },
            { value: "no", label: t("config.fields.disabled", "Disabled") },
          ]}
        />
      </Flex>
      <Flex direction="row">
        <FormField
          label={t("config.fields.apiVersion", "API Version")}
          name="api_version"
          value={settings.api_version || "3.10"}
          onChange={(e) => onInputChange("api_version", e.target.value)}
          required
          inputType="textInput"
          tooltipContent={t("config.fields.apiVersionTooltip", "Payone API version")}
        />
      </Flex>
    </Flex>
  );

  const renderPaymentMethods = () => (
    <Flex direction="column" alignItems="stretch" height="100%" gap={4} marginTop={6}>
      <Typography variant="pi" textColor="neutral600" marginBottom={8}>
        {t("config.paymentMethods.title", "Enable or disable payment methods for your Payone integration")}
      </Typography>

      {PAYMENT_METHOD_TOGGLES.map((toggle) => (
        <FormField
          key={toggle.field}
          label={t(`config.paymentMethods.${toggle.labelKey}`, toggle.label)}
          name={toggle.field}
          value={settings[toggle.field] === true}
          onChange={(selected) => onPaymentMethodToggle(toggle.field, selected)}
          inputType="switch"
          labelDirection="row"
          labelStyle={{ fontSize: "16px" }}
          tooltipContent={t(`config.paymentMethods.${toggle.labelKey}Tooltip`, toggle.tooltip)}
        />
      ))}

      <Flex direction="row" gap={2} style={{ marginTop: "8rem" }}>
        <Button variant="secondary" startIcon={<Cog />} onClick={handleNavigate("apple-pay-config")}>
          {t("config.buttons.applePayConfig", "Apple Pay Config")}
        </Button>
        <Button variant="secondary" startIcon={<Cog />} onClick={handleNavigate("google-pay-config")}>
          {t("config.buttons.googlePayConfig", "Google Pay Config")}
        </Button>
      </Flex>
    </Flex>
  );

  return (
    <Card padding={8}>
      <CardBody style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {renderCredentials()}
        {renderPaymentMethods()}
      </CardBody>
    </Card>
  );
};
