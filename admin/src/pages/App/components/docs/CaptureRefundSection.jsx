import * as React from "react";
import { Accordion, Box, Flex, Typography } from "@strapi/design-system";
import { Link } from "@strapi/design-system";
import CodeBlock from "./CodeBlock";

const CaptureRefundSection = () => {
  return (
    <Accordion.Item value="capture-refund" id="capture-refund">
      <Accordion.Header>
        <Accordion.Trigger>Capture & Refund Operations</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <Flex direction="column" alignItems={"stretch"} gap={4} padding={4}>
          <Typography variant="delta" as="h3" fontWeight="bold">
            Capture & Refund Operations
          </Typography>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Capture (Complete Preauthorized Transaction):
            </Typography>
            <div style={{ marginTop: "12px", marginBottom: "12px" }}>
              <CodeBlock>{`POST /api/strapi-plugin-payone-provider/capture

{
  "txid": "12345678",
  "amount": 1000,
  "currency": "EUR",
  "reference": "CAPTURE-00123-ABCD",
  "sequencenumber": 1,
  "capturemode": "full"  // For wallet payments: "full" or "partial"
}`}</CodeBlock>
            </div>
            <Typography variant="pi" textColor="neutral600">
              <strong>Note:</strong> <code>capturemode</code> is only required
              for wallet payments (PayPal, Google Pay, Apple Pay).
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Refund (Return Funds):
            </Typography>
            <div style={{ marginTop: "12px", marginBottom: "12px" }}>
              <CodeBlock>{`POST /api/strapi-plugin-payone-provider/refund

{
  "txid": "12345678",
  "amount": -1000,  // Negative amount for refund
  "currency": "EUR",
  "reference": "REFUND-00123-ABCD",
  "sequencenumber": 2
}`}</CodeBlock>
            </div>
            <Typography variant="pi" textColor="neutral600">
              <strong>Note:</strong> Refund amount must be negative.{" "}
              <code>sequencenumber</code> should be incremented for each
              operation on the same transaction.
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Sequence Numbers:
            </Typography>
            <Flex
              direction="column"
              marginTop={2}
              alignItems={"stretch"}
              gap={2}
            >
              <Typography variant="pi">
                • <strong>Preauthorization:</strong> sequencenumber = 0
                (default)
              </Typography>
              <Typography variant="pi">
                • <strong>Capture:</strong> sequencenumber = 1 (first capture)
              </Typography>
              <Typography variant="pi">
                • <strong>Refund:</strong> sequencenumber = 2 (first refund), 3
                (second refund), etc.
              </Typography>
            </Flex>
          </Box>
          <Box marginTop={2}>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone Capture Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/Capture"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/Capture
              </Link>
            </Typography>
          </Box>
          <Box marginTop={2}>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone Refund Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/Refund"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/Refund
              </Link>
            </Typography>
          </Box>
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default CaptureRefundSection;

