import {
  Tabs,
  Tab,
  TabGroup,
  TabPanels,
  TabPanel,
} from "@strapi/design-system";
import pluginId from "../../../pluginId";
import ConfigurationPanel from "../components/configuration/ConfigurationPanel";
import HistoryPanel from "../components/transaction-history/HistoryPanel";
import PaymentActionsPanel from "./paymentActions/PaymentActionsPanel";
import DocsPanel from "./DocsPanel";

const AppTabs = ({
  activeTab,
  setActiveTab,
  // Settings props
  settings,
  isTesting,
  testResult,
  onTestConnection,
  onInputChange,
  onPaymentMethodToggle,
  // Payment actions props
  paymentActions,
  history,
}) => {
  const handleNavigateToConfig = (configType = "apple-pay") => {
    if (history) {
      if (configType === "google-pay") {
        history.push(`/plugins/${pluginId}/google-pay-config`);
      } else {
        history.push(`/plugins/${pluginId}/apple-pay-config`);
      }
    }
  };

  return (
    <TabGroup
      label="Payone Provider Tabs"
      onTabChange={(index) => setActiveTab(index)}
    >
      <Tabs style={{ borderBottom: "2px solid #e8e8ea" }}>
        <Tab
          id="transaction-history"
          className={`payment-tab ${
            activeTab === 0 ? "payment-tab-active" : ""
          }`}
          variant="default"
          index={0}
          selectedTabIndex={activeTab}
          onTabClick={(index) => setActiveTab(index)}
        >
          Transaction History
        </Tab>
        <Tab
          variant="default"
          index={1}
          selectedTabIndex={activeTab}
          onTabClick={(index) => setActiveTab(index)}
          id="configuration"
          className={`payment-tab ${
            activeTab === 1 ? "payment-tab-active" : ""
          }`}
        >
          Configuration
        </Tab>
        <Tab
          id="payment-actions"
          className={`payment-tab ${
            activeTab === 2 ? "payment-tab-active" : ""
          }`}
          variant="default"
          index={2}
          selectedTabIndex={activeTab}
          onTabClick={(index) => setActiveTab(index)}
        >
          Payment Actions
        </Tab>
        <Tab
          id="documentation"
          className={`payment-tab ${
            activeTab === 3 ? "payment-tab-active" : ""
          }`}
          variant="default"
          index={3}
          selectedTabIndex={activeTab}
          onTabClick={(index) => setActiveTab(index)}
        >
          Documentation
        </Tab>
      </Tabs>
      <TabPanels>
        <TabPanel id="transaction-history">
          <HistoryPanel />
        </TabPanel>

        <TabPanel id="configuration">
          <ConfigurationPanel
            settings={settings}
            isTesting={isTesting}
            testResult={testResult}
            onTestConnection={onTestConnection}
            onInputChange={onInputChange}
            onPaymentMethodToggle={onPaymentMethodToggle}
          />
        </TabPanel>

        <TabPanel id="payment-actions">
          <PaymentActionsPanel
            settings={settings}
            onNavigateToConfig={handleNavigateToConfig}
            paymentActions={paymentActions}
          />
        </TabPanel>

        <TabPanel id="documentation">
          <DocsPanel />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
};

export default AppTabs;
