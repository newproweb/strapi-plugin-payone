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
    <Box>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Box>
          <Typography variant="omega" fontWeight="semiBold" textColor="neutral800">
            Refund
          </Typography>
          <br />
          <Typography variant="pi" textColor="neutral600" marginTop={1}>
            Refund a previously captured amount.
          </Typography>
        </Box>

        <Flex gap={4}>
          <TextInput
            label="Transaction ID"
            name="refundTxid"
            value={refundTxid}
            onChange={(e) => setRefundTxid(e.target.value)}
            placeholder="Enter TxId from capture"
            hint="Transaction ID from a previous capture"
            style={{ flex: 1 }}
          />

          <TextInput
            label="Sequence Number"
            name="refundSequenceNumber"
            value={refundSequenceNumber}
            onChange={(e) => setRefundSequenceNumber(e.target.value)}
            placeholder="2"
            hint="Sequence number for this refund (1-127) and by default for first 2"
            style={{ flex: 1 }}
          />

          <TextInput
            label="Amount (in cents)"
            name="refundAmount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="1000"
            hint="Amount in cents to refund (will be negative)"
            style={{ flex: 1 }}
          />

          <TextInput
            label="Reference"
            name="refundReference"
            value={refundReference}
            onChange={(e) => setRefundReference(e.target.value)}
            placeholder="Optional reference"
            hint="Optional reference for this refund"
            style={{ flex: 1 }}
          />
        </Flex>

        <Button
          variant="default"
          onClick={onRefund}
          loading={isProcessingPayment}
          startIcon={<Play />}
          fullWidth={false}
          disabled={!refundTxid.trim() || !paymentAmount.trim()}
        >
          Process Refund
        </Button>
      </Flex>
    </Box>
  );
};

export default RefundForm;

