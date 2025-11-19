import React from "react";
import { Box, Divider, Flex, Typography } from "@strapi/design-system";
import PaymentMethodSelector from "./paymentActions/PaymentMethodSelector";
import PreauthorizationForm from "./paymentActions/PreauthorizationForm";
import AuthorizationForm from "./paymentActions/AuthorizationForm";
import CaptureForm from "./paymentActions/CaptureForm";
import RefundForm from "./paymentActions/RefundForm";
import PaymentResult from "./paymentActions/PaymentResult";

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
  paymentMethod,
  setPaymentMethod,
  captureMode,
  setCaptureMode,
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

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          captureMode={captureMode}
          setCaptureMode={setCaptureMode}
        />

        <Divider />

        <PreauthorizationForm
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          preauthReference={preauthReference}
          setPreauthReference={setPreauthReference}
          isProcessingPayment={isProcessingPayment}
          onPreauthorization={onPreauthorization}
        />

        <Divider />

        <AuthorizationForm
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          authReference={authReference}
          setAuthReference={setAuthReference}
          isProcessingPayment={isProcessingPayment}
          onAuthorization={onAuthorization}
        />

        <Divider />

        <CaptureForm
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          captureTxid={captureTxid}
          setCaptureTxid={setCaptureTxid}
          isProcessingPayment={isProcessingPayment}
          onCapture={onCapture}
        />

        <Divider />

        <RefundForm
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          refundTxid={refundTxid}
          setRefundTxid={setRefundTxid}
          refundSequenceNumber={refundSequenceNumber}
          setRefundSequenceNumber={setRefundSequenceNumber}
          refundReference={refundReference}
          setRefundReference={setRefundReference}
          isProcessingPayment={isProcessingPayment}
          onRefund={onRefund}
        />

        <Divider />

        <PaymentResult
          paymentError={paymentError}
          paymentResult={paymentResult}
        />

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