import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { Box, Flex, Typography } from "@strapi/design-system";
import { getCardTypeName, isCreditCard, requestField } from "../../../utils/transaction-format";

const DetailRow = ({ label, children }) => (
  <Flex gap={3}>
    <Typography variant="pi" textColor="neutral600" fontWeight="medium">
      {label}
    </Typography>
    <Typography variant="pi" textColor="neutral800">
      {children}
    </Typography>
  </Flex>
);

const SectionTitle = ({ children }) => (
  <Typography variant="pi" fontWeight="bold" textColor="neutral800" marginBottom={3}>
    {children}
  </Typography>
);

/** Expanded row of the transaction table: customer, payment details and the raw transaction JSON. */
export const TransactionDetails = ({ transaction }) => {
  const field = (key) => requestField(transaction, key);

  const renderCustomer = () => (
    <Flex direction="column" gap={2} alignItems="stretch">
      <SectionTitle>Customer Information</SectionTitle>
      <DetailRow label="Name:">
        {field("firstname")} {field("lastname")}
      </DetailRow>
      <DetailRow label="Email:">{field("email") || "N/A"}</DetailRow>
      <DetailRow label="Phone:">{field("telephonenumber") || "N/A"}</DetailRow>
      <DetailRow label="Address:">
        {field("street")}, {field("zip")} {field("city")}
      </DetailRow>
    </Flex>
  );

  const renderPayment = () => (
    <Flex direction="column" gap={2} alignItems="stretch">
      <SectionTitle>Payment Details</SectionTitle>
      <DetailRow label="TX ID:">{transaction.txid || "N/A"}</DetailRow>
      {isCreditCard(transaction) && (
        <>
          <DetailRow label="Card Type:">{getCardTypeName(transaction)}</DetailRow>
          {field("cardFirstname") && (
            <DetailRow label="Name on Card:">
              {field("cardFirstname")} {field("cardLastname")}
            </DetailRow>
          )}
        </>
      )}
      <DetailRow label="Mode:">{field("mode") || "N/A"}</DetailRow>
    </Flex>
  );

  return (
    <Flex direction="column" gap={4} alignItems="stretch" marginTop={4}>
      {transaction.status === "ERROR" && (
        <Box padding={3} background="danger100" hasRadius>
          <Typography variant="pi" fontWeight="bold" textColor="danger600" marginBottom={1}>
            Error: {transaction.error_message || "Unknown error"}
          </Typography>
          {transaction.customer_message && (
            <Typography variant="pi" textColor="danger600">
              Customer Message: {transaction.customer_message}
            </Typography>
          )}
        </Box>
      )}

      <Box style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))", gap: "16px", marginBottom: "1.5rem" }}>
        {renderCustomer()}
        {renderPayment()}
      </Box>

      <Box>
        <Typography variant="pi" fontWeight="bold" textColor="neutral800">
          Transaction Data
        </Typography>
        <Box marginTop={4}>
          <JsonView value={transaction?.body} style={githubDarkTheme} displayDataTypes={false} enableClipboard collapsed={false} displayObjectSize={false} />
        </Box>
      </Box>
    </Flex>
  );
};
