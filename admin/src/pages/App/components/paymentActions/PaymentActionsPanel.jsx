import React, { useState } from "react";
import {
  Box,
  Flex,
  Typography,
  Accordion,
  AccordionToggle,
  AccordionContent,
} from "@strapi/design-system";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PreauthorizationForm from "./preauthorization/PreauthorizationForm";
import AuthorizationForm from "./authorization/AuthorizationForm";
import CaptureForm from "./CaptureForm";
import RefundForm from "./RefundForm";
import PaymentResult from "./PaymentResult";
import ApplePayPanel from "./ApplePayPanel";

const PaymentActionsPanel = ({
  paymentActions,
  settings,
  onNavigateToConfig,
}) => {
  const mode = (settings?.mode || "test").toLowerCase();
  const isLiveMode = mode === "live";

  const [expandedAccordions, setExpandedAccordions] = useState({
    preauthorization: false,
    authorization: false,
    capture: false,
    refund: false,
  });

  const toggleAccordion = (key) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  React.useEffect(() => {
    if (isLiveMode && paymentActions.paymentMethod !== "apl") {
      paymentActions.setPaymentMethod("apl");
    }
  }, [isLiveMode, paymentActions.paymentMethod]);

  if (isLiveMode && paymentActions.paymentMethod !== "apl") {
    return (
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginTop: "44px",
        }}
      >
        <Typography variant="pi" textColor="neutral600">
          Test Payments are only works in test mode.
        </Typography>
        <Typography variant="pi" textColor="neutral600">
          Please switch to test mode in plugin settings to use test payments.
        </Typography>
      </Box>
    );
  }

  if (paymentActions.paymentMethod === "apl") {
    return (
      <ApplePayPanel
        paymentAmount={paymentActions.paymentAmount}
        setPaymentAmount={paymentActions.setPaymentAmount}
        authReference={paymentActions.authReference}
        setAuthReference={paymentActions.setAuthReference}
        isProcessingPayment={paymentActions.isProcessingPayment}
        onAuthorization={paymentActions.handleAuthorization}
        paymentMethod={paymentActions.paymentMethod}
        setPaymentMethod={paymentActions.setPaymentMethod}
        captureMode={paymentActions.captureMode}
        setCaptureMode={paymentActions.setCaptureMode}
        settings={settings}
        setGooglePayToken={paymentActions.setGooglePayToken}
        applePayToken={paymentActions.applePayToken}
        setApplePayToken={paymentActions.setApplePayToken}
        cardtype={paymentActions.cardtype}
        setCardtype={paymentActions.setCardtype}
        cardpan={paymentActions.cardpan}
        setCardpan={paymentActions.setCardpan}
        cardexpiredate={paymentActions.cardexpiredate}
        setCardexpiredate={paymentActions.setCardexpiredate}
        cardcvc2={paymentActions.cardcvc2}
        setCardcvc2={paymentActions.setCardcvc2}
        onNavigateToConfig={onNavigateToConfig}
        isLiveMode={isLiveMode}
        firstname={paymentActions.firstname}
        setFirstname={paymentActions.setFirstname}
        lastname={paymentActions.lastname}
        setLastname={paymentActions.setLastname}
        email={paymentActions.email}
        setEmail={paymentActions.setEmail}
        telephonenumber={paymentActions.telephonenumber}
        setTelephonenumber={paymentActions.setTelephonenumber}
        gender={paymentActions.gender}
        setGender={paymentActions.setGender}
        salutation={paymentActions.salutation}
        setSalutation={paymentActions.setSalutation}
        country={paymentActions.country}
        setCountry={paymentActions.setCountry}
        currency={paymentActions.currency}
        setCurrency={paymentActions.setCurrency}
        city={paymentActions.city}
        setCity={paymentActions.setCity}
        street={paymentActions.street}
        setStreet={paymentActions.setStreet}
        zip={paymentActions.zip}
        setZip={paymentActions.setZip}
      />
    );
  }

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
        </Box>

        <PaymentMethodSelector
          paymentMethod={paymentActions.paymentMethod}
          setPaymentMethod={paymentActions.setPaymentMethod}
          captureMode={paymentActions.captureMode}
          setCaptureMode={paymentActions.setCaptureMode}
          onNavigateToConfig={onNavigateToConfig}
          isLiveMode={isLiveMode}
        />

        <Accordion
          expanded={expandedAccordions.preauthorization}
          onToggle={() => toggleAccordion("preauthorization")}
        >
          <AccordionToggle title="Preauthorization" />
          <AccordionContent>
            <Box
              className="payment-form-section"
              style={{
                opacity: isLiveMode ? 0.5 : 1,
                pointerEvents: isLiveMode ? "none" : "auto",
              }}
            >
              <PreauthorizationForm
                paymentAmount={paymentActions.paymentAmount}
                setPaymentAmount={paymentActions.setPaymentAmount}
                preauthReference={paymentActions.preauthReference}
                setPreauthReference={paymentActions.setPreauthReference}
                isProcessingPayment={paymentActions.isProcessingPayment}
                onPreauthorization={paymentActions.handlePreauthorization}
                paymentMethod={paymentActions.paymentMethod}
                settings={settings}
                setGooglePayToken={paymentActions.setGooglePayToken}
                cardtype={paymentActions.cardtype}
                setCardtype={paymentActions.setCardtype}
                cardpan={paymentActions.cardpan}
                setCardpan={paymentActions.setCardpan}
                cardexpiredate={paymentActions.cardexpiredate}
                setCardexpiredate={paymentActions.setCardexpiredate}
                cardcvc2={paymentActions.cardcvc2}
                setCardcvc2={paymentActions.setCardcvc2}
                isLiveMode={isLiveMode}
                firstname={paymentActions.firstname}
                setFirstname={paymentActions.setFirstname}
                lastname={paymentActions.lastname}
                setLastname={paymentActions.setLastname}
                email={paymentActions.email}
                setEmail={paymentActions.setEmail}
                telephonenumber={paymentActions.telephonenumber}
                setTelephonenumber={paymentActions.setTelephonenumber}
                gender={paymentActions.gender}
                setGender={paymentActions.setGender}
                salutation={paymentActions.salutation}
                setSalutation={paymentActions.setSalutation}
                country={paymentActions.country}
                setCountry={paymentActions.setCountry}
                currency={paymentActions.currency}
                setCurrency={paymentActions.setCurrency}
                city={paymentActions.city}
                setCity={paymentActions.setCity}
                street={paymentActions.street}
                setStreet={paymentActions.setStreet}
                zip={paymentActions.zip}
                setZip={paymentActions.setZip}
              />
            </Box>
          </AccordionContent>
        </Accordion>

        <Accordion
          expanded={expandedAccordions.authorization}
          onToggle={() => toggleAccordion("authorization")}
        >
          <AccordionToggle title="Authorization" />
          <AccordionContent>
            <Box className="payment-form-section">
              <AuthorizationForm
                paymentAmount={paymentActions.paymentAmount}
                setPaymentAmount={paymentActions.setPaymentAmount}
                authReference={paymentActions.authReference}
                setAuthReference={paymentActions.setAuthReference}
                isProcessingPayment={paymentActions.isProcessingPayment}
                onAuthorization={paymentActions.handleAuthorization}
                paymentMethod={paymentActions.paymentMethod}
                settings={settings}
                setGooglePayToken={paymentActions.setGooglePayToken}
                applePayToken={paymentActions.applePayToken}
                setApplePayToken={paymentActions.setApplePayToken}
                cardtype={paymentActions.cardtype}
                setCardtype={paymentActions.setCardtype}
                cardpan={paymentActions.cardpan}
                setCardpan={paymentActions.setCardpan}
                cardexpiredate={paymentActions.cardexpiredate}
                setCardexpiredate={paymentActions.setCardexpiredate}
                cardcvc2={paymentActions.cardcvc2}
                setCardcvc2={paymentActions.setCardcvc2}
                firstname={paymentActions.firstname}
                setFirstname={paymentActions.setFirstname}
                lastname={paymentActions.lastname}
                setLastname={paymentActions.setLastname}
                email={paymentActions.email}
                setEmail={paymentActions.setEmail}
                telephonenumber={paymentActions.telephonenumber}
                setTelephonenumber={paymentActions.setTelephonenumber}
                gender={paymentActions.gender}
                setGender={paymentActions.setGender}
                salutation={paymentActions.salutation}
                setSalutation={paymentActions.setSalutation}
                country={paymentActions.country}
                setCountry={paymentActions.setCountry}
                currency={paymentActions.currency}
                setCurrency={paymentActions.setCurrency}
                city={paymentActions.city}
                setCity={paymentActions.setCity}
                street={paymentActions.street}
                setStreet={paymentActions.setStreet}
                zip={paymentActions.zip}
                setZip={paymentActions.setZip}
              />
            </Box>
          </AccordionContent>
        </Accordion>

        <Accordion
          expanded={expandedAccordions.capture}
          onToggle={() => toggleAccordion("capture")}
        >
          <AccordionToggle title="Capture" />
          <AccordionContent>
            <Box
              className="payment-form-section"
              style={{
                opacity: isLiveMode ? 0.5 : 1,
                pointerEvents: isLiveMode ? "none" : "auto",
              }}
            >
              <CaptureForm
                paymentAmount={paymentActions.paymentAmount}
                setPaymentAmount={paymentActions.setPaymentAmount}
                captureTxid={paymentActions.captureTxid}
                setCaptureTxid={paymentActions.setCaptureTxid}
                captureCurrency={paymentActions.captureCurrency}
                setCaptureCurrency={paymentActions.setCaptureCurrency}
                captureSequenceNumber={paymentActions.captureSequenceNumber}
                setCaptureSequenceNumber={
                  paymentActions.setCaptureSequenceNumber
                }
                captureMode={paymentActions.captureMode}
                setCaptureMode={paymentActions.setCaptureMode}
                paymentMethod={paymentActions.paymentMethod}
                isProcessingPayment={paymentActions.isProcessingPayment}
                onCapture={paymentActions.handleCapture}
              />
            </Box>
          </AccordionContent>
        </Accordion>

        <Accordion
          expanded={expandedAccordions.refund}
          onToggle={() => toggleAccordion("refund")}
        >
          <AccordionToggle title="Refund" />
          <AccordionContent>
            <Box
              className="payment-form-section"
              style={{
                opacity: isLiveMode ? 0.5 : 1,
                pointerEvents: isLiveMode ? "none" : "auto",
              }}
            >
              <RefundForm
                paymentAmount={paymentActions.paymentAmount}
                setPaymentAmount={paymentActions.setPaymentAmount}
                refundTxid={paymentActions.refundTxid}
                setRefundTxid={paymentActions.setRefundTxid}
                refundSequenceNumber={paymentActions.refundSequenceNumber}
                setRefundSequenceNumber={paymentActions.setRefundSequenceNumber}
                refundReference={paymentActions.refundReference}
                setRefundReference={paymentActions.setRefundReference}
                refundCurrency={paymentActions.refundCurrency}
                setRefundCurrency={paymentActions.setRefundCurrency}
                isProcessingPayment={paymentActions.isProcessingPayment}
                onRefund={paymentActions.handleRefund}
              />
            </Box>
          </AccordionContent>
        </Accordion>

        <PaymentResult
          paymentError={paymentActions.paymentError}
          paymentResult={paymentActions.paymentResult}
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
