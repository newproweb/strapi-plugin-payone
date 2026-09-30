import { Tabs } from "@strapi/design-system";
import { TabErrorBoundary } from "../../components/TabErrorBoundary";
import { HistoryPanel } from "../../features/transactions/HistoryPanel";
import { ConfigurationPanel } from "../../features/settings/ConfigurationPanel";
import { PaymentActionsPanel } from "../../features/payment-actions/PaymentActionsPanel";
import { DocsPanel } from "../../features/docs/DocsPanel";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";

export const TAB_IDS = {
  history: "history",
  configuration: "configuration",
  paymentActions: "paymentActions",
  documentation: "documentation",
};

const TABS = [
  { id: TAB_IDS.history, labelKey: "tabs.history", label: "Transaction History" },
  { id: TAB_IDS.configuration, labelKey: "tabs.configuration", label: "Configuration" },
  { id: TAB_IDS.paymentActions, labelKey: "tabs.paymentActions", label: "Payment Actions" },
  { id: TAB_IDS.documentation, labelKey: "tabs.documentation", label: "Documentation" },
];

export const AppTabs = ({ activeTab, onTabChange, onNavigateToConfig, settings, paymentActions }) => {
  const { t } = usePluginTranslations();

  const renderPanel = (tabId) => {
    switch (tabId) {
      case TAB_IDS.history:
        return <HistoryPanel />;
      case TAB_IDS.configuration:
        return <ConfigurationPanel settings={settings} onNavigateToConfig={onNavigateToConfig} />;
      case TAB_IDS.paymentActions:
        return <PaymentActionsPanel onNavigateToConfig={onNavigateToConfig} settings={settings} paymentActions={paymentActions} />;
      default:
        return <DocsPanel />;
    }
  };

  return (
    <Tabs.Root value={activeTab} variant="regular" onValueChange={onTabChange}>
      <Tabs.List style={{ width: "100%" }}>
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
