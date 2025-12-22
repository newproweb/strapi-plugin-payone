# Payone Provider Plugin for Strapi

A comprehensive Strapi plugin that integrates the Payone payment gateway into your Strapi application. This plugin provides both backend API integration and an admin panel interface for managing payment transactions.

## 📋 Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [3D Secure (3DS) Authentication](#-3d-secure-3ds-authentication)
- [Payment Methods & Operations](#-payment-methods--operations)
- [Supported Payment Methods](#supported-payment-methods)

## ✨ Features

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
- **Test & Live Modes**: Support for both test and production environments

## 🔧 Requirements

Before installing this plugin, ensure you have:

- **Strapi**: Version 4.6.0 or higher
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

## 📦 Installation

### Install from npm

```bash
# Using npm
npm install strapi-plugin-payone-provider

# Using yarn
yarn add strapi-plugin-payone-provider

# Using pnpm
pnpm add strapi-plugin-payone-provider
```

## ⚙️ Configuration

After installation, you need to configure your Payone credentials:

### Using the Admin Panel (Recommended)

1. Log into your Strapi admin panel
2. Navigate to **Payone Provider** in the sidebar menu
3. Go to the **Configuration** tab
4. Fill in your Payone credentials:
   - **Account ID (AID)**: Your Payone account ID
   - **Portal ID**: Your Payone portal ID
   - **Merchant ID (MID)**: Your merchant ID
   - **Portal Key**: Your API security key
   - **Mode**: Select `test` for testing or `live` for production
   - **API Version**: Leave as `3.10` (default)
5. Click **"Test Connection"** to verify your credentials
6. Click **"Save Configuration"** to store your settings

### Apple Pay Configuration

To configure Apple Pay settings:

1. Navigate to **Payone Provider** in the sidebar menu
2. Go to **Payment Actions** tab
3. Select **Apple Pay** as the payment method
4. Click on the Apple Pay configuration link: `/plugins/strapi-plugin-payone-provider/apple-pay-config`
5. Configure the following settings:
   - **Country Code**: Select the country where your business operates
   - **Currency Code**: Select the currency for transactions
   - **Supported Networks**: Select payment card networks (Visa, Mastercard, Amex, etc.)
   - **Merchant Capabilities**: Select payment capabilities (3D Secure is recommended)
   - **Button Style & Type**: Customize the Apple Pay button appearance
6. Click **"Save Apple Pay Configuration"** to store your settings

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
   - Download the `apple-developer-merchantid-domain-association` file

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

Apple Pay requires Content Security Policy (CSP) configuration in `config/middlewares.js` to allow Apple Pay scripts. Without this configuration, Apple Pay will NOT work.

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

To configure Google Pay settings:

1. Navigate to **Payone Provider** in the sidebar menu
2. Go to **Payment Actions** tab
3. Select **Google Pay** as the payment method
4. Click on the Google Pay configuration link: `/plugins/strapi-plugin-payone-provider/google-pay-config`
5. Configure the following settings:
   - **Country Code**: Select the country where your business operates
   - **Currency Code**: Select the currency for transactions
   - **Merchant Name**: Enter your business name as it will appear in Google Pay
   - **Allowed Card Networks**: Select payment card networks (Mastercard, Visa, Amex, etc.)
   - **Allowed Authentication Methods**: Select authentication methods (PAN Only, 3D Secure)
6. Click **"Save Google Pay Configuration"** to store your settings

> ℹ️ **Note**: The Gateway Merchant ID will be automatically obtained from your Payone Merchant ID (MID) or Portal ID configured in the main Configuration tab.

#### Middleware Configuration for Google Pay

Google Pay requires Content Security Policy (CSP) configuration in `config/middlewares.js` to allow Google Pay scripts. Without this configuration, Google Pay will NOT work.

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

## 🚀 Getting Started

### 1. Test Your Connection

After configuring your credentials:

1. Open the **Configuration** tab in the Payone Provider admin panel
2. Click the **"Test Connection"** button
3. If successful, you'll see a green success message
4. If it fails, check your credentials and try again

### 2. Try a Test Payment

1. Go to the **Payment Actions** tab
2. Try a **Preauthorization** operation:
   - Amount: 1000 (equals 10.00 EUR in cents)
   - Reference: Leave empty for auto-generation
   - Click **"Execute Preauthorization"**
3. Check the **Transaction History** tab to see the logged transaction

## 📖 Usage

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

## 🔐 3D Secure (3DS) Authentication

3D Secure (3DS) is a security protocol that adds an extra layer of authentication for credit card payments, ensuring compliance with Strong Customer Authentication (SCA) requirements.

### Enabling 3D Secure

1. Navigate to **Payone Provider** in the Strapi admin panel
2. Go to the **Configuration** tab
3. Find the **"Enable 3D Secure"** dropdown
4. Select **"Enabled"** to activate 3DS for credit card payments
5. Click **"Save Configuration"**

> ⚠️ **Note**: When 3DS is enabled, it only applies to **credit card** payments (`clearingtype: "cc"`). Other payment methods are not affected.

### Supported Operations

3D Secure works with the following operations:

- ✅ **Preauthorization** (`POST /api/strapi-plugin-payone-provider/preauthorization`)
- ✅ **Authorization** (`POST /api/strapi-plugin-payone-provider/authorization`)
- ❌ **Capture** - Not applicable (uses preauthorized transaction)
- ❌ **Refund** - Not applicable (uses existing transaction)

### Required Parameters for Preauthorization/Authorization with 3DS

When 3DS is enabled and you're making a credit card payment, the following parameters are required:

**Credit Card Details** (required when 3DS is enabled):

- `cardtype`: Card type (`"V"` for VISA, `"M"` for Mastercard, `"A"` for AMEX, etc.)
- `cardpan`: Card number (PAN)
- `cardexpiredate`: Expiry date in format `YYMM` (e.g., `"2512"` for December 2025)
- `cardcvc2`: CVC/CVV code (3 digits for most cards, 4 digits for AMEX)

**Redirect URLs** (required for 3DS authentication flow):

- `successurl`: URL to redirect after successful 3DS authentication
- `errorurl`: URL to redirect after 3DS authentication error
- `backurl`: URL to redirect if user cancels 3DS authentication

**Example Request**:

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
  "street": "Main Street 123",
  "zip": "12345",
  "city": "Berlin",
  "country": "DE",
  "successurl": "https://www.example.com/success",
  "errorurl": "https://www.example.com/error",
  "backurl": "https://www.example.com/back"
}
```

### 3DS Response Handling

When 3DS is required, the API response will include:

```json
{
  "data": {
    "status": "REDIRECT",
    "redirecturl": "https://secure.pay1.de/3ds/...",
    "requires3DSRedirect": true,
    "txid": "123456789"
  }
}
```

**Response Fields**:

- `status`: `"REDIRECT"` when 3DS authentication is required
- `redirecturl`: URL to redirect the customer for 3DS authentication
- `requires3DSRedirect`: Boolean indicating if redirect is needed
- `txid`: Transaction ID (if available)

### 3DS Callback Endpoint

After the customer completes 3DS authentication, Payone will send a callback to:

**URL**: `POST /api/strapi-plugin-payone-provider/3ds-callback`

This endpoint processes the 3DS authentication result and updates the transaction status.

> ℹ️ **Note**: The callback endpoint is automatically handled by the plugin. You don't need to manually process it unless you're implementing custom callback handling.

### How It Works

1. **Request**: Send a preauthorization or authorization request with credit card details and redirect URLs
2. **Response**: If 3DS is required, you'll receive a `REDIRECT` status with a `redirecturl`
3. **Redirect**: Redirect the customer to the `redirecturl` for 3DS authentication
4. **Callback**: After authentication, Payone redirects back to your `successurl`, `errorurl`, or `backurl` with transaction data
5. **Completion**: The transaction is completed based on the authentication result

### Testing 3DS

For testing 3DS authentication, use test cards that trigger 3DS challenges. Refer to the [Payone 3D Secure Documentation](https://docs.payone.com/security-risk-management/3d-secure#/) for test card numbers and scenarios.

---

## 💳 Payment Methods & Operations

### Credit Card

<details>
<summary><strong>Credit Card Payment Method</strong></summary>

#### Preauthorization

**URL**: `POST /api/strapi-plugin-payone-provider/preauthorization`

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

#### Authorization

**URL**: `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**: (Same as Preauthorization)

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

**URL**: `POST /api/strapi-plugin-payone-provider/capture`

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

**URL**: `POST /api/strapi-plugin-payone-provider/refund`

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

#### Preauthorization

**URL**: `POST /api/strapi-plugin-payone-provider/preauthorization`

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

#### Authorization

**URL**: `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**: (Same as Preauthorization)

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

**URL**: `POST /api/strapi-plugin-payone-provider/capture`

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

**URL**: `POST /api/strapi-plugin-payone-provider/refund`

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
  environment: "TEST", // or "PRODUCTION" for live
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

#### Preauthorization

**URL**: `POST /api/strapi-plugin-payone-provider/preauthorization`

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

#### Authorization

**URL**: `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**: (Same as Preauthorization, include `googlePayToken`)

```json
{
  "amount": 1000,
  "currency": "EUR",
  "reference": "PAY1234567890ABCDEF",
  "clearingtype": "wlt",
  "wallettype": "GGP",
  "googlePayToken": "BASE64_ENCODED_TOKEN",
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

**URL**: `POST /api/strapi-plugin-payone-provider/capture`

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

**URL**: `POST /api/strapi-plugin-payone-provider/refund`

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

#### Preauthorization

**URL**: `POST /api/strapi-plugin-payone-provider/preauthorization`

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

#### Authorization

**URL**: `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**: (Same as Preauthorization)

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

**URL**: `POST /api/strapi-plugin-payone-provider/capture`

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

**URL**: `POST /api/strapi-plugin-payone-provider/refund`

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

#### Preauthorization

**URL**: `POST /api/strapi-plugin-payone-provider/preauthorization`

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

#### Authorization

**URL**: `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**: (Same as Preauthorization)

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

**URL**: `POST /api/strapi-plugin-payone-provider/capture`

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

**URL**: `POST /api/strapi-plugin-payone-provider/refund`

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

#### Preauthorization

**URL**: `POST /api/strapi-plugin-payone-provider/preauthorization`

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

#### Authorization

**URL**: `POST /api/strapi-plugin-payone-provider/authorization`

**Request Body**: (Same as Preauthorization)

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

**URL**: `POST /api/strapi-plugin-payone-provider/capture`

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

**URL**: `POST /api/strapi-plugin-payone-provider/refund`

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

## ✅ Supported Payment Methods

Click on any payment method to see detailed API documentation:

- [Credit Card](#credit-card)
- [PayPal](#paypal)
- [Google Pay](#google-pay)
- [Apple Pay](#apple-pay)
- [SEPA Direct Debit](#sepa-direct-debit)
- [Sofort Banking](#sofort-banking)

---

## 📝 Notes

### Important Parameters

- **amount**: Always in cents (e.g., 1000 = 10.00 EUR)
- **reference**: Max 20 characters, alphanumeric only. Auto-normalized by the plugin.
- **cardexpiredate**: Format is YYMM (e.g., "2512" = December 2025)
- **sequencenumber**: Start with 1 for capture, 2 for first refund, increment for subsequent refunds
- **Refund amount**: Must be negative (e.g., -1000 for 10.00 EUR refund)

### Redirect URLs

For redirect-based payment methods (PayPal, Google Pay, Apple Pay, Sofort), you must provide:

- `successurl`: URL to redirect after successful payment
- `errorurl`: URL to redirect after payment error
- `backurl`: URL to redirect if user cancels payment

### Preauthorization vs Authorization

- **Preauthorization**: Reserves funds but doesn't charge immediately. Requires a Capture call later.
- **Authorization**: Immediately charges the customer's payment method.

### Capture Mode

For wallet payments (PayPal, Google Pay, Apple Pay), you can specify:

- `capturemode: "full"`: Capture the entire preauthorized amount
- `capturemode: "partial"`: Capture less than the preauthorized amount
