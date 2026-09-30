import * as React from "react";
import { useNotification } from "@strapi/strapi/admin";
import { usePayoneApi } from "../../api/payone.api";
import { pluginId } from "../../pluginId";
import { REDIRECT_METHODS, TEST_CUSTOMER, THREE_DS_REQUIRED_CODES } from "../../constants/payment";
import { getLanguageForCountry, getCurrencyForCountry } from "../../utils/locale-options";
import {
  buildPaymentParams,
  buildCaptureParams,
  buildRefundParams,
  generateOrderReference,
  getValidCardExpiryDate,
} from "../../utils/payment-params";

const DEFAULT_ERROR_MESSAGE = "Payment failed. Please check the error message and try again.";

const PAYMENT_TYPES = {
  preauthorization: {
    referenceField: "preauthReference",
    narrativePrefix: "Preauthorization for order ",
    successMessage: "Preauthorization completed successfully",
    failureMessage: "Preauthorization failed",
    unexpectedStatusMessage: (errorMessage, status) =>
      `${errorMessage || `Unexpected status: ${status}`}Preauthorization completed with status: \${status}`,
  },
  authorization: {
    referenceField: "authReference",
    narrativePrefix: "Authorization for order ",
    successMessage: "Authorization completed successfully",
    failureMessage: "Authorization failed",
    unexpectedStatusMessage: (errorMessage, status) =>
      `${errorMessage}Unexpected status: ${status}Authorization completed with status: \${status}`,
  },
};

