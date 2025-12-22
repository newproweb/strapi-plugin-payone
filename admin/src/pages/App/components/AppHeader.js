import React from "react";
import { HeaderLayout, Box, Typography, Button } from "@strapi/design-system";
import { Check, ArrowLeft } from "@strapi/icons";
import { useHistory, useLocation } from "react-router-dom";
import pluginId from "../../../pluginId";

const AppHeader = ({ activeTab, isSaving, onSave }) => {
  const history = useHistory();
  const location = useLocation();
  const isApplePayConfigPage = location.pathname.includes('/apple-pay-config');

  return (
    <HeaderLayout
      title={
        <Box>
          <Typography variant="alpha" as="h1" fontWeight="bold" className="payment-title">
            {isApplePayConfigPage ? "Apple Pay Configuration" : "Payone Provider"}
          </Typography>
          <Typography variant="pi" marginTop={2} className="payment-subtitle">
            {isApplePayConfigPage 
              ? "Configure Apple Pay settings for your payment gateway"
              : "Configure your Payone integration and manage payment transactions"
            }
          </Typography>
        </Box>
      }
      primaryAction={
        isApplePayConfigPage ? (
          <Button
            onClick={() => history.push(`/plugins/${pluginId}`)}
            startIcon={<ArrowLeft />}
            size="L"
            variant="secondary"
          >
            Back to Main
          </Button>
        ) : activeTab === 0 ? (
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

