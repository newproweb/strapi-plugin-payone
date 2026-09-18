import * as React from "react";
import { Box, Typography, Tabs } from "@strapi/design-system";
import ConfigurationPanel from "./configuration/ConfigurationPanel";
import HistoryPanel from "./transaction-history/HistoryPanel";
import PaymentActionsPanel from "./payment-actions/PaymentActionsPanel";
import DocsPanel from "./DocsPanel";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";

/**
 * Error boundary to prevent a single tab's error from crashing the entire plugin.
 * Automatically resets when the user switches tabs.
 */
class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Payone Tab Error:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // Auto-reset when the user switches to a different tab
    if (prevProps.activeTab !== this.props.activeTab && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <Box padding={6} style={{ textAlign: "center" }}>
          <Typography variant="beta" textColor="danger600">
            {t ? t("error.tabError", "Something went wrong loading this tab.") : "Something went wrong loading this tab."}
          </Typography>
          <Typography variant="pi" textColor="neutral600" style={{ marginTop: "8px", display: "block" }}>
            {t ? t("error.tabErrorHint", "Try switching to another tab or reload the page.") : "Try switching to another tab or reload the page."}
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

const AppTabs = ({
  activeTab,
  setActiveTab,
  onNavigateToConfig,
  settings,
  paymentActions
}) => {
  const { t } = usePluginTranslations();
  return (
    <Tabs.Root
      value={`tab-${activeTab}`}
      variant="regular"
      onValueChange={(value) =>
        setActiveTab(parseInt(value.replace("tab-", "")))
      }
    >
      <Tabs.List style={{ width: "100%" }}>
        <Tabs.Trigger value="tab-1">{t("tabs.history", "Transaction History")}</Tabs.Trigger>
        <Tabs.Trigger value="tab-2">{t("tabs.configuration", "Configuration")}</Tabs.Trigger>
        <Tabs.Trigger value="tab-3">{t("tabs.paymentActions", "Payment Actions")}</Tabs.Trigger>
        <Tabs.Trigger value="tab-4">{t("tabs.documentation", "Documentation")}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab-1">
        <TabErrorBoundary activeTab={activeTab} t={t}>
          <HistoryPanel />
        </TabErrorBoundary>
      </Tabs.Content>
      <Tabs.Content value="tab-2">
        <TabErrorBoundary activeTab={activeTab} t={t}>
          <ConfigurationPanel
            settings={settings}
            onNavigateToConfig={onNavigateToConfig}
          />
        </TabErrorBoundary>
      </Tabs.Content>
      <Tabs.Content value="tab-3">
        <TabErrorBoundary activeTab={activeTab} t={t}>
          <PaymentActionsPanel
            onNavigateToConfig={onNavigateToConfig}
            settings={settings}
            paymentActions={paymentActions}
          />
        </TabErrorBoundary>
      </Tabs.Content>
      <Tabs.Content value="tab-4">
        <TabErrorBoundary activeTab={activeTab} t={t}>
          <DocsPanel settings={settings} paymentActions={paymentActions} />
        </TabErrorBoundary>
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default AppTabs;
