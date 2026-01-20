import * as React from "react";
import { Tabs } from "@strapi/design-system";
import ConfigurationPanel from "./configuration/ConfigurationPanel";
import HistoryPanel from "./transaction-history/HistoryPanel";
import PaymentActionsPanel from "./payment-actions/PaymentActionsPanel";
import DocsPanel from "./DocsPanel";

const AppTabs = ({
  activeTab,
  setActiveTab,
  onNavigateToConfig,
  settings,
  paymentActions,
}) => {
  return (
    <Tabs.Root
      defaultValue={`tab-${activeTab}`}
      value={`tab-${activeTab}`}
      variant="regular"
      onValueChange={(value) =>
        setActiveTab(parseInt(value.replace("tab-", "")))
      }
    >
      <Tabs.List style={{ width: "100%" }}>
        <Tabs.Trigger value="tab-1">Configuration</Tabs.Trigger>
        <Tabs.Trigger value="tab-2">Transaction History</Tabs.Trigger>
        <Tabs.Trigger value="tab-3">Payment Actions</Tabs.Trigger>
        <Tabs.Trigger value="tab-4">Documentation</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab-1">
        <ConfigurationPanel settings={settings} />
      </Tabs.Content>

      <Tabs.Content value="tab-2">
        <HistoryPanel />
      </Tabs.Content>

      <Tabs.Content value="tab-3">
        <PaymentActionsPanel
          onNavigateToConfig={onNavigateToConfig}
          settings={settings}
          paymentActions={paymentActions}
        />
      </Tabs.Content>

      <Tabs.Content value="tab-4">
        <DocsPanel settings={settings} paymentActions={paymentActions} />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default AppTabs;
