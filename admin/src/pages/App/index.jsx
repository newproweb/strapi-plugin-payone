import * as React from "react";
import { Box } from "@strapi/design-system";
import { Layouts } from "@strapi/strapi/admin";
import { useSettings } from "../../features/settings/useSettings";
import { usePaymentActions } from "../../features/payment-actions/usePaymentActions";
import { WalletConfigPanel } from "../../features/wallets/WalletConfigPanel";
import { ApplePayConfig } from "../../features/wallets/apple-pay/ApplePayConfig";
import { GooglePayConfig } from "../../features/wallets/google-pay/GooglePayConfig";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";
import { AppHeader } from "./AppHeader";
import { AppTabs, TAB_IDS } from "./AppTabs";
import "./styles.css";

const MAIN_VIEW = "main";

const WALLET_VIEWS = {
  "apple-pay-config": {
    title: "Apple Pay Configuration",
    subtitleKey: "header.subtitleApplePay",
    subtitle: "Configure Apple Pay settings for your payment gateway",
    configKey: "applePayConfig",
    ConfigForm: ApplePayConfig,
    noteKey: "applePayConfigPanel.note",
    note: "Note: Apple Pay configuration is used for Apple Pay payment requests. Make sure to configure the correct merchant identifier, supported networks, and capabilities for your region.",
    saveKey: "applePayConfigPanel.save",
  },
  "google-pay-config": {
    title: "Google Pay Configuration",
    subtitleKey: "header.subtitleGooglePay",
    subtitle: "Configure Google Pay settings for your payment gateway",
    configKey: "googlePayConfig",
    ConfigForm: GooglePayConfig,
    noteKey: "googlePayConfigPanel.note",
    note: "Note: Google Pay configuration is used for Google Pay payment requests. Make sure to configure the correct card networks, authentication methods, and merchant information for your region.",
    saveKey: "googlePayConfigPanel.save",
  },
};

const App = () => {
  const { t } = usePluginTranslations();
  const [activeTab, setActiveTab] = React.useState(TAB_IDS.history);
  const [currentView, setCurrentView] = React.useState(MAIN_VIEW);
  const settings = useSettings();
  const paymentActions = usePaymentActions();
  const walletView = WALLET_VIEWS[currentView];

  const handleBackToMain = () => setCurrentView(MAIN_VIEW);

  const renderContent = () => {
    if (walletView) {
      return <WalletConfigPanel view={walletView} settings={settings} />;
    }
    return (
      <AppTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNavigateToConfig={setCurrentView}
        settings={settings}
        paymentActions={paymentActions}
      />
    );
  };

  return (
    <Layouts.Root className="payone-provider-root">
      <AppHeader
        title={walletView?.title}
        subtitle={walletView ? t(walletView.subtitleKey, walletView.subtitle) : undefined}
        showSave={!walletView && activeTab === TAB_IDS.configuration}
        isSaving={settings.isSaving}
        onSave={settings.handleSave}
        onBack={walletView ? handleBackToMain : undefined}
      />
      <Layouts.Content>
        <Box padding={6}>{renderContent()}</Box>
      </Layouts.Content>
    </Layouts.Root>
  );
};

export default App;
