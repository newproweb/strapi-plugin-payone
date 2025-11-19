import React from "react";
import { Box, Flex, Typography, TextInput, Button } from "@strapi/design-system";
import { Play } from "@strapi/icons";

const AuthorizationForm = ({
  paymentAmount,
  setPaymentAmount,
  authReference,
  setAuthReference,
  isProcessingPayment,
  onAuthorization
}) => {
  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Box>
        <Typography variant="omega" fontWeight="semiBold" textColor="neutral800" className="payment-form-title">
          Authorization
        </Typography>
        <Typography variant="pi" textColor="neutral600" className="payment-form-description">
          Authorize and capture an amount immediately.
        </Typography>
      </Box>

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
    </Flex>
  );
};

export default AuthorizationForm;

