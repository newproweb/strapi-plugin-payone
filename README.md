# Payone Provider Plugin for Strapi

A comprehensive Strapi plugin that integrates the Payone payment gateway into your Strapi application. This plugin provides both backend API integration and an admin panel interface for managing payment transactions.

## 📋 Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Using the Admin Panel](#using-the-admin-panel-recommended)
  - [Apple Pay Setup](#apple-pay-setup)
  - [Google Pay Configuration](#google-pay-configuration)
- [Usage](#usage)
  - [Base URL](#base-url)
  - [Common Request Headers](#common-request-headers)
  - [Common Response Fields](#common-response-fields)
- [Payment Methods & Operations](#payment-methods--operations)
  - [Credit Card](#credit-card)
  - [PayPal](#paypal)
  - [Google Pay](#google-pay)
  - [Apple Pay](#apple-pay)
  - [SEPA Direct Debit](#sepa-direct-debit)
  - [Sofort Banking](#sofort-banking)
- [TransactionStatus Notifications](#transactionstatus-notifications)
- [Notes](#notes)

## Features

- **Payone API Integration**: Full integration with Payone's Server API (v3.10)
- **Payment Operations**:
  - Preauthorization (reserve funds)
  - Authorization (immediate charge)
  - Capture (complete preauthorized transactions)
  - Refund (return funds to customers)
- **Admin Panel**:
  - Easy configuration interface
  - Transaction history viewer with filtering
  - Payment testing tools
  - Connection testing
- **Transaction Logging**: Automatic logging of all payment operations
- **Security**: Secure credential storage with masked API keys

## Requirements

Before installing this plugin, ensure you have:

- **Strapi**:
  - Version 5.x.x for plugin version 5.x.x
  - Version 4.6.0 or higher for plugin version 4.x.x
- **Node.js**: Version 18.0.0 to 20.x.x
- **npm**: Version 6.0.0 or higher
- **Payone Account**: Active Payone merchant account with API credentials

### Payone Credentials

You will need the following credentials from your Payone account:

1. **AID (Account ID)**: Your Payone sub-account identifier
2. **Portal ID**: Your Payone portal identifier
3. **Merchant ID (MID)**: Your merchant identifier
4. **Portal Key**: Your API authentication key (also called "Portal Key" or "Security Key")

> ℹ️ **How to get Payone credentials**: Log into your Payone Merchant Interface (PMI) and navigate to Configuration → Payment Portals → [Your Portal] → Advanced Tab to find these credentials.

## Installation


**Important**: Choose the correct version based on your Strapi version:

- **For Strapi 5.x.x**: Use plugin version `^5.x.x`
- **For Strapi 4.x.x**: Use plugin version `^4.x.x`

```bash
# npm
npm install strapi-plugin-payone-provider
# yarn
yarn add strapi-plugin-payone-provider
# pnpm
pnpm add strapi-plugin-payone-provider

```

> **Version Compatibility**: Make sure to install the correct plugin version that matches your Strapi version. Using an incompatible version may cause errors or unexpected behavior.



## Configuration

After installation, you need to configure your Payone credentials:

### Using the Admin Panel (Recommended)

1. Open **Payone Provider** in the sidebar menu
2. Go to the **Configuration** tab
3. Fill in your Payone credentials and save:
   - **Account ID (AID)**: Your Payone account ID
   - **Portal ID**: Your Payone portal ID
   - **Merchant ID (MID)**: Your merchant ID
   - **Portal Key**: Your API security key
   - **Mode**: Select `test` for testing or `live` for production
   - **API Version**: Leave as `3.10` (default)
4. Click **"Test Connection"** to verify your credentials

### Apple Pay setup

> ⚠️ **Important**: Apple Pay requires a registered domain with HTTPS. It does NOT work on localhost. For testing, use a production domain with HTTPS or test on a device with Safari (iOS/macOS).

#### Apple Pay Domain Verification File (.well-known)

Apple Pay requires a domain verification file to be placed on your server. This file must be accessible at:

```
https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
```

**Steps to set up the domain verification file:**

1. **Download the file from Payone:**

   - Download the domain verification file from Payone documentation: [https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev](https://docs.payone.com/payment-methods/apple-pay/apple-pay-without-dev)
   - Alternatively, log into your Payone Merchant Interface (PMI)
   - Navigate to **Configuration** → **Payment Portals** → **Apple Pay**

2. **Place the file in Strapi:**

   - Create the directory: `public/.well-known/` (if it doesn't exist)
   - Place the file at: `public/.well-known/apple-developer-merchantid-domain-association`

3. **Place the file in your Frontend (if separate):**

   - Create the directory: `public/.well-known/` (if it doesn't exist)
   - Place the file at: `public/.well-known/apple-developer-merchantid-domain-association`

4. **Verify accessibility:**
   - The file must be accessible via HTTPS at: `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`
   - Test by visiting the URL in your browser - you should see the file content

> ⚠️ **Critical**: Without this file, Apple Pay will NOT work on your domain. The file must be accessible via HTTPS and must match exactly what Payone provides.

#### Middleware Configuration for Apple Pay

Apple Pay requires Content Security Policy (CSP) configuration in `config/middlewares.js` to allow Apple Pay scripts. Without this configuration, Apple Pay will NOT work on your strapi admin for make test transaction.

**Required CSP directives:**

```javascript
module.exports = [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://applepay.cdn-apple.com", // Apple Pay SDK
            "https://www.apple.com", // Apple Pay manifest
          ],
          "connect-src": [
            "'self'",
            "https:",
            "https://applepay.cdn-apple.com", // Apple Pay API
            "https://www.apple.com", // Apple Pay manifest
          ],
          "frame-src": [
            "'self'",
            "https://applepay.cdn-apple.com", // Apple Pay iframe
          ],
        },
      },
    },
  },
  // ... other middlewares
];
```

> ⚠️ **Important**: Without this middleware configuration, Apple Pay scripts will be blocked and Apple Pay will NOT work!

### Google Pay Configuration


#### Middleware Configuration for Google Pay

Google Pay requires Content Security Policy (CSP) configuration in `config/middlewares.js` to allow Google Pay scripts. Without this configuration, Google Pay will NOT work on your strapi admin for make test transactions.

**Required CSP directives:**

```javascript
module.exports = [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://pay.google.com", // Google Pay SDK
          ],
          "connect-src": [
            "'self'",
            "https:",
            "https://pay.google.com", // Google Pay API
          ],
          "frame-src": [
            "'self'",
            "https://pay.google.com", // Google Pay iframe
          ],
        },
      },
    },
  },
  // ... other middlewares
];
```

> ⚠️ **Important**: Without this middleware configuration, Google Pay scripts will be blocked and Google Pay will NOT work!


## Usage

### Base URL

All API endpoints are available at:

**Content API (Frontend)**: `/api/strapi-plugin-payone-provider`

**Admin API**: `/strapi-plugin-payone-provider`

> ⚠️ **Authentication Required**: All endpoints require authentication. Include your Bearer token in the Authorization header.

### Common Request Headers

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_AUTH_TOKEN"
}
```

### Common Response Fields

All responses include:

- `status`: Transaction status (APPROVED, ERROR, REDIRECT, etc.)
- `txid`: Transaction ID (for successful transactions)
- `errorcode`: Error code (if status is ERROR)
- `errormessage`: Error message (if status is ERROR)

---

## Payment Methods & Operations

This section provides detailed API documentation for each supported payment method. Click on any payment method below to see the full implementation details:

### Credit Card

<details>
<summary><strong>Credit Card Payment Method</strong></summary>

#### Preauthorization/Authorization

**Endpoints:**
- `POST /api/strapi-plugin-payone-provider/preauthorization`
- `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**:

```json
{
  "amount": 1000,
  "currency": "EUR",
  "reference": "PAY1234567890ABCDEF",
  "clearingtype": "cc",
  "cardtype": "V",
  "cardpan": "4111111111111111",
  "cardexpiredate": "2512",
  "cardcvc2": "123",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "telephonenumber": "+4917512345678",
  "street": "Main Street 123",
  "zip": "12345",
  "city": "Berlin",
  "country": "DE",
  "successurl": "https://www.example.com/success",
  "errorurl": "https://www.example.com/error",
  "backurl": "https://www.example.com/back",
  "salutation": "Herr",
  "gender": "m",
  "ip": "127.0.0.1",
  "language": "de",
  "customer_is_present": "yes"
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789",
    "userid": "987654321"
  }
}
```

#### Capture

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/capture`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": 1000,
  "currency": "EUR",
  "sequencenumber": 1
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

#### Refund

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/refund`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": -1000,
  "currency": "EUR",
  "reference": "REF1234567890ABCDEF",
  "sequencenumber": 2
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

</details>

---

### PayPal

<details>
<summary><strong>PayPal Payment Method</strong></summary>

#### Preauthorization/Authorization

**Endpoints:**
- `POST /api/strapi-plugin-payone-provider/preauthorization`
- `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**:

```json
{
  "amount": 1000,
  "currency": "EUR",
  "reference": "PAY1234567890ABCDEF",
  "clearingtype": "wlt",
  "wallettype": "PPE",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "telephonenumber": "+4917512345678",
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
  "backurl": "https://www.example.com/back",
  "salutation": "Herr",
  "gender": "m",
  "ip": "127.0.0.1",
  "language": "de",
  "customer_is_present": "yes"
}
```

**Response**:

```json
{
  "data": {
    "status": "REDIRECT",
    "txid": "123456789",
    "redirecturl": "https://secure.pay1.de/redirect/..."
  }
}
```


#### Capture

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/capture`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": 1000,
  "currency": "EUR",
  "sequencenumber": 1,
  "capturemode": "full"
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

#### Refund

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/refund`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": -1000,
  "currency": "EUR",
  "reference": "REF1234567890ABCDEF",
  "sequencenumber": 2
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

</details>

---

### Google Pay

<details>
<summary><strong>Google Pay Payment Method</strong></summary>

#### Overview

Google Pay integration requires obtaining an encrypted payment token from Google Pay API and sending it to Payone. The token must be Base64 encoded before sending to Payone.

#### Getting Google Pay Token

**1. Include Google Pay Script**

```html
<script async src="https://pay.google.com/gp/p/js/pay.js"></script>
```

**2. Initialize Google Pay**

```javascript
const paymentsClient = new google.payments.api.PaymentsClient({
  environment: "TEST", // or "PRODUCTION" for live mode
});

const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

const allowedCardNetworks = ["MASTERCARD", "VISA"];
const allowedAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

const tokenizationSpecification = {
  type: "PAYMENT_GATEWAY",
  parameters: {
    gateway: "payonegmbh",
    gatewayMerchantId: "YOUR_PAYONE_MERCHANT_ID", // Use your Payone MID or Portal ID
  },
};

const cardPaymentMethod = {
  type: "CARD",
  parameters: {
    allowedCardNetworks,
    allowedAuthMethods,
  },
  tokenizationSpecification,
};

const isReadyToPayRequest = Object.assign({}, baseRequest);
isReadyToPayRequest.allowedPaymentMethods = [cardPaymentMethod];

paymentsClient.isReadyToPay(isReadyToPayRequest).then(function (response) {
  if (response.result) {
    // Google Pay is available, show button
  }
});
```

**3. Create Payment Button and Get Token**

```javascript
const paymentDataRequest = Object.assign({}, baseRequest);
paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
paymentDataRequest.transactionInfo = {
  totalPriceStatus: "FINAL",
  totalPrice: "10.00",
  currencyCode: "EUR",
};
paymentDataRequest.merchantInfo = {
  merchantId: "YOUR_GOOGLE_MERCHANT_ID", // Optional: from Google Console
  merchantName: "Your Merchant Name",
};

const button = paymentsClient.createButton({
  onClick: async () => {
    try {
      const paymentData = await paymentsClient.loadPaymentData(
        paymentDataRequest
      );
      const token = paymentData.paymentMethodData.tokenizationData.token;

      // Token is a JSON string, encode it to Base64 for Payone
      const base64Token = btoa(unescape(encodeURIComponent(token)));

      // Send to your backend
      await fetch("/api/strapi-plugin-payone-provider/preauthorization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_TOKEN",
        },
        body: JSON.stringify({
          amount: 1000,
          currency: "EUR",
          reference: "PAY1234567890ABCDEF",
          googlePayToken: base64Token,
        }),
      });
    } catch (error) {
      console.error("Google Pay error:", error);
    }
  },
});

document.getElementById("google-pay-button").appendChild(button);
```

**Token Format**

The token from Google Pay is a JSON string with the following structure:

```json
{
  "signature": "MEUCIFr4ETGzv0uLZX3sR+i1ScARXnRBrncyYFDX/TI/VSLCAiEAvC/Q4dqXMQhwcSdg/ZvXj8+up0wXsfHja3V/6z48/vk=",
  "intermediateSigningKey": {
    "signedKey": "{\"keyValue\":\"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7PWUi+e6WPUhNmTSQ2WN006oWlcWy0FtBWizw9sph1wvX9XcXUNRLcfcsmCBfI5IsKQkjAmYxpCSB+L5sIudLw\\u003d\\u003d\",\"keyExpiration\":\"1722393105282\"}",
    "signatures": [
      "MEUCIQCpU30A3g2pP93IBE5NxgO9ZcJlGF9YPzCZS7H4/IR1CQIgF6+I5t8olT8YsRDUcj7w3R1bvX4ZCcyFXE2+YXa+3H0="
    ]
  },
  "protocolVersion": "ECv2",
  "signedMessage": "{\"encryptedMessage\":\"...\",\"ephemeralPublicKey\":\"...\",\"tag\":\"...\"}"
}
```

**Important**: The token must be Base64 encoded before sending to Payone.

#### Preauthorization/Authorization

**Endpoints:**
- `POST /api/strapi-plugin-payone-provider/preauthorization`
- `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**:

```json
{
  "amount": 1000,
  "currency": "EUR",
  "reference": "PAY1234567890ABCDEF",
  "clearingtype": "wlt",
  "wallettype": "GGP",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "telephonenumber": "+4917512345678",
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
  "backurl": "https://www.example.com/back",
  "googlePayToken": "BASE64_ENCODED_TOKEN",
  "salutation": "Herr",
  "gender": "m",
  "ip": "127.0.0.1",
  "language": "de",
  "customer_is_present": "yes"
}
```

**Payone Request Parameters** (automatically added by plugin):

```json
{
  "request": "preauthorization",
  "amount": 1000,
  "currency": "EUR",
  "reference": "PAY1234567890ABCDEF",
  "clearingtype": "wlt",
  "wallettype": "GGP",
  "add_paydata[paymentmethod_token_data]": "BASE64_ENCODED_TOKEN",
  "add_paydata[paymentmethod]": "GGP",
  "add_paydata[paymentmethod_type]": "GOOGLEPAY",
  "add_paydata[gatewayid]": "payonegmbh",
  "add_paydata[gateway_merchantid]": "YOUR_PAYONE_MERCHANT_ID",
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
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```


#### Capture

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/capture`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": 1000,
  "currency": "EUR",
  "sequencenumber": 1
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

#### Refund

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/refund`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": -1000,
  "currency": "EUR",
  "reference": "REF1234567890ABCDEF",
  "sequencenumber": 2
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

#### Required Parameters for Google Pay

- `clearingtype`: Must be `"wlt"` (wallet)
- `wallettype`: Must be `"GGP"` (Google Pay)
- `add_paydata[paymentmethod_token_data]`: Base64 encoded Google Pay token (automatically added by plugin)
- `add_paydata[paymentmethod]`: `"GGP"` (automatically added by plugin)
- `add_paydata[paymentmethod_type]`: `"GOOGLEPAY"` (automatically added by plugin)
- `add_paydata[gatewayid]`: `"payonegmbh"` (automatically added by plugin)
- `add_paydata[gateway_merchantid]`: Your Payone Merchant ID (automatically added by plugin)
- Shipping address parameters (required for wallet payments)

</details>

---

### Apple Pay

<details>
<summary><strong>Apple Pay Payment Method</strong></summary>

#### Preauthorization/Authorization

**Endpoints:**
- `POST /api/strapi-plugin-payone-provider/preauthorization`
- `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**:

```json
{
  "amount": 1000,
  "currency": "EUR",
  "reference": "PAY1234567890ABCDEF",
  "clearingtype": "wlt",
  "wallettype": "APL",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "telephonenumber": "+4917512345678",
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
  "backurl": "https://www.example.com/back",
  "salutation": "Herr",
  "gender": "m",
  "ip": "127.0.0.1",
  "language": "de",
  "customer_is_present": "yes"
}
```

**Response**:

```json
{
  "data": {
    "status": "REDIRECT",
    "txid": "123456789",
    "redirecturl": "https://secure.pay1.de/redirect/..."
  }
}
```

#### Capture

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/capture`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": 1000,
  "currency": "EUR",
  "sequencenumber": 1,
  "capturemode": "full"
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

#### Refund

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/refund`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": -1000,
  "currency": "EUR",
  "reference": "REF1234567890ABCDEF",
  "sequencenumber": 2
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

</details>

---

### SEPA Direct Debit

<details>
<summary><strong>SEPA Direct Debit Payment Method</strong></summary>

#### Preauthorization/Authorization

**Endpoints:**
- `POST /api/strapi-plugin-payone-provider/preauthorization`
- `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**:

```json
{
  "amount": 1000,
  "currency": "EUR",
  "reference": "PAY1234567890ABCDEF",
  "clearingtype": "elv",
  "iban": "DE89370400440532013000",
  "bic": "COBADEFFXXX",
  "bankaccountholder": "John Doe",
  "bankcountry": "DE",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "telephonenumber": "+4917512345678",
  "street": "Main Street 123",
  "zip": "12345",
  "city": "Berlin",
  "country": "DE",
  "salutation": "Herr",
  "gender": "m",
  "ip": "127.0.0.1",
  "language": "de",
  "customer_is_present": "yes"
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789",
    "userid": "987654321"
  }
}
```

#### Capture

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/capture`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": 1000,
  "currency": "EUR",
  "sequencenumber": 1
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

#### Refund

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/refund`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": -1000,
  "currency": "EUR",
  "reference": "REF1234567890ABCDEF",
  "sequencenumber": 2
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

</details>

---

### Sofort Banking

<details>
<summary><strong>Sofort Banking Payment Method</strong></summary>

#### Preauthorization/Authorization

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/preauthorization`
- `POST /api/strapi-plugin-payone-provider/authorization`


**Request Body**:

```json
{
  "amount": 1000,
  "currency": "EUR",
  "reference": "PAY1234567890ABCDEF",
  "clearingtype": "sb",
  "onlinebanktransfertype": "PNT",
  "bankcountry": "DE",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "telephonenumber": "+4917512345678",
  "street": "Main Street 123",
  "zip": "12345",
  "city": "Berlin",
  "country": "DE",
  "successurl": "https://www.example.com/success",
  "errorurl": "https://www.example.com/error",
  "backurl": "https://www.example.com/back",
  "salutation": "Herr",
  "gender": "m",
  "ip": "127.0.0.1",
  "language": "de",
  "customer_is_present": "yes"
}
```

**Response**:

```json
{
  "data": {
    "status": "REDIRECT",
    "txid": "123456789",
    "redirecturl": "https://secure.pay1.de/redirect/..."
  }
}
```


#### Capture

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/capture`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": 1000,
  "currency": "EUR",
  "sequencenumber": 1
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

#### Refund

**Endpoint:**
- `POST /api/strapi-plugin-payone-provider/refund`

**Request Body**:

```json
{
  "txid": "123456789",
  "amount": -1000,
  "currency": "EUR",
  "reference": "REF1234567890ABCDEF",
  "sequencenumber": 2
}
```

**Response**:

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789"
  }
}
```

</details>

---

## TransactionStatus Notifications

The Payone platform provides an asynchronous way of notifying your system of changes to a transaction. These notifications are called "TransactionStatus" and are automatically handled by this plugin.

### What are TransactionStatus Notifications?

TransactionStatus notifications are POST requests sent from Payone's servers to your endpoint when transaction status changes occur. This is especially important for:

- **Redirect Payment Methods**: Verifying that payments were actually completed (prevents fraud)
- **Chargeback Processes**: Being notified when customers initiate chargebacks
- **Real-time Tracking**: Keeping your system updated with the latest transaction status

### How It Works

1. **Payone sends notification** → Your Strapi endpoint receives POST request
2. **Plugin verifies request** → Checks IP address, User-Agent, and hash signature
3. **Plugin processes notification** → Updates transaction history automatically
4. **Plugin responds** → Returns `TSOK` to confirm receipt

### Endpoint Configuration

The plugin automatically provides the TransactionStatus endpoint at:

**URL**: `POST /api/strapi-plugin-payone-provider/transaction-status`

**No authentication required** - The endpoint is secured by:

- IP address verification (only Payone IPs allowed)
- User-Agent verification (must be "PAYONE FinanceGate")
- Hash signature verification (MD5 hash of transaction data)

### PMI Configuration

You need to configure this endpoint in your Payone Merchant Interface (PMI):

1. Log into your Payone Merchant Interface (PMI)
2. Navigate to **Configuration** → **Payment Portals** → **[Your Portal]**
3. Find the **TransactionStatus Endpoint** setting
4. Enter your endpoint URL: `https://yourdomain.com/api/strapi-plugin-payone-provider/transaction-status`
5. Save the configuration

> ⚠️ **Important**: The endpoint must be accessible via HTTPS. Payone will not send notifications to HTTP endpoints.

### Security Features

The plugin automatically verifies:

1. **IP Address**: Only accepts requests from Payone's IP ranges:

   - `185.60.20.0/24`
   - `54.246.203.105`

2. **User-Agent**: Must be exactly `"PAYONE FinanceGate"`

3. **Hash Signature**: Verifies MD5 hash using your Portal Key:

   ```
   MD5(portalid + aid + txid + sequencenumber + price + currency + mode + key)
   ```

4. **Credentials**: Verifies that `portalid` and `aid` match your configured settings

> 📖 **Reference**: For more details, see [Payone TransactionStatus Notification Documentation](https://docs.payone.com/integration/response-handling/transactionstatus-notification)

---

## Notes

For additional information and updates, please refer to the official Payone documentation:

**Payone Documentation**: [https://docs.payone.com/payment-methods](https://docs.payone.com/payment-methods)
