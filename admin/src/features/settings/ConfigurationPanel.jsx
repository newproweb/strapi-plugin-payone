import { Box, Flex, Typography } from "@strapi/design-system";
import { PanelHeader } from "../../components/PanelHeader";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";
import { ConfigurationFields } from "./components/ConfigurationFields";
import { TestConnection } from "./components/TestConnection";

export const ConfigurationPanel = ({ settings, onNavigateToConfig }) => {
  const { t } = usePluginTranslations();
  return (
    <Flex direction="column" alignItems="stretch" gap={8} paddingTop={8}>
      <PanelHeader
        title={t("config.title", "Payone API Configuration")}
        subtitle={t("config.subtitle", "Configure your Payone payment gateway settings")}
        titleProps={{ fontWeight: "bold" }}
        subtitleProps={{ marginTop: 2 }}
      />

      <ConfigurationFields
        settings={settings.settings}
        onInputChange={settings.handleInputChange}
        onPaymentMethodToggle={settings.handlePaymentMethodToggle}
        onNavigateToConfig={onNavigateToConfig}
      />

      <TestConnection
        settings={settings.settings}
        isTesting={settings.isTesting}
        testResult={settings.testResult}
        onTestConnection={settings.handleTestConnection}
      />

      <Box paddingTop={4}>
        <Typography variant="sigma" textColor="neutral600">
          {t("config.note", "Note: These settings are used for all Payone API requests. Make sure to use the correct credentials for your selected mode.")}
        </Typography>
      </Box>
    </Flex>
  );
};
