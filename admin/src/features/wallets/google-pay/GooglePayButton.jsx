import * as React from "react";
import { Box, Flex, Typography } from "@strapi/design-system";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { isGooglePayLoaded, loadGooglePayScript } from "../../../utils/google-pay-script";
import {
  GOOGLE_PAY_GATEWAY,
  GOOGLE_PAY_BUTTON_NETWORKS,
  GOOGLE_PAY_BUTTON_AUTH_METHODS,
} from "../../../constants/google-pay";

const BASE_REQUEST = { apiVersion: 2, apiVersionMinor: 0 };
const SCRIPT_POLL_MS = 200;
const SCRIPT_LOADED_DELAY_MS = 500;
const SCRIPT_TIMEOUT_MS = 15000;
const CONTAINER_RETRY_MS = 100;
const BUTTON_RETRY_MS = 500;

const gatewayMerchantIdOf = (settings) => settings?.mid || settings?.portalid || "";

const buildPaymentMethods = (settings) => {
  const baseCardPaymentMethod = {
    type: "CARD",
    parameters: { allowedCardNetworks: GOOGLE_PAY_BUTTON_NETWORKS, allowedAuthMethods: GOOGLE_PAY_BUTTON_AUTH_METHODS },
  };
  return {
    baseCardPaymentMethod,
    cardPaymentMethod: {
      ...baseCardPaymentMethod,
      tokenizationSpecification: {
        type: "PAYMENT_GATEWAY",
        parameters: { gateway: GOOGLE_PAY_GATEWAY, gatewayMerchantId: gatewayMerchantIdOf(settings) },
      },
    },
  };
};

const buildPaymentDataRequest = (paymentMethods, settings, amount, currency) => ({
  ...BASE_REQUEST,
  allowedPaymentMethods: [paymentMethods.cardPaymentMethod],
  transactionInfo: {
    totalPriceStatus: "FINAL",
    totalPrice: (parseFloat(amount) / 100).toFixed(2),
    currencyCode: currency,
  },
  merchantInfo: {
    merchantId: gatewayMerchantIdOf(settings),
    merchantName: settings?.merchantName || "Demo Shop",
  },
});

/** Payone expects the Google Pay token as the Base64 of its JSON string. */
const encodeGooglePayToken = (rawToken) => {
  if (typeof rawToken !== "string") throw new Error("Invalid Google Pay token format: token is not a string");
  return btoa(unescape(encodeURIComponent(rawToken)));
};

