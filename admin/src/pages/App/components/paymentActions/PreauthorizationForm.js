import React from "react";
import { Box, Flex, Typography, TextInput, Button } from "@strapi/design-system";
import { Play } from "@strapi/icons";

const PreauthorizationForm = ({
  paymentAmount,
  setPaymentAmount,
  preauthReference,
  setPreauthReference,
  isProcessingPayment,
  onPreauthorization
}) => {
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
          placeholder="Enter reference"
          hint="Reference for this transaction"
          required
          className="payment-input"
          style={{ flex: 1, minWidth: "250px" }}
        />
      </Flex>

      <Button
        variant="default"
        onClick={onPreauthorization}
        loading={isProcessingPayment}
        startIcon={<Play />}
        className="payment-button payment-button-primary"
        disabled={!paymentAmount.trim() || !preauthReference.trim()}
      >
        Process Preauthorization
      </Button>
    </Flex>
  );
};

export default PreauthorizationForm;

