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
        }
      } catch (error) {
        // Silent fail
      }
    };
    loadSettings();
  }, []);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("1000");

  // Generate reference automatically
  const generateReference = (prefix = "REF") => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}${random}`.slice(0, 20);
  };

  const [preauthReference, setPreauthReference] = useState(generateReference("PRE"));
  const [authReference, setAuthReference] = useState(generateReference("AUTH"));
  const [captureTxid, setCaptureTxid] = useState("");
  const [refundTxid, setRefundTxid] = useState("");
  const [refundSequenceNumber, setRefundSequenceNumber] = useState("2");
  const [refundReference, setRefundReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cc");
  const [captureMode, setCaptureMode] = useState("full");
  const [googlePayToken, setGooglePayToken] = useState(null);

  // Card details for 3DS testing
  const [cardtype, setCardtype] = useState("");
  const [cardpan, setCardpan] = useState("");
  const [cardexpiredate, setCardexpiredate] = useState("");
  const [cardcvc2, setCardcvc2] = useState("");

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

  const handlePreauthorization = async (tokenParam = null) => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
      // Auto-generate reference if empty
      const finalPreauthReference = preauthReference.trim() || generateReference("PRE");
      if (!preauthReference.trim()) {
        setPreauthReference(finalPreauthReference);
      }

      // Determine currency based on card type
      // American Express typically requires USD, other cards use EUR
      const currency = (paymentMethod === "cc" && cardtype === "A") ? "USD" : "EUR";

      const baseParams = {
        amount: parseInt(paymentAmount),
        currency: currency,
        reference: finalPreauthReference,
        enable3DSecure: settings.enable3DSecure !== false,
        ...DEFAULT_PAYMENT_DATA
      };

      // Add card details if credit card payment and 3DS enabled
      if (paymentMethod === "cc" && settings.enable3DSecure !== false) {
        if (cardtype) baseParams.cardtype = cardtype;
        if (cardpan) baseParams.cardpan = cardpan;
        if (cardexpiredate) baseParams.cardexpiredate = cardexpiredate;
        if (cardcvc2) baseParams.cardcvc2 = cardcvc2;
      }

      const needsRedirectUrls =
        (paymentMethod === "cc" && settings.enable3DSecure !== false) ||
        ["wlt", "gpp", "apl", "sb"].includes(paymentMethod);

      if (needsRedirectUrls) {
        const baseUrl = window.location.origin;
        baseParams.successurl = `${baseUrl}/admin/plugins/strapi-plugin-payone-provider/payment/success`;
        baseParams.errorurl = `${baseUrl}/admin/plugins/strapi-plugin-payone-provider/payment/error`;
        baseParams.backurl = `${baseUrl}/admin/plugins/strapi-plugin-payone-provider/payment/back`;
      }

      const tokenToUse = tokenParam || googlePayToken;
      if (paymentMethod === "gpp" && tokenToUse) {
        baseParams.googlePayToken = tokenToUse;
        baseParams.settings = settings;
      }

      const params = getPreauthorizationParams(paymentMethod, baseParams);

      const result = await payoneRequests.preauthorization(params);
      const responseData = result?.data || result;

      // Log full response
      console.log("Preauthorization Response:", responseData);
      console.log("Response Status:", responseData.status || responseData.Status);
      console.log("Response Error Code:", responseData.errorcode || responseData.errorCode || responseData.ErrorCode);
      console.log("Response Error Message:", responseData.errormessage || responseData.errorMessage || responseData.ErrorMessage);
      console.log("All redirect URL fields:", {
        redirectUrl: responseData.redirectUrl,
        redirecturl: responseData.redirecturl,
        RedirectUrl: responseData.RedirectUrl,
        redirect_url: responseData.redirect_url,
        url: responseData.url,
        Url: responseData.Url
      });

      const status = (responseData.status || responseData.Status || "").toUpperCase();
      const errorCode = responseData.errorcode || responseData.errorCode || responseData.ErrorCode;
      const errorMessage = responseData.errormessage || responseData.errorMessage || responseData.ErrorMessage;

      // Check for 3DS required error (4219)
      const requires3DSErrorCodes = ["4219", 4219];
      const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);

      // Check all possible redirect URL fields
      const redirectUrl =
        responseData.redirectUrl ||
        responseData.redirecturl ||
        responseData.RedirectUrl ||
        responseData.redirect_url ||
        responseData.url ||
        responseData.Url ||
        null;

      // If 3DS required but no redirect URL, show helpful message
      if (is3DSRequiredError && !redirectUrl) {
        console.warn("3DS authentication required (Error 4219) but no redirect URL found in response");
        console.log("Full response:", JSON.stringify(responseData, null, 2));
        setPaymentError(
          "3D Secure authentication required. Please check Payone configuration and ensure redirect URLs are properly set. Error: " +
          (errorMessage || `Error code: ${errorCode}`)
        );
        setPaymentResult(responseData);
        return;
      }

      // Check for other errors (but not 3DS required)
      if ((status === "ERROR" || status === "INVALID" || errorCode) && !is3DSRequiredError) {
        setPaymentError(
          errorMessage ||
          `Payment failed with error code: ${errorCode || "Unknown"}` ||
          "Preauthorization failed"
        );
        setPaymentResult(responseData);
        return;
      }

      const needsRedirect = responseData.requires3DSRedirect ||
        (status === "REDIRECT" && redirectUrl) ||
        (is3DSRequiredError && redirectUrl);

      if (needsRedirect && redirectUrl) {
        console.log("Redirecting to 3DS:", redirectUrl);
        window.location.href = redirectUrl;
        return;
      }

      setPaymentResult(responseData);

      if (status === "APPROVED") {
        handlePaymentSuccess("Preauthorization completed successfully");
      } else {
        handlePaymentError(
          { message: `Unexpected status: ${status}` },
          `Preauthorization completed with status: ${status}`
        );
      }
    } catch (error) {
      handlePaymentError(error, "Preauthorization failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAuthorization = async (tokenParam = null) => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);

    try {
      // Auto-generate reference if empty
      const finalAuthReference = authReference.trim() || generateReference("AUTH");
      if (!authReference.trim()) {
        setAuthReference(finalAuthReference);
      }

      // Determine currency based on card type
      // American Express typically requires USD, other cards use EUR
      const currency = (paymentMethod === "cc" && cardtype === "A") ? "USD" : "EUR";

      const baseParams = {
        amount: parseInt(paymentAmount),
        currency: currency,
        reference: finalAuthReference,
        enable3DSecure: settings.enable3DSecure !== false,
        ...DEFAULT_PAYMENT_DATA
      };

      // Add card details if credit card payment and 3DS enabled
      if (paymentMethod === "cc" && settings.enable3DSecure !== false) {
        if (cardtype) baseParams.cardtype = cardtype;
        if (cardpan) baseParams.cardpan = cardpan;
        if (cardexpiredate) baseParams.cardexpiredate = cardexpiredate;
        if (cardcvc2) baseParams.cardcvc2 = cardcvc2;
      }

      const needsRedirectUrls =
        (paymentMethod === "cc" && settings.enable3DSecure !== false) ||
        ["wlt", "gpp", "apl", "sb"].includes(paymentMethod);

      if (needsRedirectUrls) {
        const baseUrl = window.location.origin;
        baseParams.successurl = `${baseUrl}/admin/plugins/strapi-plugin-payone-provider/payment/success`;
        baseParams.errorurl = `${baseUrl}/admin/plugins/strapi-plugin-payone-provider/payment/error`;
        baseParams.backurl = `${baseUrl}/admin/plugins/strapi-plugin-payone-provider/payment/back`;
      }

      const tokenToUse = tokenParam || googlePayToken;
      if (paymentMethod === "gpp" && tokenToUse) {
        baseParams.googlePayToken = tokenToUse;
        baseParams.settings = settings;
      }

      const params = getAuthorizationParams(paymentMethod, baseParams);

      const result = await payoneRequests.authorization(params);
      const responseData = result?.data || result;

      // Log full response
      console.log("Authorization Response:", responseData);
      console.log("Response Status:", responseData.status || responseData.Status);
      console.log("Response Error Code:", responseData.errorcode || responseData.errorCode || responseData.ErrorCode);
      console.log("Response Error Message:", responseData.errormessage || responseData.errorMessage || responseData.ErrorMessage);
      console.log("All redirect URL fields:", {
        redirectUrl: responseData.redirectUrl,
        redirecturl: responseData.redirecturl,
        RedirectUrl: responseData.RedirectUrl,
        redirect_url: responseData.redirect_url,
        url: responseData.url,
        Url: responseData.Url
      });

      const status = (responseData.status || responseData.Status || "").toUpperCase();
      const errorCode = responseData.errorcode || responseData.errorCode || responseData.ErrorCode;
      const errorMessage = responseData.errormessage || responseData.errorMessage || responseData.ErrorMessage;

      // Check for 3DS required error (4219)
      const requires3DSErrorCodes = ["4219", 4219];
      const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);

      // Check all possible redirect URL fields
      const redirectUrl =
        responseData.redirectUrl ||
        responseData.redirecturl ||
        responseData.RedirectUrl ||
        responseData.redirect_url ||
        responseData.url ||
        responseData.Url ||
        null;

      // If 3DS required but no redirect URL, show helpful message
      if (is3DSRequiredError && !redirectUrl) {
        console.warn("3DS authentication required (Error 4219) but no redirect URL found in response");
        console.log("Full response:", JSON.stringify(responseData, null, 2));
        setPaymentError(
          "3D Secure authentication required. Please check Payone configuration and ensure redirect URLs are properly set. Error: " +
          (errorMessage || `Error code: ${errorCode}`)
        );
        setPaymentResult(responseData);
        return;
      }

      // Check for other errors (but not 3DS required)
      if ((status === "ERROR" || status === "INVALID" || errorCode) && !is3DSRequiredError) {
        setPaymentError(
          errorMessage ||
          `Payment failed with error code: ${errorCode || "Unknown"}` ||
          "Authorization failed"
        );
        setPaymentResult(responseData);
        return;
      }

      const needsRedirect = responseData.requires3DSRedirect ||
        (status === "REDIRECT" && redirectUrl) ||
        (is3DSRequiredError && redirectUrl);

      if (needsRedirect && redirectUrl) {
        console.log("Redirecting to 3DS:", redirectUrl);
        window.location.href = redirectUrl;
        return;
      }

      setPaymentResult(responseData);

      if (status === "APPROVED") {
        handlePaymentSuccess("Authorization completed successfully");
      } else {
        handlePaymentError(
          { message: `Unexpected status: ${status}` },
          `Authorization completed with status: ${status}`
        );
      }
    } catch (error) {
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
    handleRefund,

    // Google Pay
    googlePayToken,
    setGooglePayToken,

    // Card details for 3DS
    cardtype,
    setCardtype,
    cardpan,
    setCardpan,
    cardexpiredate,
    setCardexpiredate,
    cardcvc2,
    setCardcvc2
  };
};

export default usePaymentActions;

