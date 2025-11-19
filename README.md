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
- **3D Secure (3DS) Support**: Full 3D Secure 2.0 authentication for credit card payments (SCA compliance)
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
   - **Enable 3D Secure**: Enable/disable 3D Secure authentication for credit card payments (recommended for SCA compliance)
5. Click **"Test Connection"** to verify your credentials
6. Click **"Save Configuration"** to store your settings

> 🔒 **3D Secure Note**: When 3D Secure is enabled, credit card payments will automatically require customer authentication through the 3DS flow. This is required for Strong Customer Authentication (SCA) compliance in Europe.

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

### Overview

3D Secure (3DS) is an additional security layer for credit card payments that requires customers to authenticate themselves during the payment process. This plugin fully supports 3D Secure 2.0, which is required for Strong Customer Authentication (SCA) compliance in Europe.

### How 3D Secure Works

When 3D Secure is enabled in your plugin settings, the payment flow works as follows:

#### 1. **Initial Payment Request**

When you send a preauthorization or authorization request for a credit card payment:

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

#### 2. **3DS Redirect Response**

If 3D Secure authentication is required, Payone will return a redirect response:

```json
{
  "data": {
    "status": "REDIRECT",
    "txid": "123456789",
    "redirecturl": "https://secure.pay1.de/3ds/authenticate/...",
    "requires3DSRedirect": true
  }
}
```

#### 3. **Customer Authentication**

The customer is automatically redirected to the 3DS authentication page where they:
- Enter their 3DS password/PIN
- Or use biometric authentication (fingerprint, face ID)
- Or receive and enter a one-time code via SMS/email

#### 4. **Callback Processing**

After authentication, Payone redirects the customer back to your `successurl`, `errorurl`, or `backurl` with callback data. The plugin automatically processes this callback and logs the transaction.

#### 5. **Final Transaction Status**

The callback contains the final transaction status:

```json
{
  "status": "APPROVED",  // or "ERROR" if authentication failed
  "txid": "123456789",
  "reference": "PAY1234567890ABCDEF"
}
```

### 3D Secure Configuration

#### Enable 3D Secure

1. Go to **Payone Provider** → **Configuration** tab
2. Find the **"Enable 3D Secure"** dropdown
3. Select **"Enabled"**
4. Click **"Save Configuration"**

#### Disable 3D Secure

1. Go to **Payone Provider** → **Configuration** tab
2. Set **"Enable 3D Secure"** to **"Disabled"**
3. Click **"Save Configuration"**

> ⚠️ **Important**: Disabling 3D Secure may result in failed payments in Europe due to SCA requirements. It's recommended to keep 3D Secure enabled for production environments.

### 3D Secure Parameters

When 3D Secure is enabled, the plugin automatically adds these parameters to credit card payment requests:

- `3dsecure: "yes"` - Enables 3D Secure authentication
- `ecommercemode: "internet"` - Indicates e-commerce transaction

These parameters are added automatically - you don't need to include them in your request.

### Redirect URLs for 3DS

When using 3D Secure, you **must** provide redirect URLs in your payment request:

- `successurl`: Where to redirect after successful 3DS authentication
- `errorurl`: Where to redirect if 3DS authentication fails
- `backurl`: Where to redirect if customer cancels 3DS authentication

**Example**:

```json
{
  "successurl": "https://www.example.com/payment/success",
  "errorurl": "https://www.example.com/payment/error",
  "backurl": "https://www.example.com/payment/cancelled"
}
```

### Handling 3DS Redirects

#### Frontend (JavaScript)

When the API returns a redirect response, handle it like this:

```javascript
const response = await fetch('/api/strapi-plugin-payone-provider/authorization', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify(paymentData)
});

const result = await response.json();

// Check if 3DS redirect is required
if (result.data.requires3DSRedirect && result.data.redirectUrl) {
  // Redirect customer to 3DS authentication page
  window.location.href = result.data.redirectUrl;
} else {
  // Payment completed without 3DS (or 3DS not required)
  console.log('Payment status:', result.data.status);
}
```

