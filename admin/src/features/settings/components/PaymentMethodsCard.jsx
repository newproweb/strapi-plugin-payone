import { Box, Flex, Grid, Switch, TextButton, Typography } from "@strapi/design-system";
import { Cog } from "@strapi/icons";
import { SectionCard } from "../../../components/SectionCard";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const PAYMENT_METHOD_TOGGLES = [
  { field: "enableCreditCard", labelKey: "creditCard", label: "Credit Card (Visa, Mastercard)" },
  { field: "enablePayPal", labelKey: "paypal", label: "PayPal" },
  { field: "enableSepaDirectDebit", labelKey: "sepa", label: "SEPA Direct Debit" },
  { field: "enableGooglePay", labelKey: "googlePay", label: "Google Pay", configView: "google-pay-config" },
  { field: "enableApplePay", labelKey: "applePay", label: "Apple Pay", configView: "apple-pay-config" },
];

const MethodTile = ({ method, enabled, onToggle, onConfigure }) => {
  const { t } = usePluginTranslations();
  const label = t(`config.paymentMethods.${method.labelKey}`, method.label);

  return (
    <Box padding={4} hasRadius borderColor={enabled ? "primary200" : "neutral200"} background={enabled ? "primary100" : "neutral0"} height="100%">
      <Flex justifyContent="space-between" alignItems="center" gap={3}>
        <Typography variant="omega" fontWeight="semiBold">
          {label}
        </Typography>
        <Switch aria-label={label} checked={enabled} onCheckedChange={onToggle} />
      </Flex>
      {method.configView && (
        <Box marginTop={3}>
          <TextButton startIcon={<Cog />} onClick={() => onConfigure(method.configView)}>
            {t("settings.methods.configure", "Configure")}
          </TextButton>
        </Box>
      )}
    </Box>
  );
};

/** Grid of payment method switches; Google Pay and Apple Pay link to their own configuration page. */
export const PaymentMethodsCard = ({ settings, onNavigateToConfig }) => {
  const { t } = usePluginTranslations();

  return (
    <SectionCard
      title={t("settings.methods.title", "Payment methods")}
      description={t("settings.methods.description", "Only enabled methods are offered at checkout.")}
    >
      <Grid.Root gap={4}>
        {PAYMENT_METHOD_TOGGLES.map((method) => (
          <Grid.Item key={method.field} col={4} m={6} s={12} direction="column" alignItems="stretch">
            <MethodTile
              method={method}
              enabled={settings.settings[method.field] === true}
              onToggle={(checked) => settings.handlePaymentMethodToggle(method.field, checked)}
              onConfigure={onNavigateToConfig}
            />
          </Grid.Item>
        ))}
      </Grid.Root>
    </SectionCard>
  );
};
