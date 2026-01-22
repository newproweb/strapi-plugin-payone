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
  if (amount === null || amount === undefined) return "N/A";
  return `${(amount / 100).toFixed(2)} ${currency || "EUR"}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("de-DE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getPaymentMethodName = (clearingtype, wallettype, cardtype) => {
  switch (clearingtype) {
    case "cc":
      return cardtype ? `CC / ${cardtype}` : "Credit Card";
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

export const getCardTypeName = (cardtype) => {
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


