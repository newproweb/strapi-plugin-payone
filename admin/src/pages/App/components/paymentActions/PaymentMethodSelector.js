import React from "react";
import { Box, Flex, Select, Option, Typography, Link, Alert } from "@strapi/design-system";
import pluginId from "../../../../pluginId";
import {
  getPaymentMethodOptions,
  supportsCaptureMode,
  getCaptureModeOptions,
  getPaymentMethodDisplayName
} from "../../../utils/paymentUtils";

const PaymentMethodSelector = ({
  paymentMethod,
  setPaymentMethod,
  captureMode,
  setCaptureMode,
  onNavigateToConfig
}) => {
  return (
    <Box>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Select
          label="Select Payment Method"
          name="paymentMethod"
          value={paymentMethod}
          onChange={(value) => setPaymentMethod(value)}
          hint={`Current: ${getPaymentMethodDisplayName(paymentMethod)}`}
        >
          {getPaymentMethodOptions().map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
        {paymentMethod === "apl" && onNavigateToConfig && (
          <>
            <Alert closeLabel="Close" title="⚠️ Important: Middleware Configuration Required" variant="warning">
              <Typography variant="pi" marginTop={2}>
                <strong>Apple Pay requires middleware configuration</strong> to work properly. You must configure Content Security Policy (CSP) in <code>config/middlewares.js</code> to allow Apple Pay scripts, otherwise Apple Pay will NOT work.
              </Typography>
              <Typography variant="pi" marginTop={2}>
                Required CSP directives for Apple Pay:
              </Typography>
              <Box marginTop={2} padding={2} background="neutral100" borderRadius="4px">
                <Typography variant="pi" style={{ fontFamily: "monospace", fontSize: "12px" }}>
                  'script-src': ['https://applepay.cdn-apple.com', 'https://www.apple.com']<br/>
                  'connect-src': ['https://applepay.cdn-apple.com', 'https://www.apple.com']<br/>
                  'frame-src': ['https://applepay.cdn-apple.com']
                </Typography>
              </Box>
              <Typography variant="pi" marginTop={2} fontWeight="bold">
                ⚠️ Without this configuration, Apple Pay will NOT work!
              </Typography>
            </Alert>
            <Alert closeLabel="Close" title="📥 Apple Pay Domain Verification File Required" variant="default">
              <Typography variant="pi" marginTop={2}>
                <strong>Download the Apple Pay domain verification file</strong> from your Payone merchant portal and place it in:
              </Typography>
              <Box marginTop={2} padding={2} background="neutral100" borderRadius="4px">
                <Typography variant="pi" style={{ fontFamily: "monospace", fontSize: "12px" }}>
                  <strong>Strapi:</strong> <code>public/.well-known/apple-developer-merchantid-domain-association</code><br/>
                  <strong>Frontend:</strong> <code>public/.well-known/apple-developer-merchantid-domain-association</code>
                </Typography>
              </Box>
              <Typography variant="pi" marginTop={2}>
                <strong>Download URL:</strong> Download the domain verification file from Payone documentation:{" "}
                <Link
                  href="https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0066ff", textDecoration: "underline" }}
                >
                  https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev
                </Link>
              </Typography>
              <Typography variant="pi" marginTop={2}>
                <strong>Alternative:</strong> Log into your Payone Merchant Interface (PMI) → Configuration → Payment Portals → Apple Pay → Download domain verification file
              </Typography>
              <Typography variant="pi" marginTop={2} fontWeight="bold" textColor="danger600">
                ⚠️ Without this file, Apple Pay will NOT work on your domain!
              </Typography>
            </Alert>
            <Box padding={3} background="neutral100" borderRadius="4px">
              <Typography variant="pi" textColor="neutral600">
                Configure Apple Pay settings:{" "}
                <Link
                  href={`/plugins/${pluginId}/apple-pay-config`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateToConfig("apple-pay");
                  }}
                  style={{ cursor: "pointer", textDecoration: "underline", color: "#0066ff" }}
                >
                  /plugins/{pluginId}/apple-pay-config
                </Link>
              </Typography>
            </Box>
          </>
        )}
        {paymentMethod === "gpp" && onNavigateToConfig && (
          <>
            <Alert closeLabel="Close" title="⚠️ Important: Middleware Configuration Required" variant="warning">
              <Typography variant="pi" marginTop={2}>
                <strong>Google Pay requires middleware configuration</strong> to work properly. You must configure Content Security Policy (CSP) in <code>config/middlewares.js</code> to allow Google Pay scripts, otherwise Google Pay will NOT work.
              </Typography>
              <Typography variant="pi" marginTop={2}>
                Required CSP directives for Google Pay:
              </Typography>
              <Box marginTop={2} padding={2} background="neutral100" borderRadius="4px">
                <Typography variant="pi" style={{ fontFamily: "monospace", fontSize: "12px" }}>
                  'script-src': ['https://pay.google.com']<br/>
                  'connect-src': ['https://pay.google.com']<br/>
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
                  style={{ cursor: "pointer", textDecoration: "underline", color: "#0066ff" }}
                >
                  /plugins/{pluginId}/google-pay-config
                </Link>
              </Typography>
            </Box>
          </>
        )}
        {supportsCaptureMode(paymentMethod) && (
          <Select
            label="Capture Mode"
            name="captureMode"
            value={captureMode}
            onChange={(value) => setCaptureMode(value)}
            hint="Select capture mode for wallet payments"
          >
            {getCaptureModeOptions().map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        )}
      </Flex>
    </Box>
  );
};

export default PaymentMethodSelector;