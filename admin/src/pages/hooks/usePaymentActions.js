import * as React from "react";
import { useNotification } from "@strapi/strapi/admin";
import {
  getPreauthorizationParams,
  getAuthorizationParams,
  getCaptureParams,
  getRefundParams,
  generateLagOrderNumber,
  getValidCardExpiryDate,
} from "../utils/paymentUtils";
import { DEFAULT_PAYMENT_DATA } from "../constants/paymentConstants";
import usePayoneRequests from "../utils/api";
import {
  getLanguageForCountry,
  getCurrencyForCountry,
} from "../utils/countryLanguageUtils";

const usePaymentActions = () => {
  const { toggleNotification } = useNotification();
  const { getSettings, preauthorization, authorization, capture, refund } = usePayoneRequests();
  const [settings, setSettings] = React.useState({ enable3DSecure: false });

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await getSettings();
        if (response?.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  const generateOrderReference = () => {
    const sequence = 1000 + Math.floor((Date.now() % 99000));
    return generateLagOrderNumber(sequence);
  };

  const [paymentState, setPaymentState] = React.useState({
    paymentAmount: "1000",
    preauthReference: generateOrderReference(),
    authReference: generateOrderReference(),
    captureTxid: "",
    refundTxid: "",
    refundSequenceNumber: "2",
    refundReference: "",
    paymentMethod: "cc",
    captureMode: "full",
    googlePayToken: null,
    applePayToken: null,
    cardtype: "",
    cardpan: "",
    cardexpiredate: "",
    cardcvc2: "",
    currency: "EUR",
    firstname: "John",
    lastname: "Doe",
    email: "test@example.com",
    street: "Test Street 123",
    zip: "12345",
    city: "Test City",
    country: "DE",
    telephonenumber: "01752345678",
    salutation: "Herr",
    gender: "m",
    ip: "127.0.0.1",
    language: "de",
    customerIsPresent: "yes",
    narrativeText: "",
    invoiceid: "",
    shippingFirstname: "John",
    shippingLastname: "Doe",
    shippingStreet: "Test Street 123",
    shippingZip: "12345",
    shippingCity: "Test City",
    shippingCountry: "DE",
    successurl: "",
    errorurl: "",
    backurl: "",
    captureSequenceNumber: "1",
    captureCurrency: "EUR",
    refundCurrency: "EUR",
  });

  const handleFieldChange = (field, value) => {
    setPaymentState((prev) => {
      const newState = { ...prev, [field]: value };

      if (field === "country" && value) {
        const languageCode = getLanguageForCountry(value);
        const currencyCode = getCurrencyForCountry(value);
        newState.language = languageCode;
        newState.currency = currencyCode;
        newState.shippingCountry = value;
      }

      if (field === "firstname" && value) {
        newState.shippingFirstname = value;
      }

      if (field === "lastname" && value) {
        newState.shippingLastname = value;
      }

      if (field === "street" && value) {
        newState.shippingStreet = value;
      }

      return newState;
    });
  };

  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [paymentResult, setPaymentResult] = React.useState(null);
  const [paymentError, setPaymentError] = React.useState(null);

  const handlePaymentError = (errorMessage) => {
    const defaultMessage = "Payment failed. Please check the error message and try again.";
    setPaymentError(errorMessage || defaultMessage);
    toggleNotification({
      type: "danger",
      message: errorMessage || defaultMessage
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
      const finalPreauthReference = generateOrderReference();
      handleFieldChange("preauthReference", finalPreauthReference);

      const finalCurrency = paymentState.currency || ((paymentState.paymentMethod === "cc" && paymentState.cardtype === "A") ? "USD" : "EUR");
      const finalInvoiceid = paymentState.invoiceid || finalPreauthReference;
      const finalNarrativeText = paymentState.narrativeText || ("Preauthorization for order " + finalPreauthReference);

      const baseParams = {
        amount: parseInt(paymentState.paymentAmount),
        currency: finalCurrency,
        reference: finalPreauthReference,
        enable3DSecure: settings.enable3DSecure !== false,
        invoiceid: finalInvoiceid,
        narrative_text: finalNarrativeText,
        firstname: paymentState.firstname || DEFAULT_PAYMENT_DATA.firstname,
        lastname: paymentState.lastname || DEFAULT_PAYMENT_DATA.lastname,
        email: paymentState.email || DEFAULT_PAYMENT_DATA.email,
        street: paymentState.street || DEFAULT_PAYMENT_DATA.street,
        zip: paymentState.zip || DEFAULT_PAYMENT_DATA.zip,
        city: paymentState.city || DEFAULT_PAYMENT_DATA.city,
        country: paymentState.country || DEFAULT_PAYMENT_DATA.country,
        telephonenumber: paymentState.telephonenumber || DEFAULT_PAYMENT_DATA.telephonenumber,
        salutation: paymentState.salutation || DEFAULT_PAYMENT_DATA.salutation,
        gender: paymentState.gender || DEFAULT_PAYMENT_DATA.gender,
        ip: paymentState.ip || DEFAULT_PAYMENT_DATA.ip,
        language: paymentState.language || DEFAULT_PAYMENT_DATA.language,
        customer_is_present: paymentState.customerIsPresent || DEFAULT_PAYMENT_DATA.customer_is_present,
        shipping_firstname: paymentState.shippingFirstname || paymentState.firstname || DEFAULT_PAYMENT_DATA.firstname,
        shipping_lastname: paymentState.shippingLastname || paymentState.lastname || DEFAULT_PAYMENT_DATA.lastname,
        shipping_street: paymentState.shippingStreet || paymentState.street || DEFAULT_PAYMENT_DATA.street,
        shipping_zip: paymentState.shippingZip || paymentState.zip || DEFAULT_PAYMENT_DATA.zip,
        shipping_city: paymentState.shippingCity || paymentState.city || DEFAULT_PAYMENT_DATA.city,
        shipping_country: paymentState.shippingCountry || paymentState.country || DEFAULT_PAYMENT_DATA.country,
      };

      if (paymentState.paymentMethod === "cc" && settings.enable3DSecure !== false) {
        if (paymentState.cardtype) baseParams.cardtype = paymentState.cardtype;
        if (paymentState.cardpan) baseParams.cardpan = paymentState.cardpan;
        baseParams.cardexpiredate = getValidCardExpiryDate(paymentState.cardexpiredate);
        if (paymentState.cardcvc2) baseParams.cardcvc2 = paymentState.cardcvc2;
      }

      const needsRedirectUrls =
        (paymentState.paymentMethod === "cc" && settings.enable3DSecure !== false) ||
        ["wlt", "gpp", "apl", "sb"].includes(paymentState.paymentMethod);

      if (needsRedirectUrls) {
        const baseUrl = window.location.origin;
        const currentPath = window.location.pathname;
        const isContentUI = currentPath.includes('/content-ui') || currentPath.includes('/content-manager');
        const basePath = isContentUI ? '/content-ui' : '/admin';
        const pluginPath = '/plugins/strapi-plugin-payone-provider/payment';

        baseParams.successurl = `${baseUrl}${basePath}${pluginPath}/success`;
        baseParams.errorurl = `${baseUrl}${basePath}${pluginPath}/error`;
        baseParams.backurl = `${baseUrl}${basePath}${pluginPath}/back`;
      }

      const tokenToUse = tokenParam || paymentState.googlePayToken || paymentState.applePayToken;
      if (paymentState.paymentMethod === "gpp" && tokenToUse) {
        baseParams.googlePayToken = tokenToUse;
        baseParams.settings = settings;
      } else if (paymentState.paymentMethod === "apl" && tokenToUse) {
        baseParams.applePayToken = tokenToUse;
        baseParams.settings = settings;
      }

      const params = getPreauthorizationParams(paymentState.paymentMethod, baseParams);

      const result = await preauthorization(params);
      const responseData = result?.data || result;
      const status = responseData?.Status || null;
      const errorCode = responseData?.errorCode || null;
      const errorMessage = responseData?.errorMessage || null;
      const requires3DSErrorCodes = ["4219", 4219];
      const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);
      const redirectUrl = responseData?.redirectUrl || null;

      if (is3DSRequiredError && !redirectUrl) {
        handlePaymentError(
          errorMessage + " " +
          (`Error code: ${errorCode || "Unknown"}`)
        );
        setPaymentResult(responseData);
        return { success: false, data: responseData };
      }

      if ((status === "ERROR" || status === "INVALID" || errorCode) && !is3DSRequiredError) {
        handlePaymentError(
          errorMessage + " " +
          (`Error code: ${errorCode || "Unknown"}`)
        );
        setPaymentResult(responseData);
        return { success: false, data: responseData };
      }

      const needsRedirect = responseData.requires3DSRedirect ||
        (status === "REDIRECT" && redirectUrl) ||
        (is3DSRequiredError && redirectUrl);

      if (needsRedirect && redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      setPaymentResult(responseData);

      if (status === "APPROVED") {
        handlePaymentSuccess("Preauthorization completed successfully");
        return { success: true, data: responseData };
      } else {
        const errorMsg = errorMessage || `Unexpected status: ${status}`;
        handlePaymentError(
          errorMsg + "Preauthorization completed with status: ${status}"
        );

        return { success: false, data: responseData };
      }
    } catch (error) {
      const errorMessage = error.message || "Preauthorization failed";
      handlePaymentError(errorMessage);
      return { success: false, data: error };
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAuthorization = async (tokenParam = null) => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);

    try {
      const finalAuthReference = generateOrderReference();
      handleFieldChange("authReference", finalAuthReference);

      const finalCurrency = paymentState.currency || ((paymentState.paymentMethod === "cc" && paymentState.cardtype === "A") ? "USD" : "EUR");
      const finalInvoiceid = paymentState.invoiceid || finalAuthReference;
      const finalNarrativeText = paymentState.narrativeText || ("Authorization for order " + finalAuthReference);

      const baseParams = {
        amount: parseInt(paymentState.paymentAmount),
        currency: finalCurrency,
        reference: finalAuthReference,
        enable3DSecure: settings.enable3DSecure !== false,
        invoiceid: finalInvoiceid,
        narrative_text: finalNarrativeText,
        firstname: paymentState.firstname || DEFAULT_PAYMENT_DATA.firstname,
        lastname: paymentState.lastname || DEFAULT_PAYMENT_DATA.lastname,
        email: paymentState.email || DEFAULT_PAYMENT_DATA.email,
        street: paymentState.street || DEFAULT_PAYMENT_DATA.street,
        zip: paymentState.zip || DEFAULT_PAYMENT_DATA.zip,
        city: paymentState.city || DEFAULT_PAYMENT_DATA.city,
        country: paymentState.country || DEFAULT_PAYMENT_DATA.country,
        telephonenumber: paymentState.telephonenumber || DEFAULT_PAYMENT_DATA.telephonenumber,
        salutation: paymentState.salutation || DEFAULT_PAYMENT_DATA.salutation,
        gender: paymentState.gender || DEFAULT_PAYMENT_DATA.gender,
        ip: paymentState.ip || DEFAULT_PAYMENT_DATA.ip,
        language: paymentState.language || DEFAULT_PAYMENT_DATA.language,
        customer_is_present: paymentState.customerIsPresent || DEFAULT_PAYMENT_DATA.customer_is_present,
        shipping_firstname: paymentState.shippingFirstname || paymentState.firstname || DEFAULT_PAYMENT_DATA.firstname,
        shipping_lastname: paymentState.shippingLastname || paymentState.lastname || DEFAULT_PAYMENT_DATA.lastname,
        shipping_street: paymentState.shippingStreet || paymentState.street || DEFAULT_PAYMENT_DATA.street,
        shipping_zip: paymentState.shippingZip || paymentState.zip || DEFAULT_PAYMENT_DATA.zip,
        shipping_city: paymentState.shippingCity || paymentState.city || DEFAULT_PAYMENT_DATA.city,
        shipping_country: paymentState.shippingCountry || paymentState.country || DEFAULT_PAYMENT_DATA.country,
      };

      if (paymentState.paymentMethod === "cc" && settings.enable3DSecure !== false) {
        if (paymentState.cardtype) baseParams.cardtype = paymentState.cardtype;
        if (paymentState.cardpan) baseParams.cardpan = paymentState.cardpan;
        baseParams.cardexpiredate = getValidCardExpiryDate(paymentState.cardexpiredate);
        if (paymentState.cardcvc2) baseParams.cardcvc2 = paymentState.cardcvc2;
      }

      const needsRedirectUrls =
        (paymentState.paymentMethod === "cc" && settings.enable3DSecure !== false) ||
        ["wlt", "gpp", "apl", "sb"].includes(paymentState.paymentMethod);

      if (needsRedirectUrls) {
        if (paymentState.successurl) {
          baseParams.successurl = paymentState.successurl;
        } else {
          const baseUrl = window.location.origin;
          const currentPath = window.location.pathname;
          const isContentUI = currentPath.includes('/content-ui') || currentPath.includes('/content-manager');
          const basePath = isContentUI ? '/content-ui' : '/admin';
          const pluginPath = '/plugins/strapi-plugin-payone-provider/payment';
          baseParams.successurl = `${baseUrl}${basePath}${pluginPath}/success`;
        }

        if (paymentState.errorurl) {
          baseParams.errorurl = paymentState.errorurl;
        } else {
          const baseUrl = window.location.origin;
          const currentPath = window.location.pathname;
          const isContentUI = currentPath.includes('/content-ui') || currentPath.includes('/content-manager');
          const basePath = isContentUI ? '/content-ui' : '/admin';
          const pluginPath = '/plugins/strapi-plugin-payone-provider/payment';
          baseParams.errorurl = `${baseUrl}${basePath}${pluginPath}/error`;
        }

        if (paymentState.backurl) {
          baseParams.backurl = paymentState.backurl;
        } else {
          const baseUrl = window.location.origin;
          const currentPath = window.location.pathname;
          const isContentUI = currentPath.includes('/content-ui') || currentPath.includes('/content-manager');
          const basePath = isContentUI ? '/content-ui' : '/admin';
          const pluginPath = '/plugins/strapi-plugin-payone-provider/payment';
          baseParams.backurl = `${baseUrl}${basePath}${pluginPath}/back`;
        }
      }

      const tokenToUse = tokenParam || paymentState.googlePayToken || paymentState.applePayToken;
      if (paymentState.paymentMethod === "gpp" && tokenToUse) {
        baseParams.googlePayToken = tokenToUse;
        baseParams.settings = settings;
      } else if (paymentState.paymentMethod === "apl" && tokenToUse) {
        baseParams.applePayToken = tokenToUse;
        baseParams.settings = settings;
      }

      const params = getAuthorizationParams(paymentState.paymentMethod, baseParams);
      const result = await authorization(params);

      const responseData = result?.data || result;
      const status = responseData?.Status || null;
      const errorCode = responseData?.errorCode || null;
      const errorMessage = responseData?.errorMessage || null;
      const requires3DSErrorCodes = ["4219", 4219];
      const is3DSRequiredError = requires3DSErrorCodes.includes(errorCode);
      const redirectUrl = responseData?.redirectUrl || null;


      if (is3DSRequiredError && !redirectUrl) {
        handlePaymentError(
          errorMessage + " " +
          (`Error code: ${errorCode || "Unknown"}`)
        );
        setPaymentResult(responseData);
        return { success: false, data: responseData };
      }

      if ((status === "ERROR" || status === "INVALID" || errorCode) && !is3DSRequiredError) {
        handlePaymentError(
          errorMessage + " " +
          (`Error code: ${errorCode || "Unknown"}`)
        );
        setPaymentResult(responseData);
        return { success: false, data: responseData };
      }

      const needsRedirect = responseData.requires3DSRedirect ||
        (status === "REDIRECT" && redirectUrl) ||
        (is3DSRequiredError && redirectUrl);

      if (needsRedirect && redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      setPaymentResult(responseData);

      if (status === "APPROVED") {
        handlePaymentSuccess("Authorization completed successfully");
        return { success: true, data: responseData };
      } else {
        const errorMsg = errorMessage + `Unexpected status: ${status}`;
        handlePaymentError(
          errorMsg + "Authorization completed with status: ${status}"
        );
        return { success: false, data: responseData };
      }
    } catch (error) {
      const errorMessage = error.message || "Authorization failed";
      handlePaymentError(errorMessage);
      return { success: false, data: error };
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCapture = async () => {
    if (!paymentState.captureTxid.trim()) {
      handlePaymentError("Transaction ID is required for capture");
      return { success: false, data: "Transaction ID is required for capture" };
    }
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
      const params = getCaptureParams(paymentState.paymentMethod, {
        txid: paymentState.captureTxid,
        amount: parseInt(paymentState.paymentAmount),
        currency: paymentState.captureCurrency || "EUR",
        captureMode: paymentState.captureMode,
        sequencenumber: parseInt(paymentState.captureSequenceNumber) || 1
      });

      const result = await capture(params);
      setPaymentResult(result);
      handlePaymentSuccess("Capture completed successfully");
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error.message || "Capture failed";
      handlePaymentError(errorMessage);
      return { success: false, data: error };
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRefund = async () => {
    if (!paymentState.refundTxid.trim()) {
      handlePaymentError("Transaction ID is required for refund");
      return { success: false, data: "Transaction ID is required for refund" };
    }
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
      const params = getRefundParams(paymentState.paymentMethod, {
        txid: paymentState.refundTxid,
        sequencenumber: parseInt(paymentState.refundSequenceNumber),
        amount: parseInt(paymentState.paymentAmount),
        currency: paymentState.refundCurrency || "EUR",
        reference: paymentState.refundReference || `REFUND-${Date.now()}`
      });

      const result = await refund(params);
      setPaymentResult(result);
      handlePaymentSuccess("Refund completed successfully");
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error.message || "Refund failed";
      handlePaymentError(errorMessage);
      return { success: false, data: error };
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return {
    paymentState,
    handleFieldChange,
    isProcessingPayment,
    paymentResult,
    paymentError,
    handlePreauthorization,
    handleAuthorization,
    handleCapture,
    handleRefund,
  };
};

export default usePaymentActions;

