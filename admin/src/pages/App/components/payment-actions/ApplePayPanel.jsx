import * as React from "@strapi/strapi/admin";
import { Box, Typography } from "@strapi/design-system";
import PaymentMethodSelector from "./PaymentMethodSelector";
import AuthorizationForm from "./AuthorizationForm";

const ApplePayOnlyPanel = ({
  onNavigateToConfig,
  isLiveMode,
  paymentActions,
  settings,
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
        paymentActions={paymentActions}
        onNavigateToConfig={onNavigateToConfig}
        isLiveMode={isLiveMode}
      />

      <hr className="payment-divider" />

      <AuthorizationForm paymentActions={paymentActions} settings={settings} />
    </Box>
  );
};

export default ApplePayOnlyPanel;
