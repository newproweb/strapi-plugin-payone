import * as React from "react";
import { useNotification } from "@strapi/strapi/admin";
import { usePayoneApi } from "../../api/payone.api";

const AUTOSAVE_DELAY_MS = 1000;

const DEFAULT_SETTINGS = {
  aid: "",
  portalid: "",
  mid: "",
  key: "",
  mode: "test",
  api_version: "3.10",
  serverApiMerchantId: "",
  serverApiKeyId: "",
  serverApiSecret: "",
  serverApiVersionPath: "/v2",
  defaultCountryCode: "DE",
  defaultCurrencyCode: "EUR",
  defaultLocale: "de_DE",
  enable3DSecure: false,
  enableCreditCard: false,
  enablePayPal: false,
  enableGooglePay: false,
  enableApplePay: false,
  enableSofort: false,
  enableSepaDirectDebit: false,
};

/** Plugin settings with a 1s debounced autosave per field, instant method toggles and a test connection. */
export const useSettings = () => {
  const { toggleNotification } = useNotification();
  const [settings, setSettings] = React.useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState(null);
  const { getSettings, updateSettings, testConnection } = usePayoneApi();
  const saveTimeoutRef = React.useRef(null);

  const notifyError = (message) => toggleNotification({ type: "danger", message });

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await getSettings();
      const settingsData = response?.data?.data || response?.data;
      if (settingsData && typeof settingsData === "object") setSettings(settingsData);
    } catch (error) {
      toggleNotification({ type: "warning", message: "Failed to load settings" });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadSettings();
    return () => clearTimeout(saveTimeoutRef.current);
  }, []);

  const saveAndReload = async (nextSettings, handleError) => {
    setIsSaving(true);
    try {
      await updateSettings(nextSettings);
      await loadSettings();
    } catch (error) {
      handleError();
      notifyError("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      let latestSettings;
      setSettings((prev) => {
        latestSettings = { ...prev };
        return prev;
      });

      await saveAndReload(latestSettings, () =>
        setSettings((prev) => ({ ...prev, [field]: prev[field] }))
      );
    }, AUTOSAVE_DELAY_MS);
  };

  const handlePaymentMethodToggle = async (field, value) => {
    const enabled = Boolean(value);
    let nextSettings;
    setSettings((prev) => {
      nextSettings = { ...prev, [field]: enabled };
      return nextSettings;
    });

    await saveAndReload(nextSettings, () => setSettings((prev) => ({ ...prev, [field]: !enabled })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      toggleNotification({ type: "success", message: "Settings saved successfully" });
      await loadSettings();
    } catch (error) {
      notifyError("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await testConnection();
      setTestResult(response.data);

      if (response.data && response.data.success) {
        toggleNotification({ type: "success", message: response.data.message || "Test completed" });
        return;
      }

      notifyError(response.data.error.ErrorMessage || "Failed to test connection");
      throw new Error(response.data.error.ErrorMessage);
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsTesting(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    isTesting,
    testResult,
    handleInputChange,
    handlePaymentMethodToggle,
    handleSave,
    handleTestConnection,
  };
};
