# Payone Provider Plugin for Strapi

A comprehensive Strapi plugin that integrates the Payone payment gateway into your Strapi application. This plugin provides both backend API integration and an admin panel interface for managing payment transactions.

## 📋 Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Admin Panel](#admin-panel)
  - [API Endpoints](#api-endpoints)
- [Supported Payment Methods](#supported-payment-methods)
- [Payment Operations](#payment-operations)
- [Transaction History](#transaction-history)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## ✨ Features

- **Payone API Integration**: Full integration with Payone's Server API (v3.10)
- **Payment Operations**:
  - Preauthorization (reserve funds)
  - Authorization (immediate charge)
  - Capture (complete preauthorized transactions) — currently Credit Card only
  - Refund (return funds to customers) — currently Credit Card only
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

### Option 1: Install from npm (if published)

```bash
npm install payone-provider
```

### Option 2: Manual Installation

1. Copy the `payone-provider` folder to your Strapi project's `src/plugins/` directory:

```bash
# From your Strapi project root
mkdir -p src/plugins
cp -r /path/to/payone-provider src/plugins/
```

2. Install the plugin dependencies:

```bash
npm install
```

3. Enable the plugin by adding it to your `config/plugins.js` (or `config/plugins.ts`):

```javascript
module.exports = {
  // ... other plugins
  'payone-provider': {
    enabled: true,
    resolve: './src/plugins/payone-provider',
  },
};
```

4. Rebuild your Strapi admin panel:

```bash
npm run build
```

5. Restart your Strapi application:

```bash
npm run develop
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

### Manual Configuration (Alternative)

You can also configure the plugin programmatically by adding settings to your `config/plugins.js`:

```javascript
module.exports = {
  'payone-provider': {
    enabled: true,
    resolve: './src/plugins/payone-provider',
    config: {
      settings: {
        aid: 'YOUR_ACCOUNT_ID',
        portalid: 'YOUR_PORTAL_ID',
        mid: 'YOUR_MERCHANT_ID',
        key: 'YOUR_PORTAL_KEY',
        mode: 'test', // or 'live'
        api_version: '3.10',
      },
    },
  },
};
```

> ⚠️ **Security Warning**: Never commit your production credentials to version control. Use environment variables instead:

```javascript
module.exports = {
  'payone-provider': {
    enabled: true,
    config: {
      settings: {
        aid: process.env.PAYONE_AID,
        portalid: process.env.PAYONE_PORTAL_ID,
        mid: process.env.PAYONE_MID,
        key: process.env.PAYONE_KEY,
        mode: process.env.PAYONE_MODE || 'test',
        api_version: '3.10',
      },
    },
  },
};
```

## 🚀 Getting Started

### 1. Test Your Connection

After configuring your credentials:

1. Open the **Configuration** tab in the Payone Provider admin panel
2. Click the **"Test Connection"** button
3. If successful, you'll see a green success message
4. If it fails, check your credentials and try again

### 2. Try a Test Payment

1. Go to the **Payment Actions** tab
2. Try a **Preauthorization** operation (currently test UI supports Credit Card only):
   - Amount: 1000 (equals 10.00 EUR in cents)
   - Reference: Leave empty for auto-generation
   - Click **"Execute Preauthorization"**
3. Check the **Transaction History** tab to see the logged transaction

### 3. Review Transaction History

1. Navigate to the **Transaction History** tab
2. View all payment operations
3. Use filters to search for specific transactions
4. Click on any transaction to view full details

## 📖 Usage

### Admin Panel

The plugin adds a new menu item **"Payone Provider"** to your Strapi admin panel with three tabs:

#### 1. Configuration Tab

- Configure Payone API credentials
- Test connection to Payone servers
- Switch between test and live modes

#### 2. Transaction History Tab

- View all payment transactions
- Filter by status, type, transaction ID, reference, or date range
- View detailed request/response data for each transaction
- Pagination support for large transaction lists

#### 3. Payment Actions Tab

- Test payment operations without writing code
- Execute preauthorizations, authorizations, captures, and refunds
- View real-time results and error messages

### API Endpoints

The plugin provides REST API endpoints for programmatic access:

#### Content API Endpoints (Public with Auth Policy)

All content API endpoints require authentication via the `isAuth` policy. These are meant for your frontend application.

Base URL: `/api/payone-provider`

##### POST `/api/payone-provider/preauthorization`

Reserve funds on a customer's card without immediate charge.

**Request Body:**

```json
{
  "amount": 1000,
  "currency": "EUR",
  "reference": "ORDER-12345",
  "clearingtype": "cc",
  "cardtype": "V",
  "cardpan": "4111111111111111",
  "cardexpiredate": "2512",
  "cardcvc2": "123",
  "firstname": "John",
  "lastname": "Doe",
  "street": "Main Street 123",
  "zip": "12345",
  "city": "Berlin",
  "country": "DE",
  "email": "john.doe@example.com"
}
```

**Response:**

```json
{
  "data": {
    "status": "APPROVED",
    "txid": "123456789",
    "userid": "987654321"
  }
}
```

##### POST `/api/payone-provider/authorization`

Immediately charge a customer's card.

**Request Body:** (Same as preauthorization)

> Note: For redirect-based methods (PayPal, Online Banking) you must provide `successurl`, `errorurl`, and `backurl`. The plugin will auto-fill safe defaults when missing, using `settings.return_base` or `PAYONE_RETURN_BASE`/`FRONTEND_URL`/`NEXT_PUBLIC_SITE_URL`.

##### POST `/api/payone-provider/capture`

Complete a preauthorized transaction and capture the funds.

**Request Body:**

```json
{
  "txid": "123456789",
  "amount": 1000,
  "currency": "EUR"
}
```

##### POST `/api/payone-provider/refund`

Refund a captured transaction.

**Request Body:**

```json
{
  "txid": "123456789",
  "amount": -1000,
  "currency": "EUR",
  "reference": "REFUND-12345",
  "sequencenumber": 2
}
```

#### Admin API Endpoints

These endpoints require admin authentication and are available at `/payone-provider/`.

- `GET /payone-provider/settings` - Get current settings
- `PUT /payone-provider/settings` - Update settings
- `GET /payone-provider/transaction-history` - Get transaction history
- `POST /payone-provider/test-connection` - Test Payone connection
- All payment operation endpoints (same as content API)

### JavaScript/TypeScript Usage Example

```javascript
// In your frontend application
import axios from 'axios';

const processPayment = async (orderData) => {
  try {
    // Step 1: Preauthorize the payment
    const preauth = await axios.post(
      'http://localhost:1337/api/payone-provider/preauthorization',
      {
        amount: orderData.amount, // in cents, e.g., 1000 = 10.00 EUR
        currency: 'EUR',
        reference: orderData.orderId,
        clearingtype: 'cc',
        cardtype: 'V', // Visa
        cardpan: orderData.cardNumber,
        cardexpiredate: orderData.cardExpiry, // YYMM format
        cardcvc2: orderData.cardCvc,
        firstname: orderData.firstName,
        lastname: orderData.lastName,
        street: orderData.street,
        zip: orderData.zip,
        city: orderData.city,
        country: orderData.country,
        email: orderData.email,
      },
      {
        headers: {
          Authorization: `Bearer ${yourAuthToken}`,
        },
      }
    );

    if (preauth.data.data.status === 'APPROVED') {
      const txid = preauth.data.data.txid;

      // Step 2: Capture the preauthorized amount
      const capture = await axios.post(
        'http://localhost:1337/api/payone-provider/capture',
        {
          txid: txid,
          amount: orderData.amount,
          currency: 'EUR',
        },
        {
          headers: {
            Authorization: `Bearer ${yourAuthToken}`,
          },
        }
      );

      return {
        success: true,
        transactionId: txid,
      };
    }
  } catch (error) {
    console.error('Payment failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
```

## 💳 Payment Operations

## ✅ Supported Payment Methods

The plugin supports the following Payone clearing types. Required fields are listed per method. All methods also require the common customer and address fields shown below.

Common required fields (all methods):

- `amount` (in cents), `currency`, `reference` (max 20 chars; auto-normalized)
- `firstname`, `lastname`, `email`, `telephonenumber`
- `street`, `zip`, `city`, `country`

Credit Card (`clearingtype = cc`):

- Required: `cardtype` (V/M/A...), `cardpan`, `cardexpiredate` (MMyy), `cardcvc2`
- Operations: preauthorization, authorization, capture, refund
- Test payment in Admin currently supported for Credit Card only

PayPal Wallet (`clearingtype = wlt`, `wallettype = PPE`):

- Required: `successurl`, `errorurl`, `backurl` (redirect URLs)
- Recommended shipping fields: `shipping_firstname`, `shipping_lastname`, `shipping_street`, `shipping_zip`, `shipping_city`, `shipping_country`
- Operations: preauthorization, authorization (capture/refund roadmap)

SEPA Direct Debit (`clearingtype = elv`):

- Required: `iban`, `bic`, `bankaccountholder`, `bankcountry`
- Operations: preauthorization, authorization (capture/refund roadmap)

Online Banking/PNT (`clearingtype = sb`):

- Required: `onlinebanktransfertype` (e.g. `PNT`), `bankcountry`, redirect URLs (`successurl`, `errorurl`, `backurl`)
- Operations: authorization (capture/refund roadmap)

Notes:

- The plugin normalizes `reference` server-side to comply with Payone (alphanumeric only, max 20 chars, auto-generated fallback).
- For redirect flows, the plugin auto-fills redirect URLs when missing using a base URL from settings or environment.

### Preauthorization vs Authorization

- **Preauthorization**: Reserves funds on the customer's card but doesn't charge it immediately. Use this when you need to verify funds availability before fulfilling an order (e.g., hotel bookings, rentals). You must later call "Capture" to actually charge the card.

- **Authorization**: Immediately charges the customer's card. Use this for instant payments (e.g., e-commerce purchases).

### Capture

After a successful preauthorization, you must capture the transaction to receive the funds. Captures can be:

- **Full capture**: Capture the entire preauthorized amount
- **Partial capture**: Capture less than the preauthorized amount

### Refund

Refunds return money to the customer. Important notes:

- Amount must be negative (e.g., -1000 for 10.00 EUR)
- Requires a valid transaction ID (txid)
- Requires a sequence number (start with 2, increment for each additional refund on same transaction)

> Current limitation: Capture and Refund are implemented for Credit Card only. Support for PayPal/SEPA/Online Banking will be added in future updates.

## 📊 Transaction History

All payment operations are automatically logged to the transaction history. Each entry includes:

- **Transaction ID (txid)**: Payone's unique transaction identifier
- **Reference**: Your custom order/payment reference
- **Type**: Operation type (authorization, preauthorization, capture, refund)
- **Amount**: Transaction amount in cents
- **Currency**: Currency code (EUR, USD, etc.)
- **Status**: APPROVED, ERROR, REDIRECT, etc.
- **Timestamp**: When the transaction occurred
- **Raw Request/Response**: Complete API request and response data for debugging

### Filtering Transactions

Use the filters in the Transaction History tab to find specific transactions:

- **Status**: Filter by APPROVED, ERROR, etc.
- **Type**: Filter by operation type
- **Transaction ID**: Search by specific txid
- **Reference**: Search by your order reference
- **Date Range**: Filter by date

## 🔍 Troubleshooting

### Connection Test Fails

**Problem**: "Authentication failed" or "Invalid credentials"

**Solutions**:

1. Verify your AID, Portal ID, Merchant ID, and Portal Key are correct
2. Ensure you're using the correct mode (test/live)
3. Check that your Payone account is active and not suspended
4. Verify the Portal Key is the MD5 hash key from your Payone PMI

### Payment Gets Rejected

**Problem**: Transactions return ERROR status

**Common Causes**:

1. **Invalid card data**: Check card number, expiry date, and CVC
2. **Insufficient funds**: Test cards may have limits
3. **Duplicate reference**: Each transaction needs a unique reference
4. **Missing required fields**: Ensure all required customer data is provided
5. **Test mode restrictions**: Some features may be limited in test mode

**Debug Steps**:

1. Check the Transaction History for error codes and messages
2. Review the raw response data for detailed error information
3. Consult the Payone API documentation for error code meanings
4. Check your Strapi server logs for detailed error traces

### Plugin Not Appearing in Admin

**Problem**: Payone Provider menu item doesn't appear

**Solutions**:

1. Ensure the plugin is enabled in `config/plugins.js`
2. Run `npm run build` to rebuild the admin panel
3. Clear your browser cache and refresh
4. Restart your Strapi server
5. Check browser console for JavaScript errors

### API Requests Return 403 Forbidden

**Problem**: Content API endpoints return authorization errors

**Solutions**:

1. Ensure you're sending a valid authentication token
2. Check that the `isAuth` policy is properly configured
3. Verify your user has the necessary permissions
4. Review Strapi's role and permissions settings

### Transactions Not Logging

**Problem**: Transaction history is empty

**Solutions**:

1. Check that requests are actually reaching Payone (check server logs)
2. Verify database write permissions
3. Check for JavaScript errors in the browser console
4. Ensure the plugin store is accessible

## 🔐 Security Best Practices

1. **Never expose your Portal Key**: Keep it secure and never commit it to version control
2. **Use environment variables**: Store credentials in `.env` files (excluded from git)
3. **Enable HTTPS**: Always use HTTPS in production for API requests
4. **Validate user input**: Always validate and sanitize payment data on the server side
5. **Use test mode**: Test thoroughly in test mode before going live
6. **Monitor transactions**: Regularly review transaction history for suspicious activity
7. **PCI Compliance**: If handling card data directly, ensure PCI DSS compliance

## 📝 License

MIT

## 🤝 Support

If you encounter issues or need help:

1. Check this README thoroughly
2. Review your Strapi server logs
3. Consult the [Payone API Documentation](https://docs.payone.com/)
4. Check the Transaction History for detailed error messages

## 🔄 Updates

To update the plugin:

```bash
npm update payone-provider
npm run build
```

Then restart your Strapi application.

---

**Made with ❤️ for Strapi**
