import { Box, Button, Typography } from "@strapi/design-system";
import { Play } from "@strapi/icons";
import GooglePayButton from "../../GooglePaybutton";
import ApplePayBtn from "../../ApplePayBtn";

const AuthorizationPaymentButtons = ({
  paymentMethod,
  paymentAmount,
  authReference,
  isProcessingPayment,
  onAuthorization,
  settings,
  handleGooglePayToken,
  handleGooglePayError,
  handleApplePayToken,
  handleApplePayError,
  applePayToken,
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
        <ApplePayBtn
          amount={paymentAmount}
          onTokenReceived={handleApplePayToken}
          onError={handleApplePayError}
          settings={settings}
        />
        {applePayToken && (
          <Box
            marginTop={3}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <Typography
              variant="pi"
              textColor="success600"
              style={{ marginBottom: "8px", fontWeight: "bold" }}
            >
              ✓ Apple Pay token received. You can now process the
              authorization:
            </Typography>
            <Button
              variant="default"
              onClick={() => onAuthorization(applePayToken)}
              loading={isProcessingPayment}
              startIcon={<Play />}
              style={{ maxWidth: "200px" }}
              disabled={!paymentAmount.trim() || !authReference.trim()}
              className="payment-button payment-button-primary"
            >
              Process Authorization
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Button
      variant="default"
      onClick={onAuthorization}
      loading={isProcessingPayment}
      startIcon={<Play />}
      style={{ maxWidth: "200px" }}
      className="payment-button payment-button-primary"
      disabled={isDisabled}
    >
      Process Authorization
    </Button>
  );
};

export default AuthorizationPaymentButtons;

