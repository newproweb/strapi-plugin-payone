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
      return Promise.reject(new Error("Token is missing"));
    }
    setApplePayToken(token);
    try {
      await onPreauthorization(token);
      return Promise.resolve();
    } catch (error) {
      console.error("[Apple Pay] Error in preauthorization:", error);
      return Promise.reject(error);
    }
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