#### Backend Processing

The plugin automatically:
1. Detects 3DS redirect responses
2. Processes 3DS callbacks from Payone
3. Logs all 3DS transactions
4. Returns final transaction status

### 3DS Callback Endpoint

The plugin provides a callback endpoint for processing 3DS authentication results:

**URL**: `POST /api/strapi-plugin-payone-provider/3ds-callback`

This endpoint is automatically called by Payone after 3DS authentication. You typically don't need to call it manually.

### Testing 3D Secure

#### Test Cards

Use these test cards to test 3D Secure in test mode:

- **Visa**: `4111111111111111` (requires 3DS)
- **Mastercard**: `5555555555554444` (requires 3DS)
- **3DS Test Password**: Usually `12345` or as configured in your Payone test account

#### Test Flow

1. Enable 3D Secure in plugin settings
2. Make a test authorization/preauthorization request
3. You should receive a `REDIRECT` status with `redirecturl`
4. Follow the redirect to complete 3DS authentication
5. Check transaction history for the final status

### Troubleshooting 3D Secure

#### Issue: No redirect received

**Solution**: 
- Verify 3D Secure is enabled in settings
- Check that you're using a credit card payment method (`clearingtype: "cc"`)
- Ensure redirect URLs are provided in the request

#### Issue: 3DS authentication fails

**Solution**:
- Verify test card credentials
- Check Payone portal settings for 3DS configuration
- Review error messages in transaction history

#### Issue: Callback not received

**Solution**:
- Verify redirect URLs are accessible from the internet
- Check that callback endpoint is properly configured
- Review server logs for callback requests

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

**Response** (3D Secure Disabled):

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789",
    "userid": "987654321"
  }
}
```

**Response** (3D Secure Enabled - Redirect Required):

```json
{
  "data": {
    "status": "REDIRECT",
    "txid": "123456789",
    "redirecturl": "https://secure.pay1.de/3ds/authenticate/...",
    "requires3DSRedirect": true
  }
}
```

> 🔐 **3D Secure Note**: When 3D Secure is enabled, you'll receive a `REDIRECT` status with a `redirecturl`. Redirect the customer to this URL to complete 3DS authentication. After authentication, Payone will redirect back to your `successurl` with the final transaction status.

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

**Response** (3D Secure Disabled):

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789",
    "userid": "987654321"
  }
}
```

**Response** (3D Secure Enabled - Redirect Required):

```json
{
  "data": {
    "status": "REDIRECT",
    "txid": "123456789",
    "redirecturl": "https://secure.pay1.de/3ds/authenticate/...",
    "requires3DSRedirect": true
  }
}
```

> 🔐 **3D Secure Note**: When 3D Secure is enabled, you'll receive a `REDIRECT` status with a `redirecturl`. Redirect the customer to this URL to complete 3DS authentication. After authentication, Payone will redirect back to your `successurl` with the final transaction status.

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

#### Preauthorization

**URL**: `POST /api/strapi-plugin-payone-provider/preauthorization`

**Request Body**:

```json
{
  "amount": 1000,
  "currency": "EUR",
  "reference": "PAY1234567890ABCDEF",
  "clearingtype": "wlt",
  "wallettype": "GPP",
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
  "wallettype": "GPP",
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

### 3D Secure Best Practices

1. **Always Enable in Production**: Keep 3D Secure enabled for production to ensure SCA compliance
2. **Provide Valid Redirect URLs**: Ensure your redirect URLs are publicly accessible and handle callbacks properly
3. **Test Thoroughly**: Test the complete 3DS flow in test mode before going live
4. **Monitor Transactions**: Check transaction history regularly for 3DS authentication results
5. **Handle Errors Gracefully**: Implement proper error handling for failed 3DS authentications
6. **User Experience**: Inform customers that they'll be redirected for additional security verification
