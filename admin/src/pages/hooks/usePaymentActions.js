import { useState, useEffect } from "react";
import { useNotification } from "@strapi/helper-plugin";
import payoneRequests from "../utils/api";
import {
  getPreauthorizationParams,
  getAuthorizationParams,
  getCaptureParams,
  getRefundParams,
  generateLagOrderNumber
} from "../utils/paymentUtils";
import { DEFAULT_PAYMENT_DATA } from "../constants/paymentConstants";

const usePaymentActions = () => {
  const toggleNotification = useNotification();

<<<<<<< HEAD
  // Load settings to get enable3DSecure value
=======
>>>>>>> feature/apple-pay
  const [settings, setSettings] = useState({ enable3DSecure: false });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await payoneRequests.getSettings();
        if (response?.data) {
          setSettings(response.data);
        }
      } catch (error) {
<<<<<<< HEAD
        // Silent fail
=======
>>>>>>> feature/apple-pay
      }
    };
    loadSettings();
  }, []);

<<<<<<< HEAD
  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState("1000");

  // Generate order reference using generateLagOrderNumber
  // Sequence number starts from 1000 and increments based on timestamp
  const generateOrderReference = () => {
    // Use timestamp to generate unique sequence (1000 to 99999 range)
=======
  const [paymentAmount, setPaymentAmount] = useState("1000");

  const generateOrderReference = () => {
>>>>>>> feature/apple-pay
    const sequence = 1000 + Math.floor((Date.now() % 99000));
    return generateLagOrderNumber(sequence);
  };

  const [preauthReference, setPreauthReference] = useState(generateOrderReference());
  const [authReference, setAuthReference] = useState(generateOrderReference());
  const [captureTxid, setCaptureTxid] = useState("");
  const [refundTxid, setRefundTxid] = useState("");
  const [refundSequenceNumber, setRefundSequenceNumber] = useState("2");
  const [refundReference, setRefundReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cc");
  const [captureMode, setCaptureMode] = useState("full");
  const [googlePayToken, setGooglePayToken] = useState(null);
  const [applePayToken, setApplePayToken] = useState(null);

<<<<<<< HEAD
  // Card details for 3DS testing
=======
>>>>>>> feature/apple-pay
  const [cardtype, setCardtype] = useState("");
  const [cardpan, setCardpan] = useState("");
  const [cardexpiredate, setCardexpiredate] = useState("");
  const [cardcvc2, setCardcvc2] = useState("");

<<<<<<< HEAD
  // Payment processing state
=======
>>>>>>> feature/apple-pay
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
    console.log("[Payment] handlePreauthorization called", {
      hasToken: !!tokenParam,
      paymentMethod,
      amount: paymentAmount
    });
<<<<<<< HEAD
    
=======

>>>>>>> feature/apple-pay
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
<<<<<<< HEAD
      // Auto-generate reference if empty
=======
>>>>>>> feature/apple-pay
      const finalPreauthReference = preauthReference.trim() || generateOrderReference();
      if (!preauthReference.trim()) {
        setPreauthReference(finalPreauthReference);
      }

<<<<<<< HEAD
      // Determine currency based on card type
      // American Express typically requires USD, other cards use EUR
=======
>>>>>>> feature/apple-pay
      const currency = (paymentMethod === "cc" && cardtype === "A") ? "USD" : "EUR";

      const baseParams = {
        amount: parseInt(paymentAmount),
        currency: currency,
        reference: finalPreauthReference,
        enable3DSecure: settings.enable3DSecure !== false,
        ...DEFAULT_PAYMENT_DATA
      };

<<<<<<< HEAD
      // Add card details if credit card payment and 3DS enabled
=======
>>>>>>> feature/apple-pay
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
<<<<<<< HEAD
        // Detect current context (admin or content-ui) from pathname
=======
>>>>>>> feature/apple-pay
        const currentPath = window.location.pathname;
        const isContentUI = currentPath.includes('/content-ui') || currentPath.includes('/content-manager');
        const basePath = isContentUI ? '/content-ui' : '/admin';
        const pluginPath = '/plugins/strapi-plugin-payone-provider/payment';

        baseParams.successurl = `${baseUrl}${basePath}${pluginPath}/success`;
        baseParams.errorurl = `${baseUrl}${basePath}${pluginPath}/error`;
        baseParams.backurl = `${baseUrl}${basePath}${pluginPath}/back`;
      }

      const tokenToUse = tokenParam || googlePayToken || applePayToken;
      if (paymentMethod === "gpp" && tokenToUse) {
        baseParams.googlePayToken = tokenToUse;
        baseParams.settings = settings;
      } else if (paymentMethod === "apl" && tokenToUse) {
        baseParams.applePayToken = tokenToUse;
        baseParams.settings = settings;
      }

      const params = getPreauthorizationParams(paymentMethod, baseParams);

      const result = await payoneRequests.preauthorization(params);
      const responseData = result?.data || result;
<<<<<<< HEAD

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

=======
>>>>>>> feature/apple-pay
      const status = (responseData.status || responseData.Status || "").toUpperCase();
      const errorCode = responseData.errorcode || responseData.errorCode || responseData.ErrorCode;
      const errorMessage = responseData.errormessage || responseData.errorMessage || responseData.ErrorMessage;

<<<<<<< HEAD
      // Check for 3DS required error (4219)
      const requires3DSErrorCodes = ["4219", 4219];
      const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);

      // Check all possible redirect URL fields
=======
      const requires3DSErrorCodes = ["4219", 4219];
      const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);

>>>>>>> feature/apple-pay
      const redirectUrl =
        responseData.redirectUrl ||
        responseData.redirecturl ||
        responseData.RedirectUrl ||
        responseData.redirect_url ||
        responseData.url ||
        responseData.Url ||
        null;

