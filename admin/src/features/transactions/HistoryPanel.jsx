import { Box, Divider, Flex, Typography } from "@strapi/design-system";
import { PanelHeader } from "../../components/PanelHeader";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";
import { TransactionTable } from "./components/TransactionTable";

export const HistoryPanel = () => {
  const { t } = usePluginTranslations();
  return (
    <Box className="payment-container" paddingTop={8} paddingBottom={8} paddingLeft={8} paddingRight={8}>
      <Flex direction="column" alignItems="stretch" gap={8}>
        <PanelHeader
          title={t("history.title", "Transaction Management")}
          subtitle={t("history.subtitle", "View and filter all payment transactions processed through Payone")}
          subtitleStyle={{ marginTop: "4px" }}
        />
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
