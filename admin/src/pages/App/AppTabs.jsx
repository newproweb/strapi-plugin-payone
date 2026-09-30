import { Tabs } from "@strapi/design-system";
import { TabErrorBoundary } from "../../components/TabErrorBoundary";
import { HistoryPanel } from "../../features/transactions/HistoryPanel";
import { ConfigurationPanel } from "../../features/settings/ConfigurationPanel";
import { PaymentActionsPanel } from "../../features/payment-actions/PaymentActionsPanel";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";

export const TAB_IDS = {
  transactions: "transactions",
  paymentTests: "paymentTests",
  settings: "settings",
};

const TABS = [
  { id: TAB_IDS.transactions, labelKey: "tabs.transactions", label: "Transactions" },
  { id: TAB_IDS.paymentTests, labelKey: "tabs.paymentTests", label: "Payment tests" },
  { id: TAB_IDS.settings, labelKey: "tabs.settings", label: "Settings" },
];

export const AppTabs = ({ activeTab, onTabChange, onNavigateToConfig, settings, paymentActions }) => {
  const { t } = usePluginTranslations();

  const renderPanel = (tabId) => {
    switch (tabId) {
      case TAB_IDS.transactions:
        return <HistoryPanel />;
      case TAB_IDS.paymentTests:
        return <PaymentActionsPanel onNavigateToConfig={onNavigateToConfig} settings={settings} paymentActions={paymentActions} />;
      default:
        return <ConfigurationPanel settings={settings} onNavigateToConfig={onNavigateToConfig} />;
    }
  };

  return (
    <Tabs.Root value={activeTab} onValueChange={onTabChange}>
      <Tabs.List aria-label={t("tabs.label", "Payone sections")}>
        {TABS.map((tab) => (
          <Tabs.Trigger key={tab.id} value={tab.id}>
            {t(tab.labelKey, tab.label)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {TABS.map((tab) => (
        <Tabs.Content key={tab.id} value={tab.id}>
          <TabErrorBoundary activeTab={activeTab} t={t}>
            {renderPanel(tab.id)}
          </TabErrorBoundary>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};
