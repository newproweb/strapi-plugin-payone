import { Box, Grid } from "@strapi/design-system";
import { FormField } from "../../../components/FormField";
import { SectionCard } from "../../../components/SectionCard";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { TestConnection } from "./TestConnection";

const CREDENTIAL_FIELDS = [
  { name: "aid", labelKey: "aid", label: "Account ID (aid)", tooltip: "Your Payone account ID", required: true },
  { name: "portalid", labelKey: "portalid", label: "Portal ID", tooltip: "Your Payone portal ID", required: true },
  { name: "mid", labelKey: "mid", label: "Merchant ID (mid)", tooltip: "Your Payone merchant ID", required: true },
  { name: "key", labelKey: "key", label: "Portal Key", tooltip: "Your Payone portal key (will be encrypted)", required: true, type: "password" },
  { name: "domainName", labelKey: "domainName", label: "Domain Name", tooltip: "Your Payone domain name" },
  { name: "displayName", labelKey: "displayName", label: "Display Name", tooltip: "Display name for payment methods (optional)" },
  { name: "api_version", labelKey: "apiVersion", label: "API Version", tooltip: "Payone API version", required: true, fallback: "3.10" },
];

/** Payone portal credentials plus the test-connection check. */
export const CredentialsCard = ({ settings }) => {
  const { t } = usePluginTranslations();
  const values = settings.settings;

  return (
    <SectionCard
      title={t("settings.credentials.title", "Credentials")}
      description={t("settings.credentials.description", "From the Payone Merchant Interface (PMI).")}
    >
      <Grid.Root gap={4}>
        {CREDENTIAL_FIELDS.map((field) => (
          <Grid.Item key={field.name} col={6} s={12} direction="column" alignItems="stretch">
            <FormField
              label={t(`config.fields.${field.labelKey}`, field.label)}
              name={field.name}
              type={field.type}
              value={values[field.name] || field.fallback || ""}
              onChange={(e) => settings.handleInputChange(field.name, e.target.value)}
              required={field.required}
              inputType="textInput"
              tooltipContent={t(`config.fields.${field.labelKey}Tooltip`, field.tooltip)}
            />
          </Grid.Item>
        ))}
      </Grid.Root>
      <Box marginTop={6}>
        <TestConnection
          settings={settings.savedSettings}
          isDirty={settings.isDirty}
          isTesting={settings.isTesting}
          testResult={settings.testResult}
          onTestConnection={settings.handleTestConnection}
        />
      </Box>
    </SectionCard>
  );
};
