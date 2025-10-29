export const formatTransactionData = (data) => {
  const formattedData = [];
  if (!data || typeof data !== "object") return formattedData;

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      formattedData.push({
        key:
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
        value: typeof value === "object" ? JSON.stringify(value) : String(value)
      });
    }
  }

  return formattedData;
};