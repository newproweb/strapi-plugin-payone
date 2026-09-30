import * as React from "react";
import { useNotification } from "@strapi/strapi/admin";
import { usePayoneApi } from "../../api/payone.api";

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

const changedFields = (draft, saved) =>
  Object.keys({ ...saved, ...draft }).filter((key) => JSON.stringify(draft[key]) !== JSON.stringify(saved[key]));

/** Plugin settings edited as a draft: nothing is stored until `handleSave`; `handleDiscard` reverts the draft. */
export const useSettings = () => {
  const { toggleNotification } = useNotification();
  const { getSettings, updateSettings, testConnection } = usePayoneApi();
  const [settings, setSettings] = React.useState(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = React.useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState(null);

  const changes = changedFields(settings, savedSettings);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await getSettings();
      const settingsData = response?.data?.data || response?.data;
      if (settingsData && typeof settingsData === "object") {
        setSettings(settingsData);
        setSavedSettings(settingsData);
      }
    } catch (error) {
      toggleNotification({ type: "warning", message: "Failed to load settings" });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadSettings();
  }, []);

  const handleInputChange = (field, value) => setSettings((prev) => ({ ...prev, [field]: value }));

  const handlePaymentMethodToggle = (field, value) => handleInputChange(field, Boolean(value));

  const handleDiscard = () => setSettings(savedSettings);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      toggleNotification({ type: "success", message: "Settings saved" });
      await loadSettings();
    } catch (error) {
      toggleNotification({ type: "danger", message: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await testConnection();
      const result = response?.data || { success: false, message: "Empty response from the server" };
      setTestResult(result);
      toggleNotification({
        type: result.success ? "success" : "danger",
        message: result.success ? result.message || "Test completed" : result.error?.ErrorMessage || result.message || "Failed to test connection",
      });
    } catch (error) {
      setTestResult({ success: false, message: error.message || "Failed to test connection" });
      toggleNotification({ type: "danger", message: "Failed to test connection" });
    } finally {
      setIsTesting(false);
    }
  };

  return {
    settings,
    savedSettings,
    changedFields: changes,
    isDirty: changes.length > 0,
    isLoading,
    isSaving,
    isTesting,
    testResult,
    handleInputChange,
    handlePaymentMethodToggle,
    handleDiscard,
    handleSave,
    handleTestConnection,
  };
};
