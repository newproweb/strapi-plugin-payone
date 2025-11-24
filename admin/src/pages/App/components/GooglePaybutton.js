import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Typography } from "@strapi/design-system";
import { injectGooglePayScript } from "../../utils/injectGooglePayScript";

const GooglePayButton = ({
  amount,
  currency = "EUR",
  onTokenReceived,
  onError,
  settings
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const buttonContainerRef = useRef(null);
  const paymentsClientRef = useRef(null);

  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
  };

  const getGooglePayConfig = (settings) => {
    const gatewayMerchantId = settings?.mid || settings?.portalid || '';

    const allowedCardNetworks = ["MASTERCARD", "VISA"];
    const allowedAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

    const tokenizationSpecification = {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        'gateway': 'payonegmbh',
        'gatewayMerchantId': gatewayMerchantId
      }
    };

    const baseCardPaymentMethod = {
      type: "CARD",
      parameters: {
        allowedCardNetworks,
        allowedAuthMethods
      }
    };

    const cardPaymentMethod = {
      ...baseCardPaymentMethod,
      tokenizationSpecification
    };
    return {
      baseCardPaymentMethod,
      cardPaymentMethod,
    };
  };

  useEffect(() => {
    injectGooglePayScript();

    const checkGooglePay = () => {
      try {
        return typeof window !== 'undefined' &&
          typeof window.google !== 'undefined' &&
          window.google.payments?.api?.PaymentsClient;
      } catch (e) {
        return false;
      }
    };

    if (checkGooglePay()) {
      initializeGooglePay();
      return;
    }

    const handleScriptLoaded = () => {
      setTimeout(() => {
        if (checkGooglePay()) {
          initializeGooglePay();
        }
      }, 500);
    };

    const handleScriptError = () => {
      setIsLoading(false);
      if (onError) {
        onError(new Error("Failed to load Google Pay script. Please check CSP settings."));
      }
    };

    window.addEventListener("googlePayScriptLoaded", handleScriptLoaded);
    window.addEventListener("googlePayScriptError", handleScriptError);

    const checkInterval = setInterval(() => {
      if (checkGooglePay()) {
        clearInterval(checkInterval);
        initializeGooglePay();
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      if (!checkGooglePay()) {
        setIsLoading(false);
        if (onError) {
          onError(new Error("Google Pay API is not available. Please check if the script is loaded and CSP allows pay.google.com"));
        }
      }
    }, 15000);

    return () => {
      window.removeEventListener("googlePayScriptLoaded", handleScriptLoaded);
      window.removeEventListener("googlePayScriptError", handleScriptError);
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [settings, amount, currency]);

  const initializeGooglePay = () => {
    if (!settings || (!settings.mid && !settings.portalid)) {
      setIsLoading(false);
      if (onError) {
        onError(new Error("Google Pay settings missing. Please configure mid or portalid in settings."));
      }
      return;
    }

    try {
      if (typeof window === 'undefined' || typeof window.google === 'undefined' || !window.google.payments?.api?.PaymentsClient) {
        setIsLoading(false);
        if (onError) {
          onError(new Error("Google Pay API is not loaded. Please check browser console for CSP errors."));
        }
        return;
      }


      const environment = settings?.mode === "live" ? "PRODUCTION" : "TEST";
      paymentsClientRef.current = new window.google.payments.api.PaymentsClient({
        environment: environment
      });

      const config = getGooglePayConfig(settings);

      const isReadyToPayRequest = Object.assign({}, baseRequest);
      isReadyToPayRequest.allowedPaymentMethods = [config.baseCardPaymentMethod];

      paymentsClientRef.current.isReadyToPay(isReadyToPayRequest)
        .then((response) => {
          if (response.result) {
            setIsReady(true);
            const tryAddButton = () => {
              if (buttonContainerRef.current) {
                addGooglePayButton(config);
              } else {
                setTimeout(tryAddButton, 100);
              }
            };
            setTimeout(tryAddButton, 100);
          } else {
            setIsLoading(false);
            if (onError) {
              onError(new Error("Google Pay is not available on this device"));
            }
          }
        })
        .catch((err) => {
          setIsLoading(false);
          if (onError) {
            onError(err);
          }
        });
    } catch (error) {
      setIsLoading(false);
      if (onError) {
        onError(error);
      }
    }
  };

  const addGooglePayButton = (config) => {
    if (!buttonContainerRef.current) {
      setTimeout(() => {
        if (buttonContainerRef.current) {
          addGooglePayButton(config);
        } else {
          setIsLoading(false);
        }
      }, 500);
      return;
    }

    if (!paymentsClientRef.current) {
      setIsLoading(false);
      return;
    }

    buttonContainerRef.current.innerHTML = "";

    const gatewayMerchantId = settings?.mid || settings?.portalid || '';
    const paymentDataRequest = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [config.cardPaymentMethod];
    paymentDataRequest.transactionInfo = {
      totalPriceStatus: "FINAL",
      totalPrice: (parseFloat(amount) / 100).toFixed(2),
      currencyCode: currency
    };
    paymentDataRequest.merchantInfo = {
      merchantId: gatewayMerchantId,
      merchantName: settings?.merchantName || 'Demo Shop'
    };

    try {
      const button = paymentsClientRef.current.createButton({
        onClick: () => handleGooglePayClick(paymentDataRequest),
        buttonColor: "black",
        buttonType: "pay",
        buttonSizeMode: "fill"
      });

      if (buttonContainerRef.current) {
        buttonContainerRef.current.appendChild(button);
        setIsLoading(false);
        setIsReady(true);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      if (onError) {
        onError(error);
      }
    }
  };

  const handleGooglePayClick = async (paymentDataRequest) => {
    try {
      if (!paymentsClientRef.current) {
        throw new Error("Google Pay client not initialized");
      }

      const paymentData = await paymentsClientRef.current.loadPaymentData(paymentDataRequest);
      const rawToken = paymentData.paymentMethodData?.tokenizationData?.token;

      if (!rawToken) {
        throw new Error("Google Pay token is missing from payment data");
      }

      let token = rawToken;

      try {
        const tokenObj = JSON.parse(token);
        if (!tokenObj.signature || !tokenObj.protocolVersion || !tokenObj.signedMessage) {
          throw new Error("Google Pay token is missing required fields");
        }
        token = btoa(unescape(encodeURIComponent(rawToken)));
      } catch (e) {
        if (typeof token === 'string') {
          token = btoa(unescape(encodeURIComponent(token)));
        } else {
          throw new Error(`Invalid Google Pay token format: ${e.message}`);
        }
      }

      if (onTokenReceived) {
        onTokenReceived(token, paymentData);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Box width="100%">
      <Flex direction="column" gap={3} alignItems="stretch">
        {isLoading && (
          <Typography variant="pi" textColor="neutral600" style={{ textAlign: "left" }}>
            Loading Google Pay...
          </Typography>
        )}
        {!isLoading && !isReady && (
          <Typography variant="pi" textColor="neutral600" style={{ textAlign: "left" }}>
            Google Pay is not available
          </Typography>
        )}
        {!isLoading && isReady && (
          <>
            <Typography variant="sigma" textColor="neutral700" fontWeight="semiBold" style={{ textAlign: "left" }}>
              Google Pay Payment
            </Typography>
            <Typography variant="pi" textColor="neutral600" style={{ textAlign: "left" }}>
              Click the button below to pay with Google Pay. The token will be automatically sent to Payone.
            </Typography>
          </>
        )}
        <Box ref={buttonContainerRef} style={{ minHeight: "40px", width: "100%", display: "flex", justifyContent: "flex-start" }} />
      </Flex>
    </Box>
  );
};

export default GooglePayButton;
