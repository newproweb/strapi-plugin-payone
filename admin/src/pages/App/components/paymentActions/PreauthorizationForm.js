import React from "react";
import { Box, Flex, Typography, TextInput, Button } from "@strapi/design-system";
import { Play } from "@strapi/icons";
import GooglePayButton from "../GooglePaybutton";
import ApplePayButton from "../ApplePayButton";
import CardDetailsInput from "./CardDetailsInput";

const PreauthorizationForm = ({
  paymentAmount,
  setPaymentAmount,
  preauthReference,
  setPreauthReference,
  isProcessingPayment,
  onPreauthorization,
  paymentMethod,
  settings,
  googlePayToken,
  setGooglePayToken,
  applePayToken,
  setApplePayToken,
  cardtype,
  setCardtype,
  cardpan,
  setCardpan,
  cardexpiredate,
  setCardexpiredate,
  cardcvc2,
  setCardcvc2,
  isLiveMode = false
}) => {
  const handleGooglePayToken = (token, paymentData) => {
    if (!token) {
      return;
    }
    setGooglePayToken(token);
    onPreauthorization(token);
  };

  const handleGooglePayError = (error) => {
    if (onError) {
      onError(error);
    }
  };

  const handleApplePayToken = async (token, paymentData) => {
    if (!token) {
      console.error("[Apple Pay] Token is missing in handleApplePayToken");
      return Promise.reject(new Error("Token is missing"));
    }

    console.log("[Apple Pay] handleApplePayToken called with token:", {
      hasToken: !!token,
      tokenLength: token?.length,
      paymentData: !!paymentData
    });

    // IMPORTANT: Set token in state immediately (synchronously)
    // This ensures the token is saved before the dialog closes
    setApplePayToken(token);

    console.log("[Apple Pay] Token saved to state successfully");

    // Don't call onPreauthorization immediately
    // Let the user manually trigger the payment using the button
    // This prevents the dialog from closing prematurely if there's an error
    // The dialog will close with success, and the user will see the "Process Preauthorization" button

    // Return success immediately so the dialog closes properly
    // The actual payment processing will happen when the user clicks the button
    return Promise.resolve({
      success: true,
      message: "Token received successfully. Please click 'Process Preauthorization' to complete the payment."
    });
  };

  const handleApplePayError = (error) => {
    if (onError) {
      onError(error);
    }
  };
  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Flex direction="row" gap={2}>
        <Typography variant="omega" fontWeight="semiBold" textColor="neutral800" className="payment-form-title">
          Preauthorization
        </Typography>
        <Typography variant="pi" textColor="neutral600" className="payment-form-description">
          Reserve an amount on a credit card without capturing it immediately.
        </Typography>
      </Flex>

      <Flex gap={4} wrap="wrap">
        <TextInput
          label="Amount (in cents) *"
          name="paymentAmount"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder="Enter amount (e.g., 1000 for €10.00)"
          hint="Amount in cents (e.g., 1000 = €10.00)"
          required
          className="payment-input"
          style={{ flex: 1, minWidth: "250px" }}
        />

        <TextInput
          label="Reference *"
          name="preauthReference"
          value={preauthReference}
          onChange={(e) => setPreauthReference(e.target.value)}
          placeholder="Auto-generated if empty"
          hint="Reference will be auto-generated if left empty"
          className="payment-input"
          style={{ flex: 1, minWidth: "250px" }}
        />
      </Flex>

      {paymentMethod === "cc" && settings?.enable3DSecure && (
        <Box marginTop={4}>
          <CardDetailsInput
            cardtype={cardtype}
            setCardtype={setCardtype}
            cardpan={cardpan}
            setCardpan={setCardpan}
            cardexpiredate={cardexpiredate}
            setCardexpiredate={setCardexpiredate}
            cardcvc2={cardcvc2}
            setCardcvc2={setCardcvc2}
          />
        </Box>
      )}

      {paymentMethod === "gpp" ? (
        <GooglePayButton
          amount={paymentAmount}
          currency="EUR"
          onTokenReceived={handleGooglePayToken}
          onError={handleGooglePayError}
          settings={settings}
        />
      ) : paymentMethod === "apl" ? (
        <Box>
          <ApplePayButton
            amount={paymentAmount}
            currency="EUR"
            onTokenReceived={handleApplePayToken}
            onError={handleApplePayError}
            settings={settings}
          />
          {applePayToken && (
            <Box marginTop={3} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
              <Typography variant="pi" textColor="success600" style={{ marginBottom: "8px", fontWeight: "bold" }}>
                ✓ Apple Pay token received. You can now process the preauthorization:
              </Typography>
              <Button
                variant="default"
                onClick={() => onPreauthorization(applePayToken)}
                loading={isProcessingPayment}
                startIcon={<Play />}
                style={{ maxWidth: '200px' }}
                disabled={!paymentAmount.trim() || !preauthReference.trim() || isLiveMode}
                className="payment-button payment-button-primary"
              >
                Process Preauthorization
              </Button>
            </Box>
          )}
          {!applePayToken && (
            <Box marginTop={3} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
              <Typography variant="pi" textColor="neutral600" style={{ marginBottom: "8px" }}>
                Apple Pay is not available on localhost. You can test the payment flow without Apple Pay token:
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Button
          variant="default"
          onClick={onPreauthorization}
          loading={isProcessingPayment}
          startIcon={<Play />}
          style={{ maxWidth: '200px' }}
          className="payment-button payment-button-primary"
          disabled={
            !paymentAmount.trim() ||
            (paymentMethod === "cc" &&
              settings?.enable3DSecure !== false &&
              (!cardtype || !cardpan || !cardexpiredate || !cardcvc2)) ||
            isLiveMode
          }
        >
          Process Preauthorization
        </Button>
      )}
    </Flex>
  );
};

export default PreauthorizationForm;

