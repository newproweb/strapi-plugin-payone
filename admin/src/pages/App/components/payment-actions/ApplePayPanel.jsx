import * as React from "react";
import { Box, Typography } from "@strapi/design-system";
import PaymentMethodSelector from "./PaymentMethodSelector";
import AuthorizationForm from "./AuthorizationForm";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const ApplePayOnlyPanel = ({
  onNavigateToConfig,
  isLiveMode,
  paymentActions,
  settings,
}) => {
  const { t } = usePluginTranslations();
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
        ⚠️ {t("applePayPanel.warning", "Apple Pay can only be tested on a production domain with HTTPS and Live mode. Testing in Strapi admin panel is not supported. Please test Apple Pay on your production website.")}
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
