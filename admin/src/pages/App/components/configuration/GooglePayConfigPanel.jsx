import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  Flex,
  Typography,
  Button
} from "@strapi/design-system";
import { Check } from "@strapi/icons";
import GooglePayConfig from "./GooglePayConfig";

const GooglePayConfigPanel = ({
  settings,
  onInputChange,
  isSaving,
  onSave,
  onBack
}) => {
  const [googlePayConfig, setGooglePayConfig] = useState(settings?.googlePayConfig || {});

  useEffect(() => {
    setGooglePayConfig(settings?.googlePayConfig || {});
  }, [settings?.googlePayConfig]);

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
          <Typography variant="beta" as="h2" fontWeight="bold" className="payment-title" style={{ fontSize: '20px', marginBottom: '4px' }}>
            Google Pay Configuration
          </Typography>
          <Typography variant="pi" textColor="neutral600" marginTop={2} className="payment-subtitle" style={{ fontSize: '14px' }}>
            Configure Google Pay settings for your payment gateway
          </Typography>
        </Box>

        <Box>
          <Card className="payment-card">
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
              Save Google Pay Configuration
            </Button>
            <Typography variant="sigma" textColor="neutral600">
              Note: Google Pay configuration is used for Google Pay payment requests. Make sure to configure the correct card networks, authentication methods, and merchant information for your region.
            </Typography>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default GooglePayConfigPanel;

