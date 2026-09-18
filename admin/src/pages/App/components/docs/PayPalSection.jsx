import * as React from "react";
import { Accordion, Box, Flex, Typography } from "@strapi/design-system";
import { Link } from "@strapi/design-system";
import CodeBlock from "./CodeBlock";

const PayPalSection = () => {
  return (
    <Accordion.Item value="paypal" id="paypal">
      <Accordion.Header>
        <Accordion.Trigger>PayPal Integration</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <Flex direction="column" alignItems={"stretch"} gap={4} padding={4}>
          <Typography variant="delta" as="h3" fontWeight="bold">
            PayPal Integration
          </Typography>
          <Flex direction="column" alignItems={"stretch"} gap={2}>
            <Typography variant="pi" fontWeight="bold">
              Required Parameters:
            </Typography>
            <Flex direction="column" alignItems={"stretch"} gap={2}>
              <Typography variant="pi">
                • <strong>clearingtype</strong>: "wlt"
              </Typography>
              <Typography variant="pi">
                • <strong>wallettype</strong>: "PPE" (PayPal Express)
              </Typography>
              <Typography variant="pi">
                • <strong>shipping_firstname</strong>,{" "}
                <strong>shipping_lastname</strong>,{" "}
                <strong>shipping_street</strong>,{" "}
                <strong>shipping_zip</strong>,{" "}
                <strong>shipping_city</strong>,{" "}
                <strong>shipping_country</strong> - Shipping address
              </Typography>
            </Flex>
          </Flex>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Preauthorization Request:
            </Typography>
            <div style={{ marginTop: "12px" }}>
              <CodeBlock>{`POST /api/strapi-plugin-payone-provider/preauthorization

{
  "amount": 1000,
  "currency": "EUR",
  "reference": "ORD-00123-ABCD",
  "clearingtype": "wlt",
  "wallettype": "PPE",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "street": "Main Street 123",
  "zip": "12345",
  "city": "Berlin",
  "country": "DE",
  "shipping_firstname": "John",
  "shipping_lastname": "Doe",
  "shipping_street": "Main Street 123",
  "shipping_zip": "12345",
  "shipping_city": "Berlin",
  "shipping_country": "DE",
  "successurl": "https://www.example.com/success",
  "errorurl": "https://www.example.com/error",
  "backurl": "https://www.example.com/back"
}`}</CodeBlock>
            </div>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Response (Redirect to PayPal):
            </Typography>
            <div style={{ marginTop: "12px", marginBottom: "12px" }}>
              <CodeBlock>{`{
  "status": "REDIRECT",
  "redirecturl": "https://www.paypal.com/checkoutnow?token=..."
}`}</CodeBlock>
            </div>
            <Typography variant="pi" textColor="neutral600">
              ⚠️ PayPal always redirects. You must redirect the user to{" "}
              <code>redirecturl</code> to complete the payment.
            </Typography>
          </Box>
          <Box marginTop={2}>
            <Typography variant="pi" fontWeight="bold">
              PayPal Callback Response (after redirect):
            </Typography>
            <div style={{ marginTop: "12px" }}>
              <CodeBlock>{`{
  "status": "APPROVED",
  "txid": "12345678",
  "reference": "ORD-00123-ABCD"
}`}</CodeBlock>
            </div>
          </Box>
          <Box marginTop={2}>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone PayPal Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/PayPal"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/PayPal
              </Link>
            </Typography>
          </Box>
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default PayPalSection;

