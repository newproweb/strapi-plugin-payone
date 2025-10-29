import React from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Stack,
  Typography,
  TextInput,
  Alert
} from "@strapi/design-system";
import { Play } from "@strapi/icons";
import StatusBadge from "./StatusBadge";
import { formatTransactionData } from "../../utils/formatTransactionData";

const PaymentActionsPanel = ({
  paymentAmount,
  setPaymentAmount,
  preauthReference,
  setPreauthReference,
  authReference,
  setAuthReference,
  captureTxid,
  setCaptureTxid,
  refundTxid,
  setRefundTxid,
  refundSequenceNumber,
  setRefundSequenceNumber,
  refundReference,
  setRefundReference,
  isProcessingPayment,
  paymentError,
  paymentResult,
  onPreauthorization,
  onAuthorization,
  onCapture,
  onRefund
}) => {
  return (
    <Box
      background="neutral0"
      hasRadius
      shadow="filterShadow"
      paddingTop={6}
      paddingBottom={6}
      paddingLeft={7}
      paddingRight={7}
    >
      <Flex direction="column" alignItems="stretch" gap={6}>
        <Typography variant="beta" as="h2">
          Payment Actions
        </Typography>

        {/* Preauthorization */}
        <Box>
          <Flex direction="column" alignItems="stretch" gap={4}>
            <Typography variant="delta" as="h3">
              Preauthorization
            </Typography>
            <Typography variant="pi" textColor="neutral600">
              Reserve an amount on a credit card without capturing it
              immediately.
            </Typography>

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

        <Divider />

        {/* Authorization */}
        <Box>
          <Flex direction="column" alignItems="stretch" gap={4}>
            <Typography variant="delta" as="h3">
              Authorization
            </Typography>
            <Typography variant="pi" textColor="neutral600">
              Authorize and capture an amount immediately.
            </Typography>

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

        <Divider />

        {/* Capture */}
        <Box>
          <Flex direction="column" alignItems="stretch" gap={4}>
            <Typography variant="delta" as="h3">
              Capture
            </Typography>
            <Typography variant="pi" textColor="neutral600">
              Capture a previously authorized amount. Note: Reference parameter
              is not supported by Payone capture.
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

        <Divider />

        {/* Refund */}
        <Box>
          <Flex direction="column" alignItems="stretch" gap={4}>
            <Typography variant="delta" as="h3">
              Refund
            </Typography>
            <Typography variant="pi" textColor="neutral600">
              Refund a previously captured amount.
            </Typography>

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

        <Divider />

        {paymentError && (
          <Alert variant="danger" title="Error">
            {paymentError}
          </Alert>
        )}

        {paymentResult && (
          <Card>
            <CardBody>
              <Stack spacing={4}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Typography variant="delta" as="h3">
                    Payment Result
                  </Typography>
                  {paymentResult.Status && (
                    <StatusBadge status={paymentResult.Status} />
                  )}
                </Flex>

                <Divider />

                <Box>
                  <Stack spacing={3}>
                    {formatTransactionData(paymentResult).map((item, index) => (
                      <Flex
                        key={index}
                        justifyContent="space-between"
                        alignItems="start"
                      >
                        <Typography
                          variant="pi"
                          textColor="neutral600"
                          style={{ minWidth: "200px" }}
                        >
                          {item.key}:
                        </Typography>
                        <Typography
                          variant="pi"
                          style={{ flex: 1, textAlign: "right" }}
                        >
                          {item.value}
                        </Typography>
                      </Flex>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        )}

        <Box paddingTop={4}>
          <Typography variant="sigma" textColor="neutral600">
            Note: These payment actions allow you to test the complete payment
            flow: Preauthorization → Capture → Refund. Make sure to use valid
            Transaction IDs for capture and refund operations.
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

export default PaymentActionsPanel;