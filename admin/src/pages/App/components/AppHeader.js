import React from "react";
import { HeaderLayout, Box, Typography, Button } from "@strapi/design-system";
import { Check } from "@strapi/icons";

const AppHeader = ({ activeTab, isSaving, onSave }) => {
  return (
    <HeaderLayout
      title={
        <Box>
          <Typography variant="alpha" as="h1" fontWeight="bold">
            Payone Provider
          </Typography>
          <Typography variant="pi" marginTop={2}>
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
            style={{
              background: "#28a745",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600"
            }}
          >
            Save Configuration
          </Button>
        ) : null
      }
    />
  );
};

export default AppHeader;

