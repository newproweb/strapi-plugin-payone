import { Box, Flex, Typography } from "@strapi/design-system";
import ConfigurationFields from "./ConfigurationFields.jsx";
import TestConnection from "./TestConnection.jsx";

const ConfigurationPanel = ({
  settings,
  isTesting,
  testResult,
  onTestConnection,
  onInputChange,
  onPaymentMethodToggle,
}) => {
  return (
    <Box
      className="payment-container"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
    >
      <Flex direction="column" alignItems="stretch" gap={8}>
        <Box>
          <Typography
            variant="beta"
            as="h2"
            fontWeight="bold"
            className="payment-title"
            style={{ fontSize: "20px", marginBottom: "4px" }}
          >
            Payone API Configuration
          </Typography>
          <Typography
            variant="pi"
            textColor="neutral600"
            marginTop={2}
            className="payment-subtitle"
            style={{ fontSize: "14px" }}
          >
            Configure your Payone payment gateway settings
          </Typography>
        </Box>

        <ConfigurationFields
          settings={settings}
          onInputChange={onInputChange}
          onPaymentMethodToggle={onPaymentMethodToggle}
        />

        <TestConnection
          settings={settings}
          isTesting={isTesting}
          testResult={testResult}
          onTestConnection={onTestConnection}
        />

        <Box paddingTop={4}>
          <Typography variant="sigma" textColor="neutral600">
            Note: These settings are used for all Payone API requests. Make sure
            to use the correct credentials for your selected mode.
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

export default ConfigurationPanel;
