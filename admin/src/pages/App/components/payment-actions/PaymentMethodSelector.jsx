import * as React from "react";
import { Box, Flex, Typography, Link, Alert } from "@strapi/design-system";
import pluginId from "../../../../pluginId";
import {
  getPaymentMethodOptions,
  getPaymentMethodDisplayName,
  supportsCaptureMode,
  getCaptureModeOptions,
} from "../../../utils/paymentUtils";
import RenderInput from "../RenderInput";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const PaymentMethodSelector = ({
  paymentActions,
  onNavigateToConfig,
  isLiveMode,
}) => {
  const { t } = usePluginTranslations();
  return (
    <Box>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <RenderInput
          name="paymentMethod"
          label={t("paymentMethodSelector.label", "Select Payment Method")}
          value={paymentActions.paymentState.paymentMethod || ""}
          onChange={(e) => {
            const value = e.target?.value || e;
            paymentActions.handleFieldChange("paymentMethod", value);
          }}
          inputType="select"
          options={getPaymentMethodOptions(isLiveMode).map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          placeholder={t("paymentMethodSelector.placeholder", "Select payment method")}
          hint={`${t("paymentMethodSelector.hintCurrent", "Current")}: ${getPaymentMethodDisplayName(paymentActions.paymentState.paymentMethod)}`}
          tooltipContent={t("paymentMethodSelector.tooltip", "Select the payment method you want to use for this transaction")}
        />
        {paymentActions.paymentState.paymentMethod === "apl" &&
          onNavigateToConfig && (
            <>
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <Box
                  style={{
                    background: "transparent",
                    padding: "16px",
                    borderRadius: "4px",
                    border: "1px solid #eaeaea",
                  }}
                >
                  <Typography variant="pi" style={{ lineHeight: "1.6" }}>
                    <strong>Apple Pay requires middleware configuration</strong>{" "}
                    to work properly. You must configure Content Security Policy
                    (CSP) in{" "}
                    <code
                      style={{
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "13px",
                      }}
                    >
                      config/middlewares.js
                    </code>{" "}
                    to allow Apple Pay scripts.
                  </Typography>

                  <Box style={{ marginTop: "16px" }}>
                    <Typography
                      variant="pi"
                      style={{
                        fontWeight: "600",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Required CSP directives:
                    </Typography>

                    <Box>
                      <Typography
                        variant="pi"
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          lineHeight: "1.8",
                        }}
                      >
                        <div>
                          'script-src': ['https://applepay.cdn-apple.com',
                          'https://www.apple.com']
                        </div>
                        <div>
                          'connect-src': ['https://applepay.cdn-apple.com',
                          'https://www.apple.com']
                        </div>
                        <div>
                          'frame-src': ['https://applepay.cdn-apple.com']
                        </div>
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    padding={2}
                    background="warning100"
                    style={{
                      marginTop: "16px",
                      borderRadius: "4px",
                      borderLeft: "3px solid #f29d41",
                    }}
                  >
                    <Typography variant="pi" style={{ fontWeight: "600" }}>
                      ⚠️ Without this configuration, Apple Pay will NOT work!
                    </Typography>
                  </Box>
                </Box>

                <Box
                  style={{
                    background: "transparent",
                    padding: "16px",
                    borderRadius: "4px",
                    border: "1px solid #eaeaea",
                  }}
                >
                  <Typography variant="pi" style={{ lineHeight: "1.6" }}>
                    <strong>Download the domain verification file</strong> from
                    your Payone merchant portal and place it in the following
                    locations:
                  </Typography>

                  <Box>
                    <Typography
                      variant="pi"
                      style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        lineHeight: "1.8",
                      }}
                    >
                      <div style={{ marginBottom: "8px" }}>
                        <strong>Strapi:</strong>{" "}
                        <code>
                          public/.well-known/apple-developer-merchantid-domain-association
                        </code>
                      </div>
                      <div>
                        <strong>Frontend:</strong>{" "}
                        <code>
                          public/.well-known/apple-developer-merchantid-domain-association
                        </code>
                      </div>
                    </Typography>
                  </Box>

                  <Box style={{ marginTop: "16px" }}>
                    <Typography variant="pi" style={{ lineHeight: "1.6" }}>
                      <strong>Download URL:</strong> Get the domain verification
                      file from Payone documentation:
                    </Typography>
                    <Box
                      padding={2}
                      background="primary100"
                      style={{ marginTop: "8px", borderRadius: "4px" }}
                    >
                      <Link
                        href="https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#4945ff",
                          textDecoration: "none",
                          fontWeight: "500",
                          fontSize: "14px",
                        }}
                      >
                        →
                        https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev
                      </Link>
                    </Box>
                  </Box>

                  <Box
                    padding={2}
                    background="danger100"
                    style={{
                      marginTop: "16px",
                      borderRadius: "4px",
                      borderLeft: "3px solid #d02b20",
                    }}
                  >
                    <Typography
                      variant="pi"
                      textColor="danger600"
                      style={{ fontWeight: "600" }}
                    >
                      ⚠️ Without this file, Apple Pay will NOT work on your
                      domain!
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box padding={3} borderRadius="4px">
                <Typography variant="pi" textColor="neutral600">
                  Configure Apple Pay settings:{" "}
                  <Link
                    href={`/plugins/${pluginId}/apple-pay-config`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateToConfig("apple-pay");
                    }}
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      color: "#0066ff",
                    }}
                  >
                    /plugins/{pluginId}/apple-pay-config
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        {paymentActions.paymentState.paymentMethod === "gpp" &&
          onNavigateToConfig && (
            <>
              <Alert
                closeLabel="Close"
                title="⚠️ Important: Middleware Configuration Required"
                variant="warning"
              >
                <Typography variant="pi" marginTop={2}>
                  <strong>Google Pay requires middleware configuration</strong>{" "}
                  to work properly. You must configure Content Security Policy
                  (CSP) in <code>config/middlewares.js</code> to allow Google
                  Pay scripts, otherwise Google Pay will NOT work.
                </Typography>
                <Typography variant="pi" marginTop={2}>
                  Required CSP directives for Google Pay:
                </Typography>
                <Box
                  marginTop={2}
                  padding={2}
                  background="neutral100"
                  borderRadius="4px"
                >
                  <Typography
                    variant="pi"
                    style={{ fontFamily: "monospace", fontSize: "12px" }}
                  >
                    'script-src': ['https://pay.google.com']
                    <br />
                    'connect-src': ['https://pay.google.com']
                    <br />
                    'frame-src': ['https://pay.google.com']
                  </Typography>
                </Box>
                <Typography variant="pi" marginTop={2} fontWeight="bold">
                  ⚠️ Without this configuration, Google Pay will NOT work!
                </Typography>
              </Alert>
              <Box padding={3} background="neutral100" borderRadius="4px">
                <Typography variant="pi" textColor="neutral600">
                  Configure Google Pay settings:{" "}
                  <Link
                    href={`/plugins/${pluginId}/google-pay-config`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateToConfig("google-pay");
                    }}
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      color: "#0066ff",
                    }}
                  >
                    /plugins/{pluginId}/google-pay-config
                  </Link>
                </Typography>
              </Box>
            </>
          )}
        {paymentActions.paymentState.paymentMethod !== "apl" &&
          supportsCaptureMode(paymentActions.paymentState.paymentMethod) && (
            <RenderInput
              name="captureMode"
              label="Capture Mode"
              value={paymentActions.paymentState.captureMode || ""}
              onChange={(e) => {
                const value = e.target?.value || e;
                paymentActions.handleFieldChange("captureMode", value);
              }}
              inputType="select"
              options={getCaptureModeOptions().map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              placeholder="Select capture mode"
              hint="Select capture mode for wallet payments"
              tooltipContent="Choose how the payment should be captured for wallet payments"
            />
          )}
      </Flex>
    </Box>
  );
};

export default PaymentMethodSelector;
