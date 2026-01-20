import * as React from "react";
import { Accordion, Box, Flex, Typography } from "@strapi/design-system";
import { Link } from "@strapi/design-system";
import CodeBlock from "./CodeBlock";

const GooglePaySection = () => {
  return (
    <Accordion.Item value="google-pay" id="google-pay">
      <Accordion.Header>
        <Accordion.Trigger>Google Pay Integration</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <Flex direction="column" alignItems={"stretch"} gap={4} padding={4}>
          <Typography variant="delta" as="h3" fontWeight="bold">
            Google Pay Integration
          </Typography>
          <Box>
            <Flex direction="column" alignItems={"stretch"} gap={2}>
              <Typography variant="pi" fontWeight="bold">
                Step 1: Configure Strapi Middleware
              </Typography>
              <Typography variant="pi">
                Add Google Pay SDK to your{" "}
                <code>config/middlewares.js</code>:
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
            'https://pay.google.com',
          ],
          'connect-src': [
            "'self'",
            'https:',
            'https://pay.google.com',
          ],
          'frame-src': [
            "'self'",
            'https://pay.google.com',
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
            <Typography variant="pi" fontWeight="bold">
              Step 2: Install Google Pay Button Library (Optional)
            </Typography>
            <div style={{ marginTop: "12px" }}>
              <CodeBlock>npm install @google-pay/button-react</CodeBlock>
            </div>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Step 3: Implement Google Pay Button (Using NPM Library)
            </Typography>
            <div style={{ marginTop: "12px" }}>
              <CodeBlock>{`import {  GooglePayButton } from '@google-pay/button-react';

function PaymentForm() {
  const handleGooglePay = async (paymentData) => {
    const token = paymentData.paymentMethodData.tokenizationData.token;
    
    // Send token to your backend
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
        wallettype: 'GGP',
        'add_paydata[paymentmethod_token_data]': token,
        'add_paydata[paymentmethod]': 'GGP',
        'add_paydata[paymentmethod_type]': 'GOOGLEPAY',
        'add_paydata[gatewayid]': 'payonegmbh',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        street: 'Main Street 123',
        zip: '12345',
        city: 'Berlin',
        country: 'DE',
        shipping_firstname: 'John',
        shipping_lastname: 'Doe',
        shipping_street: 'Main Street 123',
        shipping_zip: '12345',
        shipping_city: 'Berlin',
        shipping_country: 'DE'
      })
    });
    
    const result = await response.json();
  };

  return (
    <GooglePayButton
      environment="TEST"
      paymentRequest={{
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'payonegmbh',
              gatewayMerchantId: 'YOUR_MERCHANT_ID'
            }
          }
        }],
        merchantInfo: {
          merchantId: 'YOUR_MERCHANT_ID',
          merchantName: 'Your Store Name'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPriceLabel: 'Total',
          totalPrice: '10.00',
          currencyCode: 'EUR',
          countryCode: 'DE'
        }
      }}
      onLoadPaymentData={handleGooglePay}
    />
  );
                  }`}</CodeBlock>
            </div>
          </Box>
          <Box>
            <Typography variant="pi" fontWeight="bold">
              Step 4: Manual Implementation
            </Typography>
            <div style={{ marginTop: "12px" }}>
              <CodeBlock>{`// Load Google Pay SDK
<script src="https://pay.google.com/gp/p/js/pay.js"></script>

// Initialize Google Pay
const paymentsClient = new google.payments.api.PaymentsClient({
  environment: 'TEST' // or 'PRODUCTION'
});

// Create payment request
const paymentRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [{
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: ['MASTERCARD', 'VISA']
    },
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: 'payonegmbh',
        gatewayMerchantId: 'YOUR_MERCHANT_ID'
      }
    }
  }],
  merchantInfo: {
    merchantId: 'YOUR_MERCHANT_ID',
    merchantName: 'Your Store Name'
  },
  transactionInfo: {
    totalPriceStatus: 'FINAL',
    totalPrice: '10.00',
    currencyCode: 'EUR',
    countryCode: 'DE'
  }
};

// Check if Google Pay is available
paymentsClient.isReadyToPay(paymentRequest).then((response) => {
  if (response.result) {
    // Show Google Pay button
    paymentsClient.loadPaymentData(paymentRequest).then((paymentData) => {
      const token = paymentData.paymentMethodData.tokenizationData.token;
      // Send token to backend
      sendTokenToBackend(token);
    });
  }
});`}</CodeBlock>
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
  "wallettype": "GGP",
  "add_paydata[paymentmethod_token_data]": "TOKEN_FROM_GOOGLE_PAY",
  "add_paydata[paymentmethod]": "GGP",
  "add_paydata[paymentmethod_type]": "GOOGLEPAY",
  "add_paydata[gatewayid]": "payonegmbh",
  "add_paydata[gateway_merchantid]": "YOUR_MERCHANT_ID",
  // ... customer and shipping info
}`}</CodeBlock>
            </div>
          </Box>
          <Box marginTop={2}>
            <Typography variant="pi" textColor="neutral600">
              📚 <strong>Payone Google Pay Documentation:</strong>{" "}
              <Link
                href="https://docs.payone.com/display/public/PLATFORM/Google+Pay"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.payone.com/display/public/PLATFORM/Google+Pay
              </Link>
            </Typography>
          </Box>
        </Flex>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default GooglePaySection;

