import { useState, useEffect } from "react";
import { useNotification } from "@strapi/helper-plugin";
import payoneRequests from "../utils/api";
import {
  getPreauthorizationParams,
  getAuthorizationParams,
  getCaptureParams,
  getRefundParams
} from "../utils/paymentUtils";
import { DEFAULT_PAYMENT_DATA } from "../constants/paymentConstants";

const usePaymentActions = () => {
  const toggleNotification = useNotification();

  // Load settings to get enable3DSecure value
  const [settings, setSettings] = useState({ enable3DSecure: false });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await payoneRequests.getSettings();
        if (response?.data) {
          setSettings(response.data);
          console.log("📋 Settings loaded:", { enable3DSecure: response.data.enable3DSecure });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("1000");
  const [preauthReference, setPreauthReference] = useState("");
  const [authReference, setAuthReference] = useState("");
  const [captureTxid, setCaptureTxid] = useState("");
  const [refundTxid, setRefundTxid] = useState("");
  const [refundSequenceNumber, setRefundSequenceNumber] = useState("2");
  const [refundReference, setRefundReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cc");
  const [captureMode, setCaptureMode] = useState("full");

  // Payment processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const handlePaymentError = (error, defaultMessage) => {
    const errorMessage =
      error.response?.data?.data?.Error?.ErrorMessage ||
      error.message ||
      defaultMessage;
    setPaymentError(errorMessage);
    toggleNotification({
      type: "warning",
      message: defaultMessage
    });
  };

  const handlePaymentSuccess = (message) => {
    toggleNotification({
      type: "success",
      message
    });
  };

  const handlePreauthorization = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
      // Build base params
      const baseParams = {
        amount: parseInt(paymentAmount),
        currency: "EUR",
        reference: preauthReference || `PREAUTH-${Date.now()}`,
        enable3DSecure: settings.enable3DSecure !== false, // Use settings value
        ...DEFAULT_PAYMENT_DATA
      };

      // Add redirect URLs only if 3DS is enabled for credit card payments
      // or for redirect-based payment methods (PayPal, Google Pay, Apple Pay, Sofort)
      const needsRedirectUrls =
        (paymentMethod === "cc" && settings.enable3DSecure !== false) ||
        ["wlt", "gpp", "apl", "sb"].includes(paymentMethod);

      if (needsRedirectUrls) {
        // Use current window location as base for admin panel testing
        const baseUrl = window.location.origin;
        baseParams.successurl = `${baseUrl}/api/strapi-plugin-payone-provider/payment/success`;
        baseParams.errorurl = `${baseUrl}/api/strapi-plugin-payone-provider/payment/error`;
        baseParams.backurl = `${baseUrl}/api/strapi-plugin-payone-provider/payment/back`;
      }

      const params = getPreauthorizationParams(paymentMethod, baseParams);

      console.log("🔐 3DS setting:", settings.enable3DSecure);
      console.log("🔗 Redirect URLs needed:", needsRedirectUrls);
      console.log("📋 Preauthorization params:", params);

      const result = await payoneRequests.preauthorization(params);
      const responseData = result?.data || result;

      console.log("📥 Preauthorization response:", responseData);
      console.log("🔍 Checking for 3DS redirect:", {
        requires3DSRedirect: responseData.requires3DSRedirect,
        redirectUrl: responseData.redirectUrl,
        status: responseData.status,
        redirecturl: responseData.redirecturl
      });

      // Check if 3DS redirect is required (check multiple possible field names)
      const redirectUrl = responseData.redirectUrl || responseData.redirecturl || responseData.RedirectUrl;
      const needsRedirect = responseData.requires3DSRedirect ||
        (responseData.status === "REDIRECT" && redirectUrl) ||
        (responseData.Status === "REDIRECT" && redirectUrl);

      if (needsRedirect && redirectUrl) {
        console.log("🔐 3DS redirect required, redirecting to:", redirectUrl);
        // Redirect to 3DS authentication page
        window.location.href = redirectUrl;
        return; // Don't set result or show success message yet
      }

      setPaymentResult(responseData);
      handlePaymentSuccess("Preauthorization completed successfully");
    } catch (error) {
      handlePaymentError(error, "Preauthorization failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAuthorization = async () => {
    console.log("🚀 handleAuthorization called", {
      paymentMethod,
      paymentAmount,
      authReference
    });

    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);

    try {
      // Build base params
      const baseParams = {
        amount: parseInt(paymentAmount),
        currency: "EUR",
        reference: authReference || `AUTH-${Date.now()}`,
        enable3DSecure: settings.enable3DSecure !== false, // Use settings value
        ...DEFAULT_PAYMENT_DATA
      };

      // Add redirect URLs only if 3DS is enabled for credit card payments
      // or for redirect-based payment methods (PayPal, Google Pay, Apple Pay, Sofort)
      const needsRedirectUrls =
        (paymentMethod === "cc" && settings.enable3DSecure !== false) ||
        ["wlt", "gpp", "apl", "sb"].includes(paymentMethod);

      if (needsRedirectUrls) {
        // Use current window location as base for admin panel testing
        const baseUrl = window.location.origin;
        baseParams.successurl = `${baseUrl}/api/strapi-plugin-payone-provider/payment/success`;
        baseParams.errorurl = `${baseUrl}/api/strapi-plugin-payone-provider/payment/error`;
        baseParams.backurl = `${baseUrl}/api/strapi-plugin-payone-provider/payment/back`;
      }

      const params = getAuthorizationParams(paymentMethod, baseParams);

      console.log("🔐 3DS setting:", settings.enable3DSecure);
      console.log("🔗 Redirect URLs needed:", needsRedirectUrls);
      console.log("📤 Authorization params:", params);
      console.log("📡 Sending authorization request...");

      const result = await payoneRequests.authorization(params);
      const responseData = result?.data || result;

      console.log("✅ Authorization result:", responseData);
      console.log("🔍 Checking for 3DS redirect:", {
        requires3DSRedirect: responseData.requires3DSRedirect,
        redirectUrl: responseData.redirectUrl,
        status: responseData.status,
        redirecturl: responseData.redirecturl
      });

      // Check if 3DS redirect is required (check multiple possible field names)
      const redirectUrl = responseData.redirectUrl || responseData.redirecturl || responseData.RedirectUrl;
      const needsRedirect = responseData.requires3DSRedirect ||
        (responseData.status === "REDIRECT" && redirectUrl) ||
        (responseData.Status === "REDIRECT" && redirectUrl);

      if (needsRedirect && redirectUrl) {
        console.log("🔐 3DS redirect required, redirecting to:", redirectUrl);
        // Redirect to 3DS authentication page
        window.location.href = redirectUrl;
        return; // Don't set result or show success message yet
      }

      setPaymentResult(responseData);
      handlePaymentSuccess("Authorization completed successfully");
    } catch (error) {
      console.error("❌ Authorization error:", error);
      handlePaymentError(error, "Authorization failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCapture = async () => {
    if (!captureTxid.trim()) {
      setPaymentError("Transaction ID is required for capture");
      return;
    }
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
      const params = getCaptureParams(paymentMethod, {
        txid: captureTxid,
        amount: parseInt(paymentAmount),
        currency: "EUR",
        captureMode: captureMode,
        sequencenumber: 1
      });

      const result = await payoneRequests.capture(params);
      setPaymentResult(result);
      handlePaymentSuccess("Capture completed successfully");
    } catch (error) {
      handlePaymentError(error, "Capture failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRefund = async () => {
    if (!refundTxid.trim()) {
      setPaymentError("Transaction ID is required for refund");
      return;
    }
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
      const params = getRefundParams(paymentMethod, {
        txid: refundTxid,
        sequencenumber: parseInt(refundSequenceNumber),
        amount: parseInt(paymentAmount),
        currency: "EUR",
        reference: refundReference || `REFUND-${Date.now()}`
      });

      const result = await payoneRequests.refund(params);
      setPaymentResult(result);
      handlePaymentSuccess("Refund completed successfully");
    } catch (error) {
      handlePaymentError(error, "Refund failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return {
    // Form state
    paymentAmount,
    setPaymentAmount,
    preauthReference,
    setPreauthReference,
    authReference,
    setAuthReference,
    captureTxid,
    setCaptureTxid,
    refundTxid,
    setRefundTxid,
    refundSequenceNumber,
    setRefundSequenceNumber,
    refundReference,
    setRefundReference,
    paymentMethod,
    setPaymentMethod,
    captureMode,
    setCaptureMode,

    // Processing state
    isProcessingPayment,
    paymentResult,
    paymentError,

    // Handlers
    handlePreauthorization,
    handleAuthorization,
    handleCapture,
    handleRefund
  };
};

export default usePaymentActions;

