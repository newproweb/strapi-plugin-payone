import * as React from "react";
import { Box, Flex, Typography, Divider } from "@strapi/design-system";
import TransactionTable from "./TransactionTable";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const HistoryPanel = () => {
  const { t } = usePluginTranslations();
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
          <Typography variant="beta" as="h2" className="payment-title" style={{ fontSize: "20px", marginBottom: "4px" }}>
            {t("history.title", "Transaction Management")}
          </Typography>
          <Typography variant="pi" textColor="neutral600" className="payment-subtitle" style={{ fontSize: "14px", marginTop: "4px" }}>
            {t("history.subtitle", "View and filter all payment transactions processed through Payone")}
          </Typography>
        </Box>

        <Divider />

        <TransactionTable />

        <Box paddingTop={4}>
          <Typography variant="sigma" textColor="neutral600">
            {t("history.note", "This shows all Payone transactions processed through this plugin. Transactions are automatically logged with detailed request/response data.")}
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

export default HistoryPanel;
