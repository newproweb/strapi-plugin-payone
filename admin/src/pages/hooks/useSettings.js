import { useState, useEffect } from "react";
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
    enable3DSecure: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadSettings();
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
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await payoneRequests.updateSettings(settings);
      toggleNotification({
        type: "success",
        message: "Settings saved successfully"
      });
      // Reload settings after save to ensure consistency
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
      if (response.data) {
        const result = response.data;
        setTestResult(result);
        if (result.success !== undefined) {
          toggleNotification({
            type: Boolean(result.success) ? "success" : "warning",
            message: result.message || "Test completed"
          });
        }
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      toggleNotification({
        type: "warning",
        message: "Failed to test connection"
      });
      setTestResult({
        success: false,
        message:
          "Failed to test connection. Please check your network and server logs for details.",
        details: {
          errorCode: "NETWORK",
          rawResponse: error.message || "Network error"
        }
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
    handleSave,
    handleTestConnection
  };
};

export default useSettings;

