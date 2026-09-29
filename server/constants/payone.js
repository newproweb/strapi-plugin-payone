"use strict";

const POST_GATEWAY_URL = "https://api.pay1.de/post-gateway/";
const REQUEST_TIMEOUT_MS = 30000;
const FORM_CONTENT_TYPE = "application/x-www-form-urlencoded";

const THREE_DS_REQUIRED_ERROR_CODES = ["4219", 4219];

const CUSTOMER_DEFAULTS = {
  salutation: "Herr",
  gender: "m",
  telephonenumber: "01752345678",
  ip: "127.0.0.1",
  language: "de",
  customer_is_present: "yes"
};

const INVOICE_ID_KEYS = [
  "invoiceid",
  "invoiceId",
  "invoice_id",
  "invoiceID",
  "InvoiceId",
  "InvoiceID",
  "Invoice_Id",
  "INVOICEID",
  "INVOICE_ID"
];

const PREAUTHORIZATION_FIELDS = [
  "clearingtype", "amount", "currency", "reference", "firstname", "lastname",
  "street", "zip", "city", "country", "email", "narrative_text"
];

const AUTHORIZATION_FIELDS = [
  "clearingtype", "reference", "firstname", "lastname",
  "street", "zip", "city", "country", "email", "narrative_text"
];

const DEFAULT_CAPTURE_AMOUNT = 1000;
const DEFAULT_CURRENCY = "EUR";

const WALLET_TYPE_BY_CLEARINGTYPE = {
  gpp: "GGP",
  apl: "APL"
};

const PAYMENT_METHOD_DEFAULTS = {
  cc: { cardexpiredate: null, cardtype: "V" },
  wlt: { wallettype: "PPE" },
  gpp: { clearingtype: "wlt", wallettype: "GGP" },
  apl: { clearingtype: "wlt", wallettype: "APL" },
  elv: { bankcountry: "DE", iban: "DE89370400440532013000", bic: "COBADEFFXXX", bankaccountholder: null },
  sb: { bankcountry: "DE", onlinebanktransfertype: "PNT" },
  gp: { bankcountry: "DE", onlinebanktransfertype: "GPY" },
  idl: { bankcountry: "NL", onlinebanktransfertype: "IDL" },
  bct: { bankcountry: "BE", onlinebanktransfertype: "BCT" },
  rec: { recurrence: "recurring" },
  fnc: { financingtype: "fnc" },
  iv: { invoicetype: "invoice" }
};

const REDIRECT_URL_KEYS = [
  "redirecturl",
  "RedirectUrl",
  "redirect_url",
  "redirectUrl",
  "RedirectURL",
  "redirectURL",
  "url",
  "Url",
  "URL"
];

const TX_ID_KEYS = ["txid", "TxId", "tx_id", "transactionid", "transaction_id", "id"];

const TEST_CONNECTION_REQUEST = {
  request: "authorization",
  amount: 100,
  currency: "EUR",
  clearingtype: "cc",
  cardtype: "V",
  cardpan: "4111111111111111",
  cardcvc2: "123",
  firstname: "Test",
  lastname: "User",
  street: "Test Street 1",
  zip: "12345",
  city: "Test City",
  country: "DE",
  email: "test@example.com",
  salutation: "Herr",
  gender: "m",
  telephonenumber: "01752345678",
  ip: "127.0.0.1",
  customer_is_present: "yes",
  language: "de"
};

const NOTIFICATION_USER_AGENT = "PAYONE FinanceGate";
const NOTIFICATION_ALLOWED_IPS = ["54.246.203.105"];
const NOTIFICATION_ALLOWED_IP_RANGES = [/^185\.60\.20\.\d+$/];

module.exports = {
  POST_GATEWAY_URL,
  REQUEST_TIMEOUT_MS,
  FORM_CONTENT_TYPE,
  THREE_DS_REQUIRED_ERROR_CODES,
  CUSTOMER_DEFAULTS,
  INVOICE_ID_KEYS,
  PREAUTHORIZATION_FIELDS,
  AUTHORIZATION_FIELDS,
  DEFAULT_CAPTURE_AMOUNT,
  DEFAULT_CURRENCY,
  WALLET_TYPE_BY_CLEARINGTYPE,
  PAYMENT_METHOD_DEFAULTS,
  REDIRECT_URL_KEYS,
  TX_ID_KEYS,
  TEST_CONNECTION_REQUEST,
  NOTIFICATION_USER_AGENT,
  NOTIFICATION_ALLOWED_IPS,
  NOTIFICATION_ALLOWED_IP_RANGES
};
