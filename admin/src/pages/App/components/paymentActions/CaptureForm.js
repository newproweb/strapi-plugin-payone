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
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Flex direction="row" gap={2}>
        <Typography variant="omega" fontWeight="semiBold" textColor="neutral800" className="payment-form-title">
          Capture
        </Typography>
        <Typography variant="pi" textColor="neutral600" className="payment-form-description">
          Capture a previously authorized amount. Note: Reference parameter is
          not supported by Payone capture.
        </Typography>
      </Flex>

      <Flex gap={4} wrap="wrap">
        <TextInput
          label="Transaction ID"
          name="captureTxid"
          value={captureTxid}
          onChange={(e) => setCaptureTxid(e.target.value)}
          placeholder="Enter TxId from preauthorization"
          hint="Transaction ID from a previous preauthorization"
          className="payment-input"
          style={{ flex: 1, minWidth: "250px" }}
        />

        <TextInput
          label="Amount (in cents)"
          name="captureAmount"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder="1000"
          hint="Amount in cents to capture"
          className="payment-input"
          style={{ flex: 1, minWidth: "250px" }}
        />
      </Flex>

      <Button
        variant="default"
        onClick={onCapture}
        loading={isProcessingPayment}
        startIcon={<Play />}
        style={{ maxWidth: '200px' }}
        className="payment-button payment-button-primary"
        disabled={!captureTxid.trim() || !paymentAmount.trim()}
      >
        Process Capture
      </Button>
    </Flex>
  );
};

export default CaptureForm;

