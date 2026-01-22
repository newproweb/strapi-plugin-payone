import { Box, Button, Typography } from "@strapi/design-system";
import { Play } from "@strapi/icons";
import GooglePayButton from "../../GooglePaybutton";

const PreauthorizationPaymentButtons = ({
  paymentMethod,
  paymentAmount,
  isProcessingPayment,
  onPreauthorization,
  settings,
  handleGooglePayToken,
  handleGooglePayError,
  isDisabled,
}) => {
  if (paymentMethod === "gpp") {
    return (
      <GooglePayButton
        amount={paymentAmount}
        currency="EUR"
        onTokenReceived={handleGooglePayToken}
        onError={handleGooglePayError}
        settings={settings}
      />
    );
  }

  if (paymentMethod === "apl") {
    return (
      <Box>
        <Typography variant="pi" textColor="neutral600">
          Apple Pay is only supported for Authorization, not Preauthorization.
        </Typography>
      </Box>
    );
  }

  return (
    <Button
      variant="default"
      onClick={onPreauthorization}
      loading={isProcessingPayment}
      startIcon={<Play />}
      style={{ maxWidth: "200px" }}
      className="payment-button payment-button-primary"
      disabled={isDisabled}
    >
      Process Preauthorization
    </Button>
  );
};

export default PreauthorizationPaymentButtons;

