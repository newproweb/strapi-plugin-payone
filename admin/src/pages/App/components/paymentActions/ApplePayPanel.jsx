import React from "react";
import { Box, Typography } from "@strapi/design-system";
import PaymentMethodSelector from "./PaymentMethodSelector";
import AuthorizationForm from "./AuthorizationForm";

const ApplePayOnlyPanel = ({
  paymentMethod,
  setPaymentMethod,
  captureMode,
  setCaptureMode,
  onNavigateToConfig,
}) => {
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "16px",
        marginTop: "24px",
        width: "100%",
      }}
    >
      <Typography
        variant="pi"
        textColor="warning600"
        style={{
          fontSize: "14px",
          marginTop: "12px",
          marginBottom: "12px",
          fontWeight: "bold",
        }}
      >
        ⚠️ Apple Pay can only be tested on a production domain with HTTPS and
        Live mode. Testing in Strapi admin panel is not supported. Please test
        Apple Pay on your production website.
      </Typography>

      <PaymentMethodSelector
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        captureMode={captureMode}
        setCaptureMode={setCaptureMode}
        onNavigateToConfig={onNavigateToConfig}
        isLiveMode={false}
      />
    </Box>
  );
};

export default ApplePayOnlyPanel;
