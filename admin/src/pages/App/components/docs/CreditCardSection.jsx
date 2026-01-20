import * as React from "react";
import { Accordion, Box, Flex, Link, Typography } from "@strapi/design-system";
import CodeBlock from "./CodeBlock";

const CreditCardSection = () => {
  return (
    <Accordion.Item value="credit-card" id="credit-card">
      <Accordion.Header>
        <Accordion.Trigger>Credit Card Integration</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <Flex direction="column" gap={4} alignItems="stretch" padding={4}>
          <Typography variant="delta" as="h3" fontWeight="bold">
            Credit Card Integration
          </Typography>
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
  "clearingtype": "cc",
  "cardtype": "V",
  "cardpan": "4111111111111111",
  "cardexpiredate": "2512",
  "cardcvc2": "123",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "street": "Main Street 123",
  "zip": "12345",
  "city": "Berlin",
  "country": "DE",
  "successurl": "https://www.example.com/success",
  "errorurl": "https://www.example.com/error",
  "backurl": "https://www.example.com/back"
}`}</CodeBlock>
            </div>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Response (Success):
            </Typography>
            <div style={{ marginTop: "12px" }}>
              <CodeBlock>{`{
  "status": "APPROVED",
  "txid": "12345678",
  "reference": "ORD-00123-ABCD",
  "amount": 1000,
  "currency": "EUR"
}`}</CodeBlock>
            </div>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Response (3D Secure Redirect):
            </Typography>
            <div style={{ marginTop: "12px", marginBottom: "12px" }}>
              <CodeBlock>{`{
  "status": "REDIRECT",
  "redirecturl": "https://secure.pay1.de/3ds/...",
  "requires3DSRedirect": true
}`}</CodeBlock>
            </div>
            <Typography variant="pi" textColor="neutral600">
              ⚠️ When 3D Secure is enabled, you must redirect the user to the{" "}
              <code>redirecturl</code> for authentication.
            </Typography>
          </Box>
          <Box marginTop={2}>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone Credit Card Documentation:</strong>
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/Credit+Card"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/Credit+Card
              </Link>
            </Typography>
          </Box>
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default CreditCardSection;
