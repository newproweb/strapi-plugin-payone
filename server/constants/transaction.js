"use strict";

const TRANSACTION_ATTRS = [
  "txid", "reference", "invoiceid", "amount", "currency", "status",
  "error_code", "request_type", "error_message", "customer_message",
  "body", "raw_request", "raw_response", "createdAt", "updatedAt"
];

const JSON_COLUMNS = ["body", "raw_request", "raw_response"];

const PLACEHOLDERS = {
  txid: "NO TXID",
  reference: "NO REFERENCE",
  invoiceid: "NO INVOICE ID",
  errorCode: "NO ERROR CODE",
  errorMessage: "NO ERROR MESSAGE",
  customerMessage: "NO CUSTOMER MESSAGE"
};

const ALLOWED_SORT_FIELDS = [
  "txid",
  "reference",
  "amount",
  "request_type",
  "status",
  "createdAt",
  "updatedAt"
];

const DEFAULT_SORT_FIELD = "createdAt";
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 10;
const MAX_SCANNED_ROWS = 10000;
const STAT_STATUSES = ["APPROVED", "ERROR", "REDIRECT"];

/** PayOne wallet (`clearingtype: wlt`) codes; the extra aliases cover legacy rows. */
const WALLET_CODES = {
  paypal: ["PPE"],
  google_pay: ["GGP", "GPY", "GOOGLEPAY"],
  apple_pay: ["APL", "APPLEPAY"]
};

const SENSITIVE_KEYS = [
  "cardpan",
  "cardexpiredate",
  "cardcvc2",
  "iban",
  "bic",
  "bankaccount",
  "bankcode",
  "bankaccountholder",
  "key",
  "accesscode",
  "accessname",
  "token",
  "redirecturl",
  "Identifier",
  "pseudocardpan",
  "aid",
  "mid",
  "portalid",
  "portalId",
  "creditcardtoken",
  "creditcardtokenid",
  "creditcardtokenvalue",
  "creditcardtokentype",
  "creditcardtokenexpiry",
  "creditcardtokencvv",
  "creditcardtokenholder",
  "creditcardtokenbank"
];

module.exports = {
  TRANSACTION_ATTRS,
  JSON_COLUMNS,
  PLACEHOLDERS,
  ALLOWED_SORT_FIELDS,
  DEFAULT_SORT_FIELD,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MAX_SCANNED_ROWS,
  STAT_STATUSES,
  WALLET_CODES,
  SENSITIVE_KEYS
};
