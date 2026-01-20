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
import ApplePayConfig from "./ApplePayConfig";

const ApplePayConfigPanel = ({ settings, onInputChange, isSaving, onSave }) => {
  const [applePayConfig, setApplePayConfig] = React.useState(
    settings?.applePayConfig || {}
  );

  React.useEffect(() => {
    setApplePayConfig(settings?.applePayConfig || {});
  }, [settings?.applePayConfig]);

  return (
    <Flex direction="column" alignItems="stretch" gap={8} padding={8}>
      <Card>
        <CardBody padding={6}>
          <ApplePayConfig
            config={applePayConfig}
            onConfigChange={(newConfig) => {
              setApplePayConfig(newConfig);
              onInputChange("applePayConfig", newConfig);
            }}
            settings={settings}
          />
        </CardBody>
      </Card>

      <Flex direction="column" gap={4} alignItems="stretch" paddingTop={4}>
        <Typography variant="sigma" textColor="neutral600">
          Note: Apple Pay configuration is used for Apple Pay payment requests.
          Make sure to configure the correct merchant identifier, supported
          networks, and capabilities for your region.
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

export default ApplePayConfigPanel;
