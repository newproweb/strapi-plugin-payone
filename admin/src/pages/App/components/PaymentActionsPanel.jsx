import React from "react";
import { Box, Flex, Typography } from "@strapi/design-system";
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
  onRefund,
  settings,
  googlePayToken,
  setGooglePayToken,
  applePayToken,
  setApplePayToken,
  cardtype,
  setCardtype,
  cardpan,
  setCardpan,
  cardexpiredate,
  setCardexpiredate,
  cardcvc2,
  setCardcvc2,
  onNavigateToConfig,
}) => {
  const mode = (settings?.mode || "test").toLowerCase();
  const isLiveMode = mode === "live";

  return (
    <Box
      className="payment-container"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
    >
      <Flex direction="column" alignItems="stretch" gap={6}>
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <Typography
            variant="beta"
            as="h2"
            className="payment-title"
            style={{ fontSize: "20px", marginBottom: "4px" }}
          >
            Payment Actions
          </Typography>
          <Typography
            variant="pi"
            textColor="neutral600"
            className="payment-subtitle"
            style={{ fontSize: "14px" }}
          >
            Process payments, captures, and refunds with multiple payment
            methods
          </Typography>
          {isLiveMode && (
            <Typography
              variant="pi"
              textColor="danger600"
              style={{ fontSize: "14px", marginTop: "8px", fontWeight: "bold" }}
            >
              ⚠️ Payment Actions are disabled in live mode for security reasons.
              Please use test mode for testing.
            </Typography>
          )}
        </Box>

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          captureMode={captureMode}
          setCaptureMode={setCaptureMode}
          onNavigateToConfig={onNavigateToConfig}
          settings={settings}
        />

        <hr className="payment-divider" />

        <Box
          className="payment-form-section"
          style={{
            opacity: isLiveMode ? 0.5 : 1,
            pointerEvents: isLiveMode ? "none" : "auto",
          }}
        >
          <PreauthorizationForm
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            preauthReference={preauthReference}
            setPreauthReference={setPreauthReference}
            isProcessingPayment={isProcessingPayment}
            onPreauthorization={onPreauthorization}
            paymentMethod={paymentMethod}
            settings={settings}
            googlePayToken={googlePayToken}
            setGooglePayToken={setGooglePayToken}
            applePayToken={applePayToken}
            setApplePayToken={setApplePayToken}
            cardtype={cardtype}
            setCardtype={setCardtype}
            cardpan={cardpan}
            setCardpan={setCardpan}
            cardexpiredate={cardexpiredate}
            setCardexpiredate={setCardexpiredate}
            cardcvc2={cardcvc2}
            setCardcvc2={setCardcvc2}
            isLiveMode={isLiveMode}
          />
        </Box>

        <hr className="payment-divider" />

        <Box
          className="payment-form-section"
          style={{
            opacity: isLiveMode ? 0.5 : 1,
            pointerEvents: isLiveMode ? "none" : "auto",
          }}
        >
          <AuthorizationForm
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            authReference={authReference}
            setAuthReference={setAuthReference}
            isProcessingPayment={isProcessingPayment}
            onAuthorization={onAuthorization}
            paymentMethod={paymentMethod}
            settings={settings}
            googlePayToken={googlePayToken}
            setGooglePayToken={setGooglePayToken}
            applePayToken={applePayToken}
            setApplePayToken={setApplePayToken}
            cardtype={cardtype}
            setCardtype={setCardtype}
            cardpan={cardpan}
            setCardpan={setCardpan}
            cardexpiredate={cardexpiredate}
            setCardexpiredate={setCardexpiredate}
            cardcvc2={cardcvc2}
            setCardcvc2={setCardcvc2}
            isLiveMode={isLiveMode}
          />
        </Box>

        <hr className="payment-divider" />

        <Box
          className="payment-form-section"
          style={{
            opacity: isLiveMode ? 0.5 : 1,
            pointerEvents: isLiveMode ? "none" : "auto",
          }}
        >
          <CaptureForm
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            captureTxid={captureTxid}
            setCaptureTxid={setCaptureTxid}
            isProcessingPayment={isProcessingPayment}
            onCapture={onCapture}
          />
        </Box>

        <hr className="payment-divider" />

        <Box
          className="payment-form-section"
          style={{
            opacity: isLiveMode ? 0.5 : 1,
            pointerEvents: isLiveMode ? "none" : "auto",
          }}
        >
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
        </Box>

        <hr className="payment-divider" />

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
