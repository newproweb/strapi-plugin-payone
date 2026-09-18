import * as React from "react";
import { Accordion, Box, Flex, Typography } from "@strapi/design-system";
import { Link } from "@strapi/design-system";
import CodeBlock from "./CodeBlock";

const ApplePaySection = () => {
  return (
    <Accordion.Item value="apple-pay" id="apple-pay">
      <Accordion.Header>
        <Accordion.Trigger>Apple Pay Integration</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <Flex direction="column" alignItems={"stretch"} gap={4} padding={4}>
          <Typography variant="delta" as="h3" fontWeight="bold">
            Apple Pay Integration
          </Typography>
          <Typography variant="pi" fontWeight="bold" textColor="danger600">
            ⚠️ Important: Apple Pay does NOT work on localhost
          </Typography>

          <Typography variant="pi" textColor="neutral600">
            Apple Pay requires a registered domain with HTTPS. For testing, use a
            production domain with HTTPS or test on a device with Safari
            (iOS/macOS).
          </Typography>

          <Box>
            <Flex direction="column" alignItems={"stretch"} gap={2}>
              <Typography variant="pi" fontWeight="bold">
                Step 1: Configure Strapi Middleware
              </Typography>
              <Typography variant="pi">
                Add Apple Pay SDK to your <code>config/middlewares.js</code>:
              </Typography>
            </Flex>

            <div style={{ marginTop: "12px" }}>
              <CodeBlock>{`module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://applepay.cdn-apple.com',
            'https://www.apple.com',
          ],
          'connect-src': [
            "'self'",
            'https:',
            'https://applepay.cdn-apple.com',
            'https://www.apple.com',
          ],
          'frame-src': [
            "'self'",
            'https://applepay.cdn-apple.com',
          ],
        },
      },
    },
  },
  // ... other middlewares
];`}</CodeBlock>
            </div>
          </Box>

          <Box>
            <Flex direction="column" alignItems={"stretch"} gap={2}>
              <Typography variant="pi" fontWeight="bold">
                Step 2: Setup .well-known File
              </Typography>
              <Typography variant="pi">
                Download the Apple Pay domain verification file from Payone
                documentation:{" "}
                <Link
                  href="https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev
                </Link>{" "}
                or from your Payone merchant portal and place it:
              </Typography>
            </Flex>
            <Flex
              direction="column"
              alignItems={"stretch"}
              gap={2}
              style={{ marginTop: "16px" }}
            >
              <Typography variant="pi">
                <strong>In Strapi:</strong>{" "}
                <code>
                  public/.well-known/apple-developer-merchantid-domain-association
                </code>
              </Typography>
              <Typography variant="pi">
                <strong>In Frontend:</strong>{" "}
                <code>
                  public/.well-known/apple-developer-merchantid-domain-association
                </code>
              </Typography>
            </Flex>
            <Typography variant="pi" textColor="neutral600" marginTop={2}>
              The file must be accessible at:{" "}
              <code>
                https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
              </code>
            </Typography>
            <Typography variant="pi" textColor="neutral600" marginTop={2}>
              <strong>Alternative Download:</strong> Log into your Payone
              Merchant Interface (PMI) → Configuration → Payment Portals → Apple
              Pay → Download domain verification file
            </Typography>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Step 3: Implement Apple Pay Button
            </Typography>
            <div style={{ marginTop: "12px" }}>
              <CodeBlock>{`// Load Apple Pay SDK
<script src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"></script>

// Check if Apple Pay is available
if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
  // Create payment request
  const paymentRequest = {
    countryCode: 'DE',
    currencyCode: 'EUR',
    supportedNetworks: ['visa', 'masterCard', 'amex'],
    merchantCapabilities: ['supports3DS'],
    total: {
      label: 'Your Store',
      amount: '10.00'
    }
  };

  // Create session
  const session = new ApplePaySession(3, paymentRequest);

  // Handle merchant validation
  session.onmerchantvalidation = async (event) => {
    const validationURL = event.validationURL;
    
    // Call your backend to validate merchant
    const response = await fetch('/api/strapi-plugin-payone-provider/validate-apple-pay-merchant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        validationURL: validationURL,
        displayName: 'Your Store Name',
        domainName: window.location.hostname
      })
    });
    
    const merchantSession = await response.json();
    session.completeMerchantValidation(merchantSession);
  };

  // Handle payment authorization
  session.onpaymentauthorized = async (event) => {
    const payment = event.payment;
    const token = payment.token;
    
    // Send token to backend
    const response = await fetch('/api/strapi-plugin-payone-provider/preauthorization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        amount: 1000,
        currency: 'EUR',
        reference: 'ORD-00123-ABCD',
        clearingtype: 'wlt',
        wallettype: 'APL',
        'add_paydata[paymentmethod_token_data]': JSON.stringify(token),
        'add_paydata[paymentmethod]': 'APL',
        'add_paydata[paymentmethod_type]': 'APPLEPAY',
        'add_paydata[gatewayid]': 'payonegmbh',
        firstname: payment.billingContact.givenName || 'John',
        lastname: payment.billingContact.familyName || 'Doe',
        email: payment.billingContact.emailAddress || 'john.doe@example.com',
        street: payment.billingContact.addressLines?.[0] || 'Main Street 123',
        zip: payment.billingContact.postalCode || '12345',
        city: payment.billingContact.locality || 'Berlin',
        country: payment.billingContact.countryCode || 'DE',
        shipping_firstname: payment.shippingContact?.givenName || payment.billingContact.givenName || 'John',
        shipping_lastname: payment.shippingContact?.familyName || payment.billingContact.familyName || 'Doe',
        shipping_street: payment.shippingContact?.addressLines?.[0] || payment.billingContact.addressLines?.[0] || 'Main Street 123',
        shipping_zip: payment.shippingContact?.postalCode || payment.billingContact.postalCode || '12345',
        shipping_city: payment.shippingContact?.locality || payment.billingContact.locality || 'Berlin',
        shipping_country: payment.shippingContact?.countryCode || payment.billingContact.countryCode || 'DE'
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'APPROVED') {
      session.completePayment(ApplePaySession.STATUS_SUCCESS);
    } else {
      session.completePayment(ApplePaySession.STATUS_FAILURE);
    }
  };

  // Show payment sheet
  session.begin();
}`}</CodeBlock>
            </div>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Token Parameters (Backend Request):
            </Typography>
            <div style={{ marginTop: "12px" }}>
              <CodeBlock>{`{
  "amount": 1000,
  "currency": "EUR",
  "reference": "ORD-00123-ABCD",
  "clearingtype": "wlt",
  "wallettype": "APL",
  "add_paydata[paymentmethod_token_data]": "JSON_STRINGIFIED_TOKEN",
  "add_paydata[paymentmethod]": "APL",
  "add_paydata[paymentmethod_type]": "APPLEPAY",
  "add_paydata[gatewayid]": "payonegmbh",
  "add_paydata[gateway_merchantid]": "YOUR_MERCHANT_ID",
  // ... customer and shipping info
}`}</CodeBlock>
            </div>
          </Box>
          <Box>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone Apple Pay Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/Apple+Pay"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/Apple+Pay
              </Link>
            </Typography>
          </Box>
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default ApplePaySection;

