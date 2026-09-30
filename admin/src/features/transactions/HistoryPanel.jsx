import * as React from "react";
import { Alert, Button, Flex } from "@strapi/design-system";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";
import { useTransactionHistory } from "./useTransactionHistory";
import { useTransactionStats } from "./useTransactionStats";
import { StatsRow } from "./components/StatsRow";
import { FiltersPanel } from "./components/FiltersPanel";
import { ImportExportBar } from "./components/ImportExportBar";
import { TransactionTable } from "./components/TransactionTable";
import { TransactionDetailsModal } from "./components/TransactionDetailsModal";

/** Transactions tab: status totals, filters, the paginated list and a details dialog. */
export const HistoryPanel = () => {
  const { t } = usePluginTranslations();
  const history = useTransactionHistory();
  const [statsReloadKey, setStatsReloadKey] = React.useState(0);
  const { stats, isLoading: isLoadingStats } = useTransactionStats(history.filters, statsReloadKey);

  const handleImportDone = () => {
    history.loadTransactionHistory();
    setStatsReloadKey((key) => key + 1);
  };

  return (
    <Flex direction="column" alignItems="stretch" gap={6} paddingTop={6}>
      <StatsRow stats={stats} isLoading={isLoadingStats} />

      <FiltersPanel filters={history.filters} handleFiltersChange={history.handleFiltersChange} />

      {history.loadError && (
        <Alert
          variant="danger"
          title={t("history.loadErrorTitle", "Transactions couldn't be loaded")}
          closeLabel={t("common.close", "Close")}
          action={
            <Button variant="danger-light" size="S" onClick={history.loadTransactionHistory}>
              {t("common.retry", "Retry")}
            </Button>
          }
        >
          {t("history.loadErrorBody", "Check that Strapi is running and try again.")}
        </Alert>
      )}

      <TransactionTable history={history} toolbar={<ImportExportBar filters={history.filters} onImportDone={handleImportDone} />} />

      <TransactionDetailsModal transaction={history.selectedTransaction} onClose={history.handleCloseDetails} />
    </Flex>
  );
};
