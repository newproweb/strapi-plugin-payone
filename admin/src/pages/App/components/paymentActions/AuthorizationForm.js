import React from "react";
import { Box, Flex, Typography, TextInput, Button } from "@strapi/design-system";
import { Play } from "@strapi/icons";
import GooglePayButton from "../GooglePaybutton";

const AuthorizationForm = ({
  paymentAmount,
  setPaymentAmount,
  authReference,
  setAuthReference,
  isProcessingPayment,
  onAuthorization,
  paymentMethod,
  settings,
  googlePayToken,
  setGooglePayToken
}) => {
  const handleGooglePayToken = (token, paymentData) => {
    if (!token) {
      return;
    }
    setGooglePayToken(token);
    onAuthorization(token);
  };

  const handleGooglePayError = (error) => {
    if (onError) {
      onError(error);
    }
  };
  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Flex direction="row" gap={2}>
        <Typography variant="omega" fontWeight="semiBold" textColor="neutral800" className="payment-form-title">
          Authorization
        </Typography>
        <Typography variant="pi" textColor="neutral600" className="payment-form-description">
          Authorize and capture an amount immediately.
        </Typography>
      </Flex>

      <Flex gap={4} wrap="wrap">
        <TextInput
          label="Amount (in cents) *"
          name="authAmount"
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
          name="authReference"
          value={authReference}
          onChange={(e) => setAuthReference(e.target.value)}
          placeholder="Enter reference"
          hint="Reference for this transaction"
          required
          className="payment-input"
          style={{ flex: 1, minWidth: "250px" }}
        />
      </Flex>

      {paymentMethod === "gpp" ? (
        <GooglePayButton
          amount={paymentAmount}
          currency="EUR"
          onTokenReceived={handleGooglePayToken}
          onError={handleGooglePayError}
          settings={settings}
        />
      ) : (
        <Button
          variant="default"
          onClick={onAuthorization}
          loading={isProcessingPayment}
          startIcon={<Play />}
          className="payment-button payment-button-primary"
          disabled={!paymentAmount.trim() || !authReference.trim()}
        >
          Process Authorization
        </Button>
      )}
    </Flex>
  );
};

export default AuthorizationForm;

