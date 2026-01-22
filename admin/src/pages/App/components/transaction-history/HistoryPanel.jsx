import { Box, Divider, Flex, Typography } from "@strapi/design-system";
import TransactionTable from "./TransactionTable";

const HistoryPanel = () => {
  return (
    <Box
      className="payment-container"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
    >
      <Flex direction="column" alignItems="stretch" gap={8}>
        <Box>
          <Typography
            variant="beta"
            as="h2"
            className="payment-title"
            style={{ fontSize: "20px", marginBottom: "4px" }}
          >
            Transaction Management
          </Typography>
          <Typography
            variant="pi"
            textColor="neutral600"
            className="payment-subtitle"
            style={{ fontSize: "14px", marginTop: "4px" }}
          >
            View and filter all payment transactions processed through Payone
          </Typography>
        </Box>

        <Divider />

        <TransactionTable />

        <Box paddingTop={4}>
          <Typography variant="sigma" textColor="neutral600">
            Note: This shows all Payone transactions processed through this
            plugin. Transactions are automatically logged with detailed
            request/response data.
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

export default HistoryPanel;
