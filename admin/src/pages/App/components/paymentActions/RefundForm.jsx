import React from "react";
import { Box, Flex, Typography, TextInput, Button } from "@strapi/design-system";
import { Play } from "@strapi/icons";

const RefundForm = ({
  paymentAmount,
  setPaymentAmount,
  refundTxid,
  setRefundTxid,
  refundSequenceNumber,
  setRefundSequenceNumber,
  refundReference,
  setRefundReference,
  isProcessingPayment,
  onRefund
}) => {
  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Flex direction="row" gap={2}>
        <Typography variant="omega" fontWeight="semiBold" textColor="neutral800" className="payment-form-title">
          Refund
        </Typography>
        <Typography variant="pi" textColor="neutral600" className="payment-form-description">
          Refund a previously captured amount.
        </Typography>
      </Flex>

      <Flex gap={4} wrap="wrap">
        <TextInput
          label="Transaction ID"
          name="refundTxid"
          value={refundTxid}
          onChange={(e) => setRefundTxid(e.target.value)}
          placeholder="Enter TxId from capture"
          hint="Transaction ID from a previous capture"
          className="payment-input"
          style={{ flex: 1, minWidth: "200px" }}
        />

        <TextInput
          label="Sequence Number"
          name="refundSequenceNumber"
          value={refundSequenceNumber}
          onChange={(e) => setRefundSequenceNumber(e.target.value)}
          placeholder="2"
          hint="Sequence number for this refund (1-127) and by default for first 2"
          className="payment-input"
          style={{ flex: 1, minWidth: "200px" }}
        />

        <TextInput
          label="Amount (in cents)"
          name="refundAmount"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder="1000"
          hint="Amount in cents to refund (will be negative)"
          className="payment-input"
          style={{ flex: 1, minWidth: "200px" }}
        />

        <TextInput
          label="Reference"
          name="refundReference"
          value={refundReference}
          onChange={(e) => setRefundReference(e.target.value)}
          placeholder="Optional reference"
          hint="Optional reference for this refund"
          className="payment-input"
          style={{ flex: 1, minWidth: "200px" }}
        />
      </Flex>

      <Button
        variant="default"
        onClick={onRefund}
        loading={isProcessingPayment}
        startIcon={<Play />}
        style={{ maxWidth: '200px' }}
        className="payment-button payment-button-primary"
        disabled={!refundTxid.trim() || !paymentAmount.trim()}
      >
        Process Refund
      </Button>
    </Flex>
  );
};

export default RefundForm;

