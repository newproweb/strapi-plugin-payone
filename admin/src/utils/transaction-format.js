import { CARD_TYPE_LABELS } from "../constants/payment";

const WALLET_LABELS = {
  PPE: "PayPal",
  GPY: "Google Pay",
  GOOGLEPAY: "Google Pay",
  APL: "Apple Pay",
  APPLEPAY: "Apple Pay",
};

const DETAIL_CARD_NAMES = { V: "Visa", M: "Mastercard", A: "American Express" };

/** Reads a request field from the transaction row, falling back to the copy stored in `body`. */
export const requestField = (transaction, key) =>
  transaction.raw_request?.[key] || transaction.body?.raw_request?.[key];

export const formatAmount = (amount, currency) => {
  if (!amount) return "N/A";
  return `${(amount / 100).toFixed(2)} ${currency || "EUR"}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isCreditCard = (transaction) => requestField(transaction, "clearingtype") === "cc";

export const getCardTypeName = (transaction) => {
  if (!isCreditCard(transaction)) return null;
  const cardtype = requestField(transaction, "cardtype");
  return DETAIL_CARD_NAMES[cardtype] || cardtype || "Unknown";
};

const getCardTypeLabel = (cardtype) => CARD_TYPE_LABELS[cardtype] || cardtype || null;

const getWalletLabel = (wallettype) => WALLET_LABELS[String(wallettype || "").toUpperCase()] || wallettype || null;

/** Resolves a transaction's payment method into a category and subtype label. */
export const getPaymentMethodDisplay = (clearingtype, wallettype, cardtype) => {
  switch (clearingtype) {
    case "cc":
      return { category: "Credit Card", subtype: getCardTypeLabel(cardtype) };
    case "wlt":
      return { category: "Wallet", subtype: getWalletLabel(wallettype) };
    case "sb":
      return { category: "Online Banking", subtype: null };
    case "elv":
      return { category: "Direct Debit", subtype: "SEPA" };
    default:
      return { category: clearingtype || "Unknown", subtype: null };
  }
};
