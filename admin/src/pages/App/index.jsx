import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Layout, ContentLayout, Box } from "@strapi/design-system";
import useSettings from "../hooks/useSettings";
import useTransactionHistory from "../hooks/useTransactionHistory";
import usePaymentActions from "../hooks/usePaymentActions";
import AppHeader from "./components/AppHeader";
import AppTabs from "./components/AppTabs";
import ApplePayConfigPanel from "./components/ApplePayConfigPanel";
import GooglePayConfigPanel from "./components/GooglePayConfigPanel";
import "./styles.css";
import pluginId from "../../pluginId";

const App = () => {
  const location = useLocation();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState(0);

  // Custom hooks
  const settings = useSettings();
  const transactionHistory = useTransactionHistory();
  const paymentActions = usePaymentActions();

  useEffect(() => {
    if (
      location.pathname.includes("/apple-pay-config") ||
      location.pathname.includes("/google-pay-config")
    ) {
    } else {
      const tabFromPath = location.pathname.includes("/history")
        ? 1
        : location.pathname.includes("/payment-actions")
        ? 2
        : location.pathname.includes("/documentation")
        ? 3
        : 0;
      setActiveTab(tabFromPath);
    }
  }, [location.pathname]);

  const isApplePayConfigPage = location.pathname.includes("/apple-pay-config");
  const isGooglePayConfigPage =
    location.pathname.includes("/google-pay-config");

  if (isApplePayConfigPage) {
    return (
      <Layout>
        <AppHeader
          title="Apple Pay Configuration"
          activeTab={null}
          isSaving={settings.isSaving}
          onSave={settings.handleSave}
          onBack={() => history.push(`/plugins/${pluginId}`)}
        />
        <ContentLayout>
          <Box padding={6}>
            <ApplePayConfigPanel
              settings={settings.settings}
              onInputChange={settings.handleInputChange}
              isSaving={settings.isSaving}
              onSave={settings.handleSave}
            />
          </Box>
        </ContentLayout>
      </Layout>
    );
  }

  if (isGooglePayConfigPage) {
    return (
      <Layout>
        <AppHeader
          title="Google Pay Configuration"
          activeTab={null}
          isSaving={settings.isSaving}
          onSave={settings.handleSave}
          onBack={() => history.push(`/plugins/${pluginId}`)}
        />
        <ContentLayout>
          <Box padding={6}>
            <GooglePayConfigPanel
              settings={settings.settings}
              onInputChange={settings.handleInputChange}
              isSaving={settings.isSaving}
              onSave={settings.handleSave}
              onBack={() => history.push(`/plugins/${pluginId}`)}
            />
          </Box>
        </ContentLayout>
      </Layout>
    );
  }

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
            history={history}
          />
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default App;
