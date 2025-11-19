import React from "react";
import { HeaderLayout, Box, Typography, Button } from "@strapi/design-system";
import { Check } from "@strapi/icons";

const AppHeader = ({ activeTab, isSaving, onSave }) => {
  return (
    <HeaderLayout
      title={
        <Box>
          <Typography variant="alpha" as="h1" fontWeight="bold" className="payment-title">
            Payone Provider
          </Typography>
          <Typography variant="pi" marginTop={2} className="payment-subtitle">
            Configure your Payone integration and manage payment transactions
          </Typography>
        </Box>
      }
      primaryAction={
        activeTab === 0 ? (
          <Button
            loading={isSaving}
            onClick={onSave}
            startIcon={<Check />}
            size="L"
            variant="default"
            className="payment-button payment-button-success"
          >
            Save Configuration
          </Button>
        ) : null
      }
    />
  );
};

export default AppHeader;

