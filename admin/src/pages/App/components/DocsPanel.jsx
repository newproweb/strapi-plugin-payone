import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Flex,
  Typography,
  Stack,
  Accordion,
  AccordionToggle,
  AccordionContent
} from "@strapi/design-system";

const CodeBlock = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      if (typeof window !== 'undefined') {
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const rgb = bodyBg.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
          setIsDark(brightness < 128);
        } else {
          const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDark(prefersDark);
        }
      }
    };

    checkTheme();
    const mediaQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery) {
      mediaQuery.addEventListener('change', checkTheme);
      return () => mediaQuery.removeEventListener('change', checkTheme);
    }
  }, []);

  return (
    <Box
      padding={3}
      borderRadius="4px"
      style={{
        backgroundColor: isDark ? '#1e1e1e' : '#f6f6f9',
        color: isDark ? '#d4d4d4' : '#32324d',
        fontFamily: 'monospace',
        fontSize: '14px',
        overflow: 'auto'
      }}
    >
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {children}
      </pre>
    </Box>
  );
};

const DocsPanel = () => {
  const [expandedAccordions, setExpandedAccordions] = useState({
    toc: false,
    creditCard: false,
    paypal: false,
    googlePay: false,
    applePay: false,
    threeDSecure: false,
    captureRefund: false,
    testCredentials: false
  });

  const toggleAccordion = (key) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Box
      className="payment-container"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
    >
      <Flex direction="column" alignItems="stretch" gap={6}>
        <Box>
          <Typography variant="beta" as="h2" fontWeight="bold" className="payment-title" style={{ fontSize: '24px', marginBottom: '12px' }}>
            Payone Provider Plugin - Frontend Integration Guide
          </Typography>
          <Typography variant="pi" textColor="neutral600" marginTop={2} className="payment-subtitle" style={{ fontSize: '16px' }}>
            Complete documentation for integrating Payone payment methods in your frontend application
          </Typography>
        </Box>

        <Accordion expanded={expandedAccordions.toc} onToggle={() => toggleAccordion('toc')}>
          <AccordionToggle title="Table of Contents" />
          <AccordionContent>
            <Stack spacing={2} padding={4}>
              <Typography variant="pi">1. <a href="#base-url">Base URL & Authentication</a></Typography>
              <Typography variant="pi">2. <a href="#payment-methods">Supported Payment Methods</a></Typography>
              <Typography variant="pi">3. <a href="#credit-card">Credit Card Integration</a></Typography>
              <Typography variant="pi">4. <a href="#paypal">PayPal Integration</a></Typography>
              <Typography variant="pi">5. <a href="#google-pay">Google Pay Integration</a></Typography>
              <Typography variant="pi">6. <a href="#apple-pay">Apple Pay Integration</a></Typography>
              <Typography variant="pi">7. <a href="#3d-secure">3D Secure Authentication</a></Typography>
              <Typography variant="pi">8. <a href="#capture-refund">Capture & Refund Operations</a></Typography>
              <Typography variant="pi">9. <a href="#test-credentials">Test Credentials</a></Typography>
            </Stack>
          </AccordionContent>
        </Accordion>

        <Card className="payment-card" id="base-url">
          <CardBody padding={6}>
            <Stack spacing={4}>
              <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: '12px' }}>
                Base URL & Authentication
              </Typography>
              <Box>
                <Typography variant="pi" fontWeight="bold" marginBottom={2}>
                  Content API (Frontend):
                </Typography>
                <CodeBlock>/api/strapi-plugin-payone-provider</CodeBlock>
              </Box>
              <Box>
                <Typography variant="pi" fontWeight="bold" marginBottom={2}>
                  Required Headers:
                </Typography>
                <CodeBlock>{`{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_AUTH_TOKEN"
}`}</CodeBlock>
                <Typography variant="pi" textColor="neutral600" marginTop={6}>
                  <strong>Note:</strong> <code>YOUR_AUTH_TOKEN</code> is your Strapi authentication token (JWT), not a Payone token. You can get this token by logging into Strapi admin panel or using Strapi's authentication API.
                </Typography>
              </Box>
            </Stack>
          </CardBody>
        </Card>

        <Card className="payment-card" id="payment-methods">
          <CardBody padding={6}>
            <Stack spacing={4}>
              <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: '12px' }}>
                Supported Payment Methods
              </Typography>
              <Box>
                <Typography variant="pi" fontWeight="bold" marginBottom={2}>
                  Available Payment Methods:
                </Typography>
                <Stack spacing={2}>
                  <Typography variant="pi">• <strong>cc</strong> - Credit Card (Visa, Mastercard, Amex)</Typography>
                  <Typography variant="pi">• <strong>wlt</strong> - PayPal</Typography>
                  <Typography variant="pi">• <strong>gpp</strong> - Google Pay</Typography>
                  <Typography variant="pi">• <strong>apl</strong> - Apple Pay</Typography>
                  <Typography variant="pi">• <strong>sb</strong> - Sofort Banking</Typography>
                  <Typography variant="pi">• <strong>elv</strong> - SEPA Direct Debit</Typography>
                </Stack>
              </Box>
              <Box>
                <Typography variant="pi" fontWeight="bold" marginBottom={2}>
                  Available Card Types (for Credit Card):
                </Typography>
                <Stack spacing={2}>
                  <Typography variant="pi">• <strong>V</strong> - Visa</Typography>
                  <Typography variant="pi">• <strong>M</strong> - Mastercard</Typography>
                  <Typography variant="pi">• <strong>A</strong> - American Express (Amex)</Typography>
                  <Typography variant="pi">• <strong>D</strong> - Diners Club</Typography>
                  <Typography variant="pi">• <strong>J</strong> - JCB</Typography>
                  <Typography variant="pi">• <strong>C</strong> - Carte Bleue</Typography>
                </Stack>
              </Box>
            </Stack>
          </CardBody>
        </Card>

        <Accordion id="credit-card" expanded={expandedAccordions.creditCard} onToggle={() => toggleAccordion('creditCard')}>
          <AccordionToggle title="Credit Card Integration" />
          <AccordionContent>
            <Card className="payment-card">
              <CardBody padding={6}>
                <Stack spacing={4}>
                  <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: '12px' }}>
                    Credit Card Integration
                  </Typography>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Preauthorization Request:
                    </Typography>
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
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Response (Success):
                    </Typography>
                    <CodeBlock>{`{
  "status": "APPROVED",
  "txid": "12345678",
  "reference": "ORD-00123-ABCD",
  "amount": 1000,
  "currency": "EUR"
}`}</CodeBlock>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Response (3D Secure Redirect):
                    </Typography>
                    <CodeBlock>{`{
  "status": "REDIRECT",
  "redirecturl": "https://secure.pay1.de/3ds/...",
  "requires3DSRedirect": true
}`}</CodeBlock>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      ⚠️ When 3D Secure is enabled, you must redirect the user to the <code>redirecturl</code> for authentication.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone Credit Card Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Credit+Card" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Credit+Card</a>
                    </Typography>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </AccordionContent>
        </Accordion>

        <Accordion id="paypal" expanded={expandedAccordions.paypal} onToggle={() => toggleAccordion('paypal')}>
          <AccordionToggle title="PayPal Integration" />
          <AccordionContent>
            <Card className="payment-card">
              <CardBody padding={6}>
                <Stack spacing={4}>
                  <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: '12px' }}>
                    PayPal Integration
                  </Typography>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Required Parameters:
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• <strong>clearingtype</strong>: "wlt"</Typography>
                      <Typography variant="pi">• <strong>wallettype</strong>: "PPE" (PayPal Express)</Typography>
                      <Typography variant="pi">• <strong>shipping_firstname</strong>, <strong>shipping_lastname</strong>, <strong>shipping_street</strong>, <strong>shipping_zip</strong>, <strong>shipping_city</strong>, <strong>shipping_country</strong> - Shipping address</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Preauthorization Request:
                    </Typography>
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
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Response (Redirect to PayPal):
                    </Typography>
                    <CodeBlock>{`{
  "status": "REDIRECT",
  "redirecturl": "https://www.paypal.com/checkoutnow?token=..."
}`}</CodeBlock>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      ⚠️ PayPal always redirects. You must redirect the user to <code>redirecturl</code> to complete the payment.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      PayPal Callback Response (after redirect):
                    </Typography>
                    <CodeBlock>{`{
  "status": "APPROVED",
  "txid": "12345678",
  "reference": "ORD-00123-ABCD"
}`}</CodeBlock>
                  </Box>
                  <Box>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone PayPal Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/PayPal" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/PayPal</a>
                    </Typography>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </AccordionContent>
        </Accordion>

        <Accordion id="google-pay" expanded={expandedAccordions.googlePay} onToggle={() => toggleAccordion('googlePay')}>
          <AccordionToggle title="Google Pay Integration" />
          <AccordionContent>
            <Card className="payment-card">
              <CardBody padding={6}>
                <Stack spacing={4}>
                  <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: '12px' }}>
                    Google Pay Integration
                  </Typography>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Step 1: Configure Strapi Middleware
                    </Typography>
                    <Typography variant="pi" marginBottom={2}>
                      Add Google Pay SDK to your <code>config/middlewares.js</code>:
                    </Typography>
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
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Step 2: Install Google Pay Button Library (Optional)
                    </Typography>
                    <CodeBlock>npm install @google-pay/button-react</CodeBlock>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Step 3: Implement Google Pay Button (Using NPM Library)
                    </Typography>
                    <CodeBlock>{`import { GooglePayButton } from '@google-pay/button-react';

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
    console.log('Payment result:', result);
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
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Step 4: Manual Implementation
                    </Typography>
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
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Token Parameters (Backend Request):
                    </Typography>
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
                  </Box>
                  <Box>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone Google Pay Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Google+Pay" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Google+Pay</a>
                    </Typography>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </AccordionContent>
        </Accordion>

        <Accordion id="apple-pay" expanded={expandedAccordions.applePay} onToggle={() => toggleAccordion('applePay')}>
          <AccordionToggle title="Apple Pay Integration" />
          <AccordionContent>
            <Card className="payment-card">
              <CardBody padding={6}>
                <Stack spacing={4}>
                  <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: '12px' }}>
                    Apple Pay Integration
                  </Typography>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} textColor="danger600" style={{ marginBottom: '12px', marginRight: '6px' }}>
                      ⚠️ Important: Apple Pay does NOT work on localhost
                    </Typography>
                    <Typography variant="pi" textColor="neutral600">
                      Apple Pay requires a registered domain with HTTPS. For testing, use a production domain with HTTPS or test on a device with Safari (iOS/macOS).
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Step 1: Configure Strapi Middleware
                    </Typography>
                    <Typography variant="pi" marginBottom={2}>
                      Add Apple Pay SDK to your <code>config/middlewares.js</code>:
                    </Typography>
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
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Step 2: Setup .well-known File
                    </Typography>
                    <Typography variant="pi" marginBottom={2}>
                      Download the Apple Pay domain verification file from Payone documentation:{" "}
                      <a
                        href="https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#0066ff", textDecoration: "underline" }}
                      >
                        https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev
                      </a>
                      {" "}or from your Payone merchant portal and place it:
                    </Typography>
                    <Stack spacing={2} marginBottom={2}>
                      <Typography variant="pi"><strong>In Strapi:</strong> <code>public/.well-known/apple-developer-merchantid-domain-association</code></Typography>
                      <Typography variant="pi"><strong>In Frontend:</strong> <code>public/.well-known/apple-developer-merchantid-domain-association</code></Typography>
                    </Stack>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      The file must be accessible at: <code>https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association</code>
                    </Typography>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      <strong>Alternative Download:</strong> Log into your Payone Merchant Interface (PMI) → Configuration → Payment Portals → Apple Pay → Download domain verification file
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Step 3: Implement Apple Pay Button
                    </Typography>
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
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Token Parameters (Backend Request):
                    </Typography>
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
                  </Box>
                  <Box>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone Apple Pay Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Apple+Pay" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Apple+Pay</a>
                    </Typography>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </AccordionContent>
        </Accordion>

        <Accordion id="3d-secure" expanded={expandedAccordions.threeDSecure} onToggle={() => toggleAccordion('threeDSecure')}>
          <AccordionToggle title="3D Secure Authentication" />
          <AccordionContent>
            <Card className="payment-card">
              <CardBody padding={6}>
                <Stack spacing={4}>
                  <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: '12px' }}>
                    3D Secure Authentication
                  </Typography>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      How 3D Secure Works:
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">1. Enable 3D Secure in Strapi admin panel (Configuration tab)</Typography>
                      <Typography variant="pi">2. Make a credit card payment request</Typography>
                      <Typography variant="pi">3. If 3DS is required, you'll receive a <code>redirecturl</code> in the response</Typography>
                      <Typography variant="pi">4. Redirect the user to the <code>redirecturl</code> for authentication</Typography>
                      <Typography variant="pi">5. User enters password/confirms with bank</Typography>
                      <Typography variant="pi">6. User is redirected back to your <code>successurl</code>, <code>errorurl</code>, or <code>backurl</code></Typography>
                      <Typography variant="pi">7. Handle the callback and check transaction status</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Special 3D Secure Test Cards (from Payone Documentation):
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• <strong>Visa 3DS Test Card:</strong> 4000000000000002</Typography>
                      <Typography variant="pi">• <strong>Mastercard 3DS Test Card:</strong> 5453010000059543</Typography>
                      <Typography variant="pi">• <strong>Expiry:</strong> Any future date (e.g., 12/25 = "2512")</Typography>
                      <Typography variant="pi">• <strong>CVC:</strong> Any 3 digits (e.g., 123)</Typography>
                      <Typography variant="pi">• <strong>3DS Password:</strong> Usually "123456" or as provided by Payone (check your Payone test documentation)</Typography>
                    </Stack>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone 3D Secure Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/3D+Secure" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/3D+Secure</a>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Standard Credit Card Test Cards (without 3DS):
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• <strong>Visa:</strong> 4111111111111111</Typography>
                      <Typography variant="pi">• <strong>Mastercard:</strong> 5555555555554444</Typography>
                      <Typography variant="pi">• <strong>Amex:</strong> 378282246310005</Typography>
                      <Typography variant="pi">• <strong>Expiry:</strong> Any future date (e.g., 12/25 = "2512")</Typography>
                      <Typography variant="pi">• <strong>CVC:</strong> Any 3 digits (4 digits for Amex)</Typography>
                    </Stack>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone Test Cards Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Credit+Card+Test+Cards" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Credit+Card+Test+Cards</a>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Example Flow:
                    </Typography>
                    <CodeBlock>{`// 1. Make payment request
const response = await fetch('/api/strapi-plugin-payone-provider/preauthorization', {
  method: 'POST',
  body: JSON.stringify({
    amount: 1000,
    currency: 'EUR',
    clearingtype: 'cc',
    cardtype: 'V',
    cardpan: '4111111111111111',
    cardexpiredate: '2512',
    cardcvc2: '123',
    successurl: 'https://yoursite.com/payment/success',
    errorurl: 'https://yoursite.com/payment/error',
    backurl: 'https://yoursite.com/payment/back',
    // ... other params
  })
});

const result = await response.json();

// 2. Check if 3DS redirect is required
if (result.status === 'REDIRECT' && result.redirecturl) {
  // 3. Redirect user to 3DS authentication page
  window.location.href = result.redirecturl;
}

// 4. Handle callback (in your success/error/back URL handler)
// The callback will include transaction status and txid`}</CodeBlock>
                  </Box>
                  <Box>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone 3D Secure Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/3D+Secure" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/3D+Secure</a>
                    </Typography>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </AccordionContent>
        </Accordion>

        <Accordion id="capture-refund" expanded={expandedAccordions.captureRefund} onToggle={() => toggleAccordion('captureRefund')}>
          <AccordionToggle title="Capture & Refund Operations" />
          <AccordionContent>
            <Card className="payment-card">
              <CardBody padding={6}>
                <Stack spacing={4}>
                  <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: '12px' }}>
                    Capture & Refund Operations
                  </Typography>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Capture (Complete Preauthorized Transaction):
                    </Typography>
                    <CodeBlock>{`POST /api/strapi-plugin-payone-provider/capture

{
  "txid": "12345678",
  "amount": 1000,
  "currency": "EUR",
  "reference": "CAPTURE-00123-ABCD",
  "sequencenumber": 1,
  "capturemode": "full"  // For wallet payments: "full" or "partial"
}`}</CodeBlock>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      <strong>Note:</strong> <code>capturemode</code> is only required for wallet payments (PayPal, Google Pay, Apple Pay).
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Refund (Return Funds):
                    </Typography>
                    <CodeBlock>{`POST /api/strapi-plugin-payone-provider/refund

{
  "txid": "12345678",
  "amount": -1000,  // Negative amount for refund
  "currency": "EUR",
  "reference": "REFUND-00123-ABCD",
  "sequencenumber": 2
}`}</CodeBlock>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      <strong>Note:</strong> Refund amount must be negative. <code>sequencenumber</code> should be incremented for each operation on the same transaction.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Sequence Numbers:
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• <strong>Preauthorization:</strong> sequencenumber = 0 (default)</Typography>
                      <Typography variant="pi">• <strong>Capture:</strong> sequencenumber = 1 (first capture)</Typography>
                      <Typography variant="pi">• <strong>Refund:</strong> sequencenumber = 2 (first refund), 3 (second refund), etc.</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone Capture Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Capture" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Capture</a>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone Refund Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Refund" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Refund</a>
                    </Typography>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </AccordionContent>
        </Accordion>

        <Accordion id="test-credentials" expanded={expandedAccordions.testCredentials} onToggle={() => toggleAccordion('testCredentials')}>
          <AccordionToggle title="Test Credentials" />
          <AccordionContent>
            <Card className="payment-card">
              <CardBody padding={6}>
                <Stack spacing={4}>
                  <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: '12px' }}>
                    Test Credentials
                  </Typography>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Credit Card Test Cards (Standard):
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• <strong>Visa:</strong> 4111111111111111</Typography>
                      <Typography variant="pi">• <strong>Mastercard:</strong> 5555555555554444</Typography>
                      <Typography variant="pi">• <strong>Amex:</strong> 378282246310005</Typography>
                      <Typography variant="pi">• <strong>Expiry:</strong> Any future date (e.g., 12/25 = "2512")</Typography>
                      <Typography variant="pi">• <strong>CVC:</strong> Any 3 digits (4 digits for Amex)</Typography>
                    </Stack>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Test+and+Live+Data" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Test+and+Live+Data</a>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      3D Secure Test Cards (Special Test Data):
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• <strong>Visa 3DS Test Card:</strong> 4000000000000002</Typography>
                      <Typography variant="pi">• <strong>Mastercard 3DS Test Card:</strong> 5453010000059543</Typography>
                      <Typography variant="pi">• <strong>3DS Password:</strong> Usually "123456" or as provided by Payone</Typography>
                      <Typography variant="pi">• <strong>Expiry:</strong> Any future date (e.g., 12/25 = "2512")</Typography>
                      <Typography variant="pi">• <strong>CVC:</strong> Any 3 digits</Typography>
                    </Stack>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone 3D Secure Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/3D+Secure" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/3D+Secure</a>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      PayPal Test Data:
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• Use PayPal Sandbox test accounts</Typography>
                      <Typography variant="pi">• Create test accounts in PayPal Developer Dashboard</Typography>
                      <Typography variant="pi">• Test with both buyer and merchant sandbox accounts</Typography>
                    </Stack>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone PayPal Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/PayPal" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/PayPal</a>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Google Pay Test Data:
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• Use Google Pay test environment</Typography>
                      <Typography variant="pi">• Test cards are automatically provided by Google Pay SDK</Typography>
                      <Typography variant="pi">• Set <code>environment: 'TEST'</code> in Google Pay configuration</Typography>
                    </Stack>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone Google Pay Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Google+Pay" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Google+Pay</a>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Apple Pay Test Data:
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• Use Apple Pay test environment</Typography>
                      <Typography variant="pi">• Test cards are available in Wallet app on test devices</Typography>
                      <Typography variant="pi">• Requires registered domain with HTTPS (not localhost)</Typography>
                    </Stack>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone Apple Pay Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Apple+Pay" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Apple+Pay</a>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      Sofort Banking Test Data:
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• Use Sofort test environment</Typography>
                      <Typography variant="pi">• Test credentials provided by Payone</Typography>
                    </Stack>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone Sofort Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Sofort" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Sofort</a>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      SEPA Direct Debit Test Data:
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">• <strong>Test IBAN:</strong> DE89370400440532013000</Typography>
                      <Typography variant="pi">• <strong>Test BIC:</strong> COBADEFFXXX</Typography>
                      <Typography variant="pi">• <strong>Account Holder:</strong> Any test name</Typography>
                    </Stack>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      📚 <strong>Payone SEPA Documentation:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/SEPA+Direct+Debit" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/SEPA+Direct+Debit</a>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="pi" fontWeight="bold" marginBottom={2} style={{ marginBottom: '12px' }}>
                      General Test Data Resources:
                    </Typography>
                    <Stack spacing={2}>
                      <Typography variant="pi">📚 <strong>Payone Test Data Overview:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Test+and+Live+Data" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Test+and+Live+Data</a></Typography>
                      <Typography variant="pi">📚 <strong>Payone Test Cards:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Credit+Card+Test+Cards" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Credit+Card+Test+Cards</a></Typography>
                      <Typography variant="pi">📚 <strong>Payone Test Environment:</strong> <a href="https://docs.payone.com/display/public/PLATFORM/Test+Environment" target="_blank" rel="noopener noreferrer">https://docs.payone.com/display/public/PLATFORM/Test+Environment</a></Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </AccordionContent>
        </Accordion>

        <Box paddingTop={4}>
          <Typography variant="sigma" textColor="neutral600">
            For more information, visit the Payone documentation or contact your Payone account manager.
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

export default DocsPanel;