/** Google Pay button for the admin test payment; calls `onTokenReceived(base64Token, paymentData)`. */
export const GooglePayButton = ({ amount, currency = "EUR", onTokenReceived, onError, settings }) => {
  const { t } = usePluginTranslations();
  const [isReady, setIsReady] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const buttonContainerRef = React.useRef(null);
  const paymentsClientRef = React.useRef(null);

  const fail = (error) => {
    setIsLoading(false);
    if (onError) onError(error);
  };

  const handleGooglePayClick = async (paymentDataRequest) => {
    try {
      if (!paymentsClientRef.current) throw new Error("Google Pay client not initialized");

      const paymentData = await paymentsClientRef.current.loadPaymentData(paymentDataRequest);
      const rawToken = paymentData.paymentMethodData?.tokenizationData?.token;
      if (!rawToken) throw new Error("Google Pay token is missing from payment data");

      if (onTokenReceived) onTokenReceived(encodeGooglePayToken(rawToken), paymentData);
    } catch (error) {
      if (onError) onError(error);
    }
  };

  const addGooglePayButton = (paymentMethods) => {
    if (!buttonContainerRef.current) {
      setTimeout(() => (buttonContainerRef.current ? addGooglePayButton(paymentMethods) : setIsLoading(false)), BUTTON_RETRY_MS);
      return;
    }
    if (!paymentsClientRef.current) {
      setIsLoading(false);
      return;
    }

    buttonContainerRef.current.innerHTML = "";
    const paymentDataRequest = buildPaymentDataRequest(paymentMethods, settings, amount, currency);

    try {
      const button = paymentsClientRef.current.createButton({
        onClick: () => handleGooglePayClick(paymentDataRequest),
        buttonColor: "black",
        buttonType: "pay",
        buttonSizeMode: "fill",
      });

      setIsLoading(false);
      if (!buttonContainerRef.current) return;
      buttonContainerRef.current.appendChild(button);
      setIsReady(true);
    } catch (error) {
      fail(error);
    }
  };

  const initializeGooglePay = () => {
    if (!settings || (!settings.mid && !settings.portalid)) {
      fail(new Error("Google Pay settings missing. Please configure mid or portalid in settings."));
      return;
    }
    if (!isGooglePayLoaded()) {
      fail(new Error("Google Pay API is not loaded. Please check browser console for CSP errors."));
      return;
    }

    try {
      paymentsClientRef.current = new window.google.payments.api.PaymentsClient({
        environment: settings?.mode === "live" ? "PRODUCTION" : "TEST",
      });
      const paymentMethods = buildPaymentMethods(settings);

      paymentsClientRef.current
        .isReadyToPay({ ...BASE_REQUEST, allowedPaymentMethods: [paymentMethods.baseCardPaymentMethod] })
        .then((response) => {
          if (!response.result) {
            fail(new Error("Google Pay is not available on this device"));
            return;
          }
          setIsReady(true);
          const tryAddButton = () =>
            buttonContainerRef.current ? addGooglePayButton(paymentMethods) : setTimeout(tryAddButton, CONTAINER_RETRY_MS);
          setTimeout(tryAddButton, CONTAINER_RETRY_MS);
        })
        .catch(fail);
    } catch (error) {
      fail(error);
    }
  };

  React.useEffect(() => {
    loadGooglePayScript();

    if (isGooglePayLoaded()) {
      initializeGooglePay();
      return undefined;
    }

    const handleScriptLoaded = () => setTimeout(() => isGooglePayLoaded() && initializeGooglePay(), SCRIPT_LOADED_DELAY_MS);
    const handleScriptError = () => fail(new Error("Failed to load Google Pay script. Please check CSP settings."));

    window.addEventListener("googlePayScriptLoaded", handleScriptLoaded);
    window.addEventListener("googlePayScriptError", handleScriptError);

    const checkInterval = setInterval(() => {
      if (!isGooglePayLoaded()) return;
      clearInterval(checkInterval);
      initializeGooglePay();
    }, SCRIPT_POLL_MS);

    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      if (!isGooglePayLoaded()) {
        fail(new Error("Google Pay API is not available. Please check if the script is loaded and CSP allows pay.google.com"));
      }
    }, SCRIPT_TIMEOUT_MS);

    return () => {
      window.removeEventListener("googlePayScriptLoaded", handleScriptLoaded);
      window.removeEventListener("googlePayScriptError", handleScriptError);
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [settings, amount, currency]);

  const renderStatus = () => {
    if (isLoading) {
      return (
        <Typography variant="pi" textColor="neutral600" style={{ textAlign: "left" }}>
          {t("googlePay.loading", "Loading Google Pay...")}
        </Typography>
      );
    }
    if (!isReady) {
      return (
        <Typography variant="pi" textColor="neutral600" style={{ textAlign: "left" }}>
          {t("googlePay.notAvailable", "Google Pay is not available")}
        </Typography>
      );
    }
    return (
      <>
        <Typography variant="sigma" textColor="neutral700" fontWeight="semiBold" style={{ textAlign: "left" }}>
          {t("googlePay.paymentTitle", "Google Pay Payment")}
        </Typography>
        <Typography variant="pi" textColor="neutral600" style={{ textAlign: "left" }}>
          {t("googlePay.paymentHint", "Click the button below to pay with Google Pay. The token will be automatically sent to Payone.")}
        </Typography>
      </>
    );
  };

  return (
    <Box width="100%">
      <Flex direction="column" gap={3} alignItems="stretch">
        {renderStatus()}
        <Box
          ref={buttonContainerRef}
          style={{ minHeight: "40px", width: "100%", maxWidth: "200px", display: "flex", justifyContent: "flex-start" }}
        />
      </Flex>
    </Box>
  );
};
