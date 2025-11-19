import React from "react";
import { Box, Flex, Typography, TextInput, Button } from "@strapi/design-system";
import { Play } from "@strapi/icons";

const CaptureForm = ({
  paymentAmount,
  setPaymentAmount,
  captureTxid,
  setCaptureTxid,
  isProcessingPayment,
  onCapture
}) => {
  return (
    <Box>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Typography variant="delta" as="h3">
          Capture
        </Typography>
        <Typography variant="pi" textColor="neutral600">
          Capture a previously authorized amount. Note: Reference parameter is
          not supported by Payone capture.
        </Typography>

        <Flex gap={4}>
          <TextInput
            label="Transaction ID"
            name="captureTxid"
            value={captureTxid}
            onChange={(e) => setCaptureTxid(e.target.value)}
            placeholder="Enter TxId from preauthorization"
            hint="Transaction ID from a previous preauthorization"
            style={{ flex: 1 }}
          />

          <TextInput
            label="Amount (in cents)"
            name="captureAmount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="1000"
            hint="Amount in cents to capture"
            style={{ flex: 1 }}
          />
        </Flex>

        <Button
          variant="default"
          onClick={onCapture}
          loading={isProcessingPayment}
          startIcon={<Play />}
          fullWidth={false}
          disabled={!captureTxid.trim() || !paymentAmount.trim()}
        >
          Process Capture
        </Button>
      </Flex>
    </Box>
  );
};

export default CaptureForm;

