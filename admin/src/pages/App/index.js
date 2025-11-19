import React, { useState } from "react";
import { Layout, ContentLayout, Box } from "@strapi/design-system";
import useSettings from "../hooks/useSettings";
import useTransactionHistory from "../hooks/useTransactionHistory";
import usePaymentActions from "../hooks/usePaymentActions";
import AppHeader from "./components/AppHeader";
import AppTabs from "./components/AppTabs";
import "./styles.css";

const App = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Custom hooks
  const settings = useSettings();
  const transactionHistory = useTransactionHistory();
  const paymentActions = usePaymentActions();

  return (
    <Layout>
      <AppHeader
        activeTab={activeTab}
        isSaving={settings.isSaving}
        onSave={settings.handleSave}
      />
      <ContentLayout>
        <Box padding={6}>
          <AppTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={settings.settings}
            isSaving={settings.isSaving}
            isTesting={settings.isTesting}
            testResult={settings.testResult}
            onSave={settings.handleSave}
            onTestConnection={settings.handleTestConnection}
            onInputChange={settings.handleInputChange}
            filters={transactionHistory.filters}
            onFilterChange={transactionHistory.handleFilterChange}
            onFilterApply={transactionHistory.handleFilterApply}
            isLoadingHistory={transactionHistory.isLoadingHistory}
            transactionHistory={transactionHistory.transactionHistory}
            paginatedTransactions={transactionHistory.paginatedTransactions}
            currentPage={transactionHistory.currentPage}
            totalPages={transactionHistory.totalPages}
            pageSize={transactionHistory.pageSize}
            onRefresh={transactionHistory.loadTransactionHistory}
            onPageChange={transactionHistory.handlePageChange}
            selectedTransaction={transactionHistory.selectedTransaction}
            onTransactionSelect={transactionHistory.handleTransactionSelect}
            paymentActions={paymentActions}
          />
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default App;