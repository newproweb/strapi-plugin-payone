import * as React from "react";
import { Layouts } from "@strapi/strapi/admin";
import { useSettings } from "../../features/settings/useSettings";
import { usePaymentActions } from "../../features/payment-actions/usePaymentActions";
import { WalletConfigPanel } from "../../features/wallets/WalletConfigPanel";
import { ApplePayConfig } from "../../features/wallets/apple-pay/ApplePayConfig";
import { GooglePayConfig } from "../../features/wallets/google-pay/GooglePayConfig";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";
import { AppHeader } from "./AppHeader";
import { AppTabs, TAB_IDS } from "./AppTabs";

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
  const [activeTab, setActiveTab] = React.useState(TAB_IDS.transactions);
  const [currentView, setCurrentView] = React.useState(MAIN_VIEW);
  const settings = useSettings();
  const paymentActions = usePaymentActions();
  const walletView = WALLET_VIEWS[currentView];

  return (
    <Layouts.Root className="payone-provider-root">
      <AppHeader
        title={walletView?.title}
        subtitle={walletView ? t(walletView.subtitleKey, walletView.subtitle) : undefined}
        settings={settings.savedSettings}
        onBack={walletView ? () => setCurrentView(MAIN_VIEW) : undefined}
      />
      <Layouts.Content>
        {walletView ? (
          <WalletConfigPanel view={walletView} settings={settings} />
        ) : (
          <AppTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onNavigateToConfig={setCurrentView}
            settings={settings}
            paymentActions={paymentActions}
          />
        )}
      </Layouts.Content>
    </Layouts.Root>
  );
};

export default App;
