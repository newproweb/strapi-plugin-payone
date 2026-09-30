export const PAYMENT_METHODS = {
  cc: "Credit Card (Visa, Mastercard)",
  wlt: "PayPal",
  gpp: "Google Pay",
  apl: "Apple Pay",
  sb: "Sofort Banking",
  elv: "SEPA Direct Debit",
};

export const TEST_MODE_METHODS = ["cc", "wlt", "gpp", "apl", "elv"];
export const LIVE_MODE_METHODS = ["apl"];

export const WALLET_METHODS = ["wlt", "gpp", "apl"];
export const REDIRECT_METHODS = ["wlt", "gpp", "apl", "sb"];

export const CAPTURE_MODE_OPTIONS = [
  { value: "full", label: "Full Capture" },
  { value: "partial", label: "Partial Capture" },
];

export const THREE_DS_REQUIRED_CODES = ["4219", 4219];

export const TEST_CUSTOMER = {
  firstname: "John",
  lastname: "Doe",
  street: "Test Street 123",
  zip: "12345",
  city: "Test City",
  country: "DE",
  email: "test@example.com",
  salutation: "Herr",
  gender: "m",
  telephonenumber: "01752345678",
  ip: "127.0.0.1",
  customer_is_present: "yes",
  language: "de",
};

export const TEST_CARD = {
  cardtype: "V",
  cardpan: "4111111111111111",
  cardexpiredate: "2512",
  cardcvc2: "123",
};

export const TEST_IBAN = {
  bankcountry: "DE",
  iban: "DE89370400440532013000",
  bic: "COBADEFFXXX",
  bankaccountholder: "John Doe",
};

export const EXAMPLE_REDIRECT_URLS = {
  successurl: "https://www.example.com/success",
  errorurl: "https://www.example.com/error",
  backurl: "https://www.example.com/back",
};

export const TEST_3DS_CARDS = [
  {
    name: "VISA - 3DS 2.0 (Challenge)",
    cardtype: "V",
    cardpan: "4716971940353559",
    cardexpiredate: "2512",
    cardcvc2: "123",
    description: "3DS 2.0 with challenge - Password: 12345",
  },
  {
    name: "Mastercard - 3DS 2.0 (Challenge)",
    cardtype: "M",
    cardpan: "5404127720739582",
    cardexpiredate: "2512",
    cardcvc2: "123",
    description: "3DS 2.0 with challenge - Password: 12345",
  },
];

export const CARD_TYPE_OPTIONS = [
  { value: "V", label: "VISA" },
  { value: "M", label: "Mastercard" },
  { value: "A", label: "American Express" },
  { value: "J", label: "JCB" },
  { value: "O", label: "Maestro International" },
  { value: "D", label: "Diners Club" },
];

export const CARD_TYPE_LABELS = {
  V: "Visa",
  M: "Mastercard",
  A: "American Express",
  J: "JCB",
  D: "Diners",
  O: "Maestro",
};

export const STATUS_BADGE_COLORS = {
  APPROVED: "success200",
  PENDING: "warning200",
  ERROR: "danger200",
  FAILED: "danger200",
  INVALID: "danger200",
  REDIRECT: "success100",
};

export const PAYONE_3DS_DOCS_URL = "https://docs.payone.com/security-risk-management/3d-secure#/";
