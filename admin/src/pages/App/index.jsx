import * as React from "react";
import { Box } from "@strapi/design-system";
import { Layouts } from "@strapi/strapi/admin";
import useSettings from "../hooks/useSettings";
import usePaymentActions from "../hooks/usePaymentActions";
import AppHeader from "./components/AppHeader";
import AppTabs from "./components/AppTabs";
import ApplePayConfigPanel from "./components/ApplePayConfigPanel";
import GooglePayConfigPanel from "./components/GooglePayConfigPanel";
import "./styles.css";

const App = () => {
  const [activeTab, setActiveTab] = React.useState(1);
  const [currentView, setCurrentView] = React.useState("main");
  const settings = useSettings();
  const paymentActions = usePaymentActions();

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const isApplePayConfigPage = currentView === "apple-pay-config";
  const isGooglePayConfigPage = currentView === "google-pay-config";

  if (isApplePayConfigPage) {
    return (
      <Layouts.Root className="payone-provider-root">
        <AppHeader
          title="Apple Pay Configuration"
          activeTab={null}
          isSaving={settings.isSaving}
          onSave={settings.handleSave}
          onBack={() => handleNavigate("main")}
        />
        <Layouts.Content>
          <Box padding={6}>
            <ApplePayConfigPanel
              settings={settings.settings}
              onInputChange={settings.handleInputChange}
              isSaving={settings.isSaving}
              onSave={settings.handleSave}
            />
          </Box>
        </Layouts.Content>
      </Layouts.Root>
    );
  }

  if (isGooglePayConfigPage) {
    return (
      <Layouts.Root className="payone-provider-root">
        <AppHeader
          title="Google Pay Configuration"
          activeTab={null}
          isSaving={settings.isSaving}
          onSave={settings.handleSave}
          onBack={() => handleNavigate("main")}
        />
        <Layouts.Content>
          <Box padding={6}>
            <GooglePayConfigPanel
              settings={settings.settings}
              onInputChange={settings.handleInputChange}
              isSaving={settings.isSaving}
              onSave={settings.handleSave}
              onBack={() => handleNavigate("main")}
            />
          </Box>
        </Layouts.Content>
      </Layouts.Root>
    );
  }

  return (
    <Layouts.Root className="payone-provider-root">
      <AppHeader
        activeTab={activeTab}
        isSaving={settings.isSaving}
        onSave={settings.handleSave}
      />
      <Layouts.Content>
        <Box padding={6}>
          <AppTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onNavigateToConfig={handleNavigate}
            settings={settings}
            paymentActions={paymentActions}
          />
        </Box>
      </Layouts.Content>
    </Layouts.Root>
  );
};

export default App;
