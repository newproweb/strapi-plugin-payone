import React, { useState, useEffect } from "react";
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
  const [applePayConfig, setApplePayConfig] = useState(
    settings?.applePayConfig || {}
  );

  useEffect(() => {
    setApplePayConfig(settings?.applePayConfig || {});
  }, [settings?.applePayConfig]);

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
          <Card className="payment-card">
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
        </Box>

        <Box paddingTop={4}>
          <Flex direction="row" gap={4} alignItems="center">
            <Button
              loading={isSaving}
              onClick={onSave}
              startIcon={<Check />}
              size="L"
              variant="default"
              className="payment-button payment-button-success"
            >
              Save Apple Pay Configuration
            </Button>
            <Typography variant="sigma" textColor="neutral600">
              Note: Apple Pay configuration is used for Apple Pay payment
              requests. Make sure to configure the correct merchant identifier,
              supported networks, and capabilities for your region.
            </Typography>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default ApplePayConfigPanel;

