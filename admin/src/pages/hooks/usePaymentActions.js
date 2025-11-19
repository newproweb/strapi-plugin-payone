import { useState } from "react";
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
      const params = getPreauthorizationParams(paymentMethod, {
        amount: parseInt(paymentAmount),
        currency: "EUR",
        reference: preauthReference || `PREAUTH-${Date.now()}`,
        ...DEFAULT_PAYMENT_DATA
      });

      const result = await payoneRequests.preauthorization(params);
      setPaymentResult(result);
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
      const params = getAuthorizationParams(paymentMethod, {
        amount: parseInt(paymentAmount),
        currency: "EUR",
        reference: authReference || `AUTH-${Date.now()}`,
        ...DEFAULT_PAYMENT_DATA
      });

      console.log("📤 Authorization params:", params);
      console.log("📡 Sending authorization request...");

      const result = await payoneRequests.authorization(params);

      console.log("✅ Authorization result:", result);
      setPaymentResult(result);
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

