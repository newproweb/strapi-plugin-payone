import * as React from "react";
import {
  Box,
  Card,
  CardBody,
  Flex,
  Typography,
  Button,
} from "@strapi/design-system";
import { Check } from "@strapi/icons";
import GooglePayConfig from "./GooglePayConfig";

const GooglePayConfigPanel = ({
  settings,
  onInputChange,
  isSaving,
  onSave,
  onBack,
}) => {
  const [googlePayConfig, setGooglePayConfig] = React.useState(
    settings?.googlePayConfig || {}
  );

  React.useEffect(() => {
    setGooglePayConfig(settings?.googlePayConfig || {});
  }, [settings?.googlePayConfig]);

  return (
    <Flex direction="column" alignItems="stretch" gap={8} padding={8}>
      <Card>
        <CardBody padding={6}>
          <GooglePayConfig
            config={googlePayConfig}
            onConfigChange={(newConfig) => {
              setGooglePayConfig(newConfig);
              onInputChange("googlePayConfig", newConfig);
            }}
            settings={settings}
          />
        </CardBody>
      </Card>

      <Flex direction="column" gap={4} alignItems="stretch" paddingTop={4}>
        <Typography variant="sigma" textColor="neutral600">
          Note: Google Pay configuration is used for Google Pay payment
          requests. Make sure to configure the correct card networks,
          authentication methods, and merchant information for your region.
        </Typography>
        <Button
          loading={isSaving}
          onClick={onSave}
          startIcon={<Check />}
          size="L"
          variant="default"
          maxWidth={"220px"}
        >
          Save Configuration
        </Button>
      </Flex>
    </Flex>
  );
};

export default GooglePayConfigPanel;
