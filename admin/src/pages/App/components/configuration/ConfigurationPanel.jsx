import * as React from "react";
import { Box, Flex, Typography } from "@strapi/design-system";
import ConfigurationFields from "./ConfigurationFields";
import TestConnection from "./TestConnection";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const ConfigurationPanel = ({ settings, onNavigateToConfig }) => {
  const { t } = usePluginTranslations();
  return (
    <Flex direction="column" alignItems="stretch" gap={8} paddingTop={8}>
      <Box>
        <Typography
          variant="beta"
          as="h2"
          fontWeight="bold"
          className="payment-title"
          style={{ fontSize: "20px", marginBottom: "4px" }}
        >
          {t("config.title", "Payone API Configuration")}
        </Typography>
        <Typography
          variant="pi"
          textColor="neutral600"
          marginTop={2}
          className="payment-subtitle"
          style={{ fontSize: "14px" }}
        >
          {t("config.subtitle", "Configure your Payone payment gateway settings")}
        </Typography>
      </Box>

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

export default ConfigurationPanel;