const createInitialPaymentState = () => ({
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

const SHIPPING_MIRRORS = {
  firstname: "shippingFirstname",
  lastname: "shippingLastname",
  street: "shippingStreet",
};

/** Admin 3-D Secure return URLs, under /content-ui when the plugin runs inside the content manager. */
const defaultRedirectUrl = (result) => {
  const { origin, pathname } = window.location;
  const basePath = pathname.includes("/content-ui") || pathname.includes("/content-manager") ? "/content-ui" : "/admin";
  return `${origin}${basePath}/plugins/${pluginId}/payment/${result}`;
};

const customerParams = (state) => ({
  firstname: state.firstname || TEST_CUSTOMER.firstname,
  lastname: state.lastname || TEST_CUSTOMER.lastname,
  email: state.email || TEST_CUSTOMER.email,
  street: state.street || TEST_CUSTOMER.street,
  zip: state.zip || TEST_CUSTOMER.zip,
  city: state.city || TEST_CUSTOMER.city,
  country: state.country || TEST_CUSTOMER.country,
  telephonenumber: state.telephonenumber || TEST_CUSTOMER.telephonenumber,
  salutation: state.salutation || TEST_CUSTOMER.salutation,
  gender: state.gender || TEST_CUSTOMER.gender,
  ip: state.ip || TEST_CUSTOMER.ip,
  language: state.language || TEST_CUSTOMER.language,
  customer_is_present: state.customerIsPresent || TEST_CUSTOMER.customer_is_present,
  shipping_firstname: state.shippingFirstname || state.firstname || TEST_CUSTOMER.firstname,
  shipping_lastname: state.shippingLastname || state.lastname || TEST_CUSTOMER.lastname,
  shipping_street: state.shippingStreet || state.street || TEST_CUSTOMER.street,
  shipping_zip: state.shippingZip || state.zip || TEST_CUSTOMER.zip,
  shipping_city: state.shippingCity || state.city || TEST_CUSTOMER.city,
  shipping_country: state.shippingCountry || state.country || TEST_CUSTOMER.country,
});

const buildRequestOptions = ({ type, state, settings, reference, tokenParam }) => {
  const config = PAYMENT_TYPES[type];
  const method = state.paymentMethod;
  const uses3DS = settings.enable3DSecure !== false;
  const isCard = method === "cc" && uses3DS;
  const fallbackCurrency = method === "cc" && state.cardtype === "A" ? "USD" : "EUR";

  const options = {
    amount: parseInt(state.paymentAmount),
    currency: state.currency || fallbackCurrency,
    reference,
    enable3DSecure: uses3DS,
    invoiceid: state.invoiceid || reference,
    narrative_text: state.narrativeText || config.narrativePrefix + reference,
    ...customerParams(state),
  };

  if (isCard) {
    if (state.cardtype) options.cardtype = state.cardtype;
    if (state.cardpan) options.cardpan = state.cardpan;
    options.cardexpiredate = getValidCardExpiryDate(state.cardexpiredate);
    if (state.cardcvc2) options.cardcvc2 = state.cardcvc2;
  }

  if (isCard || REDIRECT_METHODS.includes(method)) {
    options.successurl = state.successurl || defaultRedirectUrl("success");
    options.errorurl = state.errorurl || defaultRedirectUrl("error");
    options.backurl = state.backurl || defaultRedirectUrl("back");
  }

  const token = tokenParam || state.googlePayToken || state.applePayToken;
  if (method === "gpp" && token) Object.assign(options, { googlePayToken: token, settings });
  if (method === "apl" && token) Object.assign(options, { applePayToken: token, settings });

  return options;
};

/** State and handlers for the admin test payments (preauthorization, authorization, capture, refund). */
export const usePaymentActions = () => {
  const { toggleNotification } = useNotification();
  const api = usePayoneApi();
  const [settings, setSettings] = React.useState({ enable3DSecure: false });

  React.useEffect(() => {
    api
      .getSettings()
      .then((response) => {
        if (response?.data) setSettings(response.data);
      })
      .catch((error) => console.error("Error loading settings:", error));
  }, []);

  const [paymentState, setPaymentState] = React.useState(createInitialPaymentState());
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [paymentResult, setPaymentResult] = React.useState(null);
  const [paymentError, setPaymentError] = React.useState(null);

  const handleFieldChange = (field, value) => {
    setPaymentState((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "country" && value) {
        next.language = getLanguageForCountry(value);
        next.currency = getCurrencyForCountry(value);
        next.shippingCountry = value;
      }
      if (SHIPPING_MIRRORS[field] && value) next[SHIPPING_MIRRORS[field]] = value;
      return next;
    });
  };

  const handlePaymentError = (errorMessage) => {
    setPaymentError(errorMessage || DEFAULT_ERROR_MESSAGE);
    toggleNotification({ type: "danger", message: errorMessage || DEFAULT_ERROR_MESSAGE });
  };

  const handlePaymentSuccess = (message) => toggleNotification({ type: "success", message });

  const startRequest = () => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
  };

  const failWithResponse = (responseData, errorMessage, errorCode) => {
    handlePaymentError(`${errorMessage} Error code: ${errorCode || "Unknown"}`);
    setPaymentResult(responseData);
    return { success: false, data: responseData };
  };

  /** Handles the Payone response: error, 3-D Secure / wallet redirect, approval or unexpected status. */
  const handlePaymentResponse = (type, responseData) => {
    const status = responseData?.Status || null;
    const errorCode = responseData?.errorCode || null;
    const errorMessage = responseData?.errorMessage || null;
    const redirectUrl = responseData?.redirectUrl || null;
    const is3DSRequired = THREE_DS_REQUIRED_CODES.includes(errorCode);

    if (is3DSRequired && !redirectUrl) return failWithResponse(responseData, errorMessage, errorCode);
    if ((status === "ERROR" || status === "INVALID" || errorCode) && !is3DSRequired) {
      return failWithResponse(responseData, errorMessage, errorCode);
    }

    const needsRedirect = responseData.requires3DSRedirect || (status === "REDIRECT" && redirectUrl) || (is3DSRequired && redirectUrl);
    if (needsRedirect && redirectUrl) {
      window.location.href = redirectUrl;
      return undefined;
    }

    setPaymentResult(responseData);
    if (status === "APPROVED") {
      handlePaymentSuccess(PAYMENT_TYPES[type].successMessage);
      return { success: true, data: responseData };
    }

    handlePaymentError(PAYMENT_TYPES[type].unexpectedStatusMessage(errorMessage, status));
    return { success: false, data: responseData };
  };

  const runPayment = async (type, tokenParam) => {
    startRequest();
    try {
      const reference = generateOrderReference();
      handleFieldChange(PAYMENT_TYPES[type].referenceField, reference);

      const options = buildRequestOptions({ type, state: paymentState, settings, reference, tokenParam });
      const result = await api[type](buildPaymentParams(type, paymentState.paymentMethod, options));
      return handlePaymentResponse(type, result?.data || result);
    } catch (error) {
      handlePaymentError(error.message || PAYMENT_TYPES[type].failureMessage);
      return { success: false, data: error };
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const runFollowUp = async ({ txid, missingTxidMessage, buildParams, send, successMessage, failureMessage }) => {
    if (!txid.trim()) {
      handlePaymentError(missingTxidMessage);
      return { success: false, data: missingTxidMessage };
    }

    startRequest();
    try {
      const result = await send(buildParams());
      setPaymentResult(result);
      handlePaymentSuccess(successMessage);
      return { success: true, data: result };
    } catch (error) {
      handlePaymentError(error.message || failureMessage);
      return { success: false, data: error };
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCapture = () =>
    runFollowUp({
      txid: paymentState.captureTxid,
      missingTxidMessage: "Transaction ID is required for capture",
      buildParams: () =>
        buildCaptureParams(paymentState.paymentMethod, {
          txid: paymentState.captureTxid,
          amount: parseInt(paymentState.paymentAmount),
          currency: paymentState.captureCurrency || "EUR",
          captureMode: paymentState.captureMode,
          sequencenumber: parseInt(paymentState.captureSequenceNumber) || 1,
        }),
      send: api.capture,
      successMessage: "Capture completed successfully",
      failureMessage: "Capture failed",
    });

  const handleRefund = () =>
    runFollowUp({
      txid: paymentState.refundTxid,
      missingTxidMessage: "Transaction ID is required for refund",
      buildParams: () =>
        buildRefundParams({
          txid: paymentState.refundTxid,
          sequencenumber: parseInt(paymentState.refundSequenceNumber),
          amount: parseInt(paymentState.paymentAmount),
          currency: paymentState.refundCurrency || "EUR",
          reference: paymentState.refundReference || `REFUND-${Date.now()}`,
        }),
      send: api.refund,
      successMessage: "Refund completed successfully",
      failureMessage: "Refund failed",
    });

  return {
    paymentState,
    handleFieldChange,
    isProcessingPayment,
    paymentResult,
    paymentError,
    handlePreauthorization: (token = null) => runPayment("preauthorization", token),
    handleAuthorization: (token = null) => runPayment("authorization", token),
    handleCapture,
    handleRefund,
  };
};
