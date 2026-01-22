import { useState, useEffect, useRef } from "react";
import { useNotification } from "@strapi/helper-plugin";
import payoneRequests from "../utils/api";

const useSettings = () => {
  const toggleNotification = useNotification();
  const [settings, setSettings] = useState({
    aid: "",
    portalid: "",
    mid: "",
    key: "",
    mode: "test",
    api_version: "3.10",
    merchantName: "",
    displayName: "",
    domainName: "",
    merchantIdentifier: "",
    enable3DSecure: false,
    enableCreditCard: false,
    enablePayPal: false,
    enableGooglePay: false,
    enableApplePay: false,
    enableSepaDirectDebit: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
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
      const response = await payoneRequests.getSettings();
      if (response?.data) setSettings(response.data);
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
        await payoneRequests.updateSettings(updatedSettings);
        await loadSettings();
      } catch (error) {
        setSettings((prev) => {
          const previousValue = prev[field];
          return { ...prev, [field]: previousValue };
        });

        toggleNotification({
          type: "warning",
          message: "Failed to update settings"
        });

      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

  const handlePaymentMethodToggle = async (field, value) => {
    let updatedSettings;
    setSettings((prev) => {
      updatedSettings = { ...prev, [field]: value };
      return updatedSettings;
    });

    setIsSaving(true);
    try {
      await payoneRequests.updateSettings(updatedSettings);
      toggleNotification({
        type: "success",
        message: "Payment method updated successfully"
      });
    } catch (error) {
      setSettings((prev) => ({ ...prev, [field]: !value }));
      toggleNotification({
        type: "warning",
        message: "Failed to update payment method"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await payoneRequests.updateSettings(settings);
      toggleNotification({
        type: "success",
        message: "Settings saved successfully"
      });
      await loadSettings();
    } catch (error) {
      toggleNotification({
        type: "warning",
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
      const response = await payoneRequests.testConnection();
      console.log("response test connection", response?.data, response?.data?.error?.ErrorMessage);
      if (response?.data && response?.data?.success) {
        setTestResult(response?.data);
        toggleNotification({
          type: "success",
          message: response?.data?.message || "Test completed"
        });
      } else {
        setTestResult(response?.data);
        toggleNotification({
          type: "warning",
          message: response?.data?.error?.ErrorMessage
        });

        throw new Error(response?.data?.error?.ErrorMessage);
      }
    } catch (error) {
      toggleNotification({
        type: "warning",
        message: error?.message
      });
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

