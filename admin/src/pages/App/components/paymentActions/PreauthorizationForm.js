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
    <Box>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Box>
          <Typography variant="omega" fontWeight="semiBold" textColor="neutral800">
            Preauthorization
          </Typography>
          <br />
          <Typography variant="pi" textColor="neutral600" marginTop={1}>
            Reserve an amount on a credit card without capturing it immediately.
          </Typography>
        </Box>

        <Flex gap={4}>
          <TextInput
            label="Amount (in cents) *"
            name="paymentAmount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Enter amount (e.g., 1000 for €10.00)"
            hint="Amount in cents (e.g., 1000 = €10.00)"
            required
            style={{ flex: 1 }}
          />

          <TextInput
            label="Reference *"
            name="preauthReference"
            value={preauthReference}
            onChange={(e) => setPreauthReference(e.target.value)}
            placeholder="Enter reference"
            hint="Reference for this transaction"
            required
            style={{ flex: 1 }}
          />
        </Flex>

        <Button
          variant="default"
          onClick={onPreauthorization}
          loading={isProcessingPayment}
          startIcon={<Play />}
          fullWidth={false}
          disabled={!paymentAmount.trim() || !preauthReference.trim()}
        >
          Process Preauthorization
        </Button>
      </Flex>
    </Box>
  );
};

export default PreauthorizationForm;

