import * as React from "react";
import { Box, Flex, Typography, Accordion } from "@strapi/design-system";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PreauthorizationForm from "./PreauthorizationForm";
import AuthorizationForm from "./AuthorizationForm";
import CaptureForm from "./CaptureForm";
import RefundForm from "./RefundForm";
import PaymentResult from "./PaymentResult";
import ApplePayPanel from "./ApplePayPanel";

const PaymentActionsPanel = ({
  onNavigateToConfig,
  settings,
  paymentActions,
}) => {
  const mode = (settings?.settings?.mode || "test").toLowerCase();
  const isLiveMode = mode === "live";

  React.useEffect(() => {
    if (isLiveMode && paymentActions.paymentState.paymentMethod !== "apl") {
      paymentActions.handleFieldChange("paymentMethod", "apl");
    }
  }, [
    isLiveMode,
    paymentActions.paymentState.paymentMethod,
    paymentActions.handleFieldChange,
  ]);

  if (isLiveMode && paymentActions.paymentState.paymentMethod !== "apl") {
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

  if (paymentActions.paymentState.paymentMethod === "apl") {
    return (
      <ApplePayPanel
        onNavigateToConfig={onNavigateToConfig}
        isLiveMode={isLiveMode}
        paymentActions={paymentActions}
        settings={settings}
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
          paymentActions={paymentActions}
          onNavigateToConfig={onNavigateToConfig}
          isLiveMode={isLiveMode}
        />

        <Accordion.Root>
          {/* Preauthorization */}
          <Accordion.Item value="preauthorization">
            <Accordion.Header>
              <Accordion.Trigger>Preauthorization</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <Box
                className="payment-form-section"
                style={{
                  opacity: isLiveMode ? 0.5 : 1,
                  pointerEvents: isLiveMode ? "none" : "auto",
                }}
              >
                <PreauthorizationForm
                  paymentActions={paymentActions}
                  settings={settings}
                />
              </Box>
            </Accordion.Content>
          </Accordion.Item>
          {/* Authorization */}
          <Accordion.Item value="authorization">
            <Accordion.Header>
              <Accordion.Trigger>Authorization</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <Box className="payment-form-section">
                <AuthorizationForm
                  paymentActions={paymentActions}
                  settings={settings}
                />
              </Box>
            </Accordion.Content>
          </Accordion.Item>
          {/* Capture */}
          <Accordion.Item value="capture">
            <Accordion.Header>
              <Accordion.Trigger>Capture</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <Box
                className="payment-form-section"
                style={{
                  opacity: isLiveMode ? 0.5 : 1,
                  pointerEvents: isLiveMode ? "none" : "auto",
                }}
              >
                <CaptureForm paymentActions={paymentActions} />
              </Box>
            </Accordion.Content>
          </Accordion.Item>
          {/* Refund */}
          <Accordion.Item value="refund">
            <Accordion.Header>
              <Accordion.Trigger>Refund</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <Box
                className="payment-form-section"
                style={{
                  opacity: isLiveMode ? 0.5 : 1,
                  pointerEvents: isLiveMode ? "none" : "auto",
                }}
              >
                <RefundForm paymentActions={paymentActions} />
              </Box>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>

        <hr className="payment-divider" />

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
