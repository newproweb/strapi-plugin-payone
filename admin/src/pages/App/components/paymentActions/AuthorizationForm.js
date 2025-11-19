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
    <Box>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Box>
          <Typography variant="omega" fontWeight="semiBold" textColor="neutral800">
            Authorization
          </Typography>
          <br />
          <Typography variant="pi" textColor="neutral600" marginTop={1}>
            Authorize and capture an amount immediately.
          </Typography>
        </Box>

        <Flex gap={4}>
          <TextInput
            label="Amount (in cents) *"
            name="authAmount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Enter amount (e.g., 1000 for €10.00)"
            hint="Amount in cents (e.g., 1000 = €10.00)"
            required
            style={{ flex: 1 }}
          />

          <TextInput
            label="Reference *"
            name="authReference"
            value={authReference}
            onChange={(e) => setAuthReference(e.target.value)}
            placeholder="Enter reference"
            hint="Reference for this transaction"
            required
            style={{ flex: 1 }}
          />
        </Flex>

        <Button
          variant="default"
          onClick={onAuthorization}
          loading={isProcessingPayment}
          startIcon={<Play />}
          fullWidth={false}
          disabled={!paymentAmount.trim() || !authReference.trim()}
        >
          Process Authorization
        </Button>
      </Flex>
    </Box>
  );
};

export default AuthorizationForm;