<<<<<<< HEAD
      // If 3DS required but no redirect URL, show helpful message
=======
>>>>>>> feature/apple-pay
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

<<<<<<< HEAD
      // Check for other errors (but not 3DS required)
=======
>>>>>>> feature/apple-pay
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

<<<<<<< HEAD
      console.log("[Payment] Preauthorization result:", {
        status,
        hasError: !!errorCode,
        errorCode,
        errorMessage
      });

      if (status === "APPROVED") {
        handlePaymentSuccess("Preauthorization completed successfully");
        // Return success result for Apple Pay callback
=======
      if (status === "APPROVED") {
        handlePaymentSuccess("Preauthorization completed successfully");
>>>>>>> feature/apple-pay
        return { success: true, data: responseData };
      } else {
        const errorMsg = errorMessage || `Unexpected status: ${status}`;
        handlePaymentError(
          { message: errorMsg },
          `Preauthorization completed with status: ${status}`
        );
<<<<<<< HEAD
        // Return error result for Apple Pay callback
=======
>>>>>>> feature/apple-pay
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("[Payment] Preauthorization error:", error);
      handlePaymentError(error, "Preauthorization failed");
<<<<<<< HEAD
      // Re-throw error so Apple Pay callback knows it failed
=======
>>>>>>> feature/apple-pay
      throw error;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAuthorization = async (tokenParam = null) => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);

    try {
<<<<<<< HEAD
      // Auto-generate reference if empty
=======
>>>>>>> feature/apple-pay
      const finalAuthReference = authReference.trim() || generateOrderReference();
      if (!authReference.trim()) {
        setAuthReference(finalAuthReference);
      }

<<<<<<< HEAD
      // Determine currency based on card type
      // American Express typically requires USD, other cards use EUR
=======
>>>>>>> feature/apple-pay
      const currency = (paymentMethod === "cc" && cardtype === "A") ? "USD" : "EUR";

      const baseParams = {
        amount: parseInt(paymentAmount),
        currency: currency,
        reference: finalAuthReference,
        enable3DSecure: settings.enable3DSecure !== false,
        ...DEFAULT_PAYMENT_DATA
      };

<<<<<<< HEAD
      // Add card details if credit card payment and 3DS enabled
=======
>>>>>>> feature/apple-pay
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
<<<<<<< HEAD
        // Detect current context (admin or content-ui) from pathname
=======
>>>>>>> feature/apple-pay
        const currentPath = window.location.pathname;
        const isContentUI = currentPath.includes('/content-ui') || currentPath.includes('/content-manager');
        const basePath = isContentUI ? '/content-ui' : '/admin';
        const pluginPath = '/plugins/strapi-plugin-payone-provider/payment';

        baseParams.successurl = `${baseUrl}${basePath}${pluginPath}/success`;
        baseParams.errorurl = `${baseUrl}${basePath}${pluginPath}/error`;
        baseParams.backurl = `${baseUrl}${basePath}${pluginPath}/back`;
      }

      const tokenToUse = tokenParam || googlePayToken || applePayToken;
      if (paymentMethod === "gpp" && tokenToUse) {
        baseParams.googlePayToken = tokenToUse;
        baseParams.settings = settings;
      } else if (paymentMethod === "apl" && tokenToUse) {
        baseParams.applePayToken = tokenToUse;
        baseParams.settings = settings;
      }

      const params = getAuthorizationParams(paymentMethod, baseParams);

      const result = await payoneRequests.authorization(params);
      const responseData = result?.data || result;
<<<<<<< HEAD

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

=======
>>>>>>> feature/apple-pay
      const status = (responseData.status || responseData.Status || "").toUpperCase();
      const errorCode = responseData.errorcode || responseData.errorCode || responseData.ErrorCode;
      const errorMessage = responseData.errormessage || responseData.errorMessage || responseData.ErrorMessage;

<<<<<<< HEAD
      // Check for 3DS required error (4219)
      const requires3DSErrorCodes = ["4219", 4219];
      const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);

      // Check all possible redirect URL fields
=======
      const requires3DSErrorCodes = ["4219", 4219];
      const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);

>>>>>>> feature/apple-pay
      const redirectUrl =
        responseData.redirectUrl ||
        responseData.redirecturl ||
        responseData.RedirectUrl ||
        responseData.redirect_url ||
        responseData.url ||
        responseData.Url ||
        null;

<<<<<<< HEAD
      // If 3DS required but no redirect URL, show helpful message
=======
>>>>>>> feature/apple-pay
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

<<<<<<< HEAD
      // Check for other errors (but not 3DS required)
=======
>>>>>>> feature/apple-pay
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

<<<<<<< HEAD
      console.log("[Payment] Authorization result:", {
        status,
        hasError: !!errorCode,
        errorCode,
        errorMessage
      });

=======
>>>>>>> feature/apple-pay
      if (status === "APPROVED") {
        handlePaymentSuccess("Authorization completed successfully");
        // Return success result for Apple Pay callback
        return { success: true, data: responseData };
      } else {
        const errorMsg = errorMessage || `Unexpected status: ${status}`;
        handlePaymentError(
          { message: errorMsg },
          `Authorization completed with status: ${status}`
        );
<<<<<<< HEAD
        // Return error result for Apple Pay callback
=======
>>>>>>> feature/apple-pay
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("[Payment] Authorization error:", error);
      handlePaymentError(error, "Authorization failed");
<<<<<<< HEAD
      // Re-throw error so Apple Pay callback knows it failed
=======
>>>>>>> feature/apple-pay
      throw error;
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

    // Apple Pay
    applePayToken,
    setApplePayToken,

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

