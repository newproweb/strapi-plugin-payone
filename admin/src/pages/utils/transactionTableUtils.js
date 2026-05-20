export const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED":
      return "success200";
    case "ERROR":
      return "danger200";
    case "PENDING":
      return "warning200";
    case "REDIRECT":
      return "success100";
    default:
      return "success100";
  }
};

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
    minute: "2-digit"
  });
};

export const getPaymentMethodName = (clearingtype, wallettype) => {
  switch (clearingtype) {
    case "cc" || "card" | "c":
      return "Credit Card";
    case "sb":
      return "Online Banking";
    case "wlt":
      return wallettype === "PPE" ? "PayPal" : "Wallet";
    case "elv":
      return "Direct Debit (SEPA)";
    default:
      return clearingtype || "Unknown";
  }
};

export const isCreditCard = (transaction) => {
  const clearingtype =
    transaction.raw_request?.clearingtype ||
    transaction.body?.raw_request?.clearingtype;
  return clearingtype === "cc";
};

export const getCardTypeName = (transaction) => {
  if (!isCreditCard(transaction)) return null;

  const cardtype =
    transaction.raw_request?.cardtype ||
    transaction.body?.raw_request?.cardtype;

  switch (cardtype) {
    case "V":
      return "Visa";
    case "M":
      return "Mastercard";
    case "A":
      return "American Express";
    default:
      return cardtype || "Unknown";
  }
};

const CARD_TYPE_LABELS = {
  V: "Visa",
  M: "Mastercard",
  A: "American Express",
  J: "JCB",
  D: "Diners",
  O: "Maestro",
};

export const getCardTypeLabel = (cardtype) =>
  CARD_TYPE_LABELS[cardtype] || cardtype || null;

export const getWalletLabel = (wallettype) => {
  switch (String(wallettype || "").toUpperCase()) {
    case "PPE":
      return "PayPal";
    case "GPY":
    case "GOOGLEPAY":
      return "Google Pay";
    case "APL":
    case "APPLEPAY":
      return "Apple Pay";
    default:
      return wallettype || null;
  }
};

/**
 * Resolves a transaction's payment method into a category and subtype label.
 * @returns {{ category: string, subtype: string|null }}
 */
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
