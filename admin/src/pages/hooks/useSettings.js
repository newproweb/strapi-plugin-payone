import * as React from "react";
import { useNotification } from "@strapi/strapi/admin";
import usePayoneRequests from "../utils/api";

const useSettings = () => {
  const { toggleNotification } = useNotification();
  const [settings, setSettings] = React.useState({
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
    enableSepaDirectDebit: false
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTesting, setIsTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState(null);
  const { getSettings, updateSettings, testConnection } = usePayoneRequests();
  const saveTimeoutRef = React.useRef(null);


  React.useEffect(() => {
    loadSettings();
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await getSettings();
      const settingsData = response?.data?.data || response?.data;
      if (settingsData && typeof settingsData === 'object') {
        setSettings(settingsData);
      }
    } catch (error) {
      toggleNotification({
        type: "warning",
        message: "Failed to load settings"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      let updatedSettings;
      setSettings((prev) => {
        updatedSettings = { ...prev };
        return prev;
      });

      setIsSaving(true);
      try {
        await updateSettings(updatedSettings);
        await loadSettings();
      } catch (error) {
        setSettings((prev) => {
          const previousValue = prev[field];
          return { ...prev, [field]: previousValue };
        });

        toggleNotification({
          type: "danger",
          message: "Failed to update settings"
        });

      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

  const handlePaymentMethodToggle = async (field, value) => {
    const booleanValue = Boolean(value);
    let updatedSettings;

    setSettings((prev) => {
      updatedSettings = { ...prev, [field]: booleanValue };
      return updatedSettings;
    });

    setIsSaving(true);
    try {
      await updateSettings(updatedSettings);
      await loadSettings();
    } catch (error) {
      setSettings((prev) => ({ ...prev, [field]: !booleanValue }));
      toggleNotification({
        type: "danger",
        message: "Failed to update settings"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      toggleNotification({
        type: "success",
        message: "Settings saved successfully"
      });
      await loadSettings();
    } catch (error) {
      toggleNotification({
        type: "danger",
        message: "Failed to save settings"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await testConnection();
      if (response.data && response.data.success) {
        setTestResult(response.data);
        toggleNotification({
          type: "success",
          message: response.data.message || "Test completed"
        });
      } else {
        setTestResult(response.data);
        toggleNotification({
          type: "danger",
          message: response.data.error.ErrorMessage || "Failed to test connection"
        });

        throw new Error(response.data.error.ErrorMessage);
      }
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
    handleTestConnection
  };
};

export default useSettings;

