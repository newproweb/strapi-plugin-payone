import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Typography } from "@strapi/design-system";
import { DEFAULT_APPLE_PAY_CONFIG } from "../../utils/applePayConstants";

/**
 * Apple Pay Button Component using Payment Request API
 * Based on Apple Pay documentation:
 * https://developer.apple.com/documentation/applepayontheweb/creating-an-apple-pay-session
 * https://developer.apple.com/documentation/applepayontheweb/displaying-apple-pay-buttons-using-css
 * 
 * Supports Payment Request API (works in Chrome, Edge, Safari, etc.)
 * and falls back to Apple Pay JS API if needed
 */
const ApplePayButton = ({
  amount,
  currency = "EUR",
  countryCode = "DE",
  merchantCapabilities = ["supports3DS"],
  supportedNetworks = ["visa", "masterCard", "girocard"],
  buttonStyle = "black",
  buttonType = "pay",
  requestPayerName = false,
  requestBillingAddress = false,
  requestPayerEmail = false,
  requestPayerPhone = false,
  requestShipping = false,
  shippingType = "shipping",
  merchantIdentifier = null,
  onTokenReceived,
  onError,
  settings
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const buttonContainerRef = useRef(null);
  const paymentRequestRef = useRef(null);

  const checkApplePayAvailability = async () => {
    try {
      console.log("[Apple Pay] Checking availability...");

      // Check if we're on HTTPS (required for Apple Pay JS API)
      const isSecure = typeof window !== 'undefined' &&
        (window.location.protocol === 'https:' ||
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1');

      console.log("[Apple Pay] Secure context:", isSecure, "Protocol:", window.location?.protocol);

      // First, check if Payment Request API is available
      // Payment Request API works on HTTP too, but Apple Pay JS API requires HTTPS
      if (typeof window === 'undefined' || !window.PaymentRequest) {
        console.log("[Apple Pay] Payment Request API not available");

        // Fallback: Check Apple Pay JS API (for Safari, requires HTTPS)
        if (typeof window !== 'undefined' && window.ApplePaySession && isSecure) {
          try {
            const canMakePayments = ApplePaySession.canMakePayments();
            console.log("[Apple Pay] Apple Pay JS API available:", canMakePayments);
            return { available: canMakePayments, method: 'applePayJS' };
          } catch (error) {
            console.error("[Apple Pay] Apple Pay JS API error (likely insecure context):", error.message);
            return { available: false, method: null, error: 'insecure_context' };
          }
        }

        if (!isSecure && typeof window !== 'undefined' && window.ApplePaySession) {
          console.warn("[Apple Pay] Apple Pay JS API requires HTTPS. Using Payment Request API fallback.");
        }

        console.log("[Apple Pay] No Apple Pay support found");
        return { available: false, method: null };
      }

      console.log("[Apple Pay] Payment Request API available, checking Apple Pay support...");

      // Check if Apple Pay payment method is supported
      const applePayMethod = {
        supportedMethods: "https://apple.com/apple-pay",
        data: {
          version: 3,
          merchantIdentifier: merchantIdentifier || settings?.merchantIdentifier || settings?.mid || "merchant.com.payone.test",
          merchantCapabilities: merchantCapabilities,
          supportedNetworks: supportedNetworks,
          countryCode: countryCode
        }
      };

      // Create a test payment request
      // Payment Request API works on HTTP too, but Apple Pay may require HTTPS
      let testRequest;
      try {
        testRequest = new PaymentRequest(
          [applePayMethod],
          {
            total: {
              label: "Test",
              amount: { value: "0.01", currency: currency }
            }
          },
          {
            requestPayerName: false,
            requestBillingAddress: false,
            requestPayerEmail: false,
            requestPayerPhone: false,
            requestShipping: false
          }
        );
      } catch (e) {
        console.error("[Apple Pay] Error creating PaymentRequest:", e);
        // If PaymentRequest creation fails, it might be due to insecure context
        if (e.message && e.message.includes('insecure')) {
          return { available: false, method: null, error: 'insecure_context' };
        }
        return { available: false, method: null };
      }

      // Check if can make payment
      if (testRequest.canMakePayment) {
        try {
          const canPay = await testRequest.canMakePayment();
          console.log("[Apple Pay] canMakePayment result:", canPay);

          if (canPay) {
            return { available: true, method: 'paymentRequest' };
          }

          // If PaymentRequest says no, try Apple Pay JS API as fallback (only on HTTPS)
          if (typeof window !== 'undefined' && window.ApplePaySession && isSecure) {
            try {
              const canMakePaymentsJS = ApplePaySession.canMakePayments();
              console.log("[Apple Pay] Fallback to Apple Pay JS API:", canMakePaymentsJS);
              return { available: canMakePaymentsJS, method: 'applePayJS' };
            } catch (e) {
              console.error("[Apple Pay] Apple Pay JS API error:", e.message);
              // If it's insecure context error, Payment Request API might still work
              if (e.message && e.message.includes('insecure')) {
                // Payment Request API might work even on HTTP
                return { available: false, method: null, error: 'insecure_context' };
              }
            }
          }

          return { available: false, method: null };
        } catch (e) {
          console.error("[Apple Pay] Error checking canMakePayment:", e);

          // If it's insecure context error, we can't use Apple Pay JS API
          if (e.message && e.message.includes('insecure')) {
            console.warn("[Apple Pay] Insecure context detected. Apple Pay requires HTTPS.");
            return { available: false, method: null, error: 'insecure_context' };
          }

          // For other errors, try Apple Pay JS API as fallback (only on HTTPS)
          if (typeof window !== 'undefined' && window.ApplePaySession && isSecure) {
            try {
              const canMakePaymentsJS = ApplePaySession.canMakePayments();
              return { available: canMakePaymentsJS, method: 'applePayJS' };
            } catch (jsError) {
              console.error("[Apple Pay] Apple Pay JS API error:", jsError.message);
              return { available: false, method: null };
            }
          }

          return { available: false, method: null };
        }
      }

      // If canMakePayment is not available, assume it's available (for older browsers)
      // But only if we're in a secure context
      // Reuse isSecure from line 47

      if (isSecure) {
        console.log("[Apple Pay] canMakePayment not available, assuming support (secure context)");
        return { available: true, method: 'paymentRequest' };
      } else {
        console.warn("[Apple Pay] canMakePayment not available and insecure context");
        return { available: false, method: null, error: 'insecure_context' };
      }
    } catch (error) {
      console.error("[Apple Pay] Error checking availability:", error);

      // Check if it's insecure context error
      if (error.message && error.message.includes('insecure')) {
        console.warn("[Apple Pay] Insecure context - Apple Pay requires HTTPS");
        return { available: false, method: null, error: 'insecure_context' };
      }

      // Fallback: Try Apple Pay JS API (only on HTTPS)
      // Reuse isSecure from line 47

      if (typeof window !== 'undefined' && window.ApplePaySession && isSecure) {
        try {
          const canMakePayments = ApplePaySession.canMakePayments();
          return { available: canMakePayments, method: 'applePayJS' };
        } catch (e) {
          console.error("[Apple Pay] Apple Pay JS API error:", e.message);
          if (e.message && e.message.includes('insecure')) {
            return { available: false, method: null, error: 'insecure_context' };
          }
        }
      }

      return { available: false, method: null };
    }
  };

  useEffect(() => {
    const scriptUrl = "https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js";

    console.log("[Apple Pay] Loading Apple Pay SDK script...");

    if (document.querySelector(`script[src="${scriptUrl}"]`)) {
      console.log("[Apple Pay] Script already loaded");
      // Script already loaded, check if it's ready
      if (typeof window !== 'undefined' && window.ApplePaySession) {
        initializeButton();
      } else {
        // Wait a bit for script to initialize
        setTimeout(() => initializeButton(), 500);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.crossOrigin = "anonymous";
    script.async = true;

    script.onload = () => {
      console.log("[Apple Pay] SDK script loaded successfully");
      setTimeout(() => {
        initializeButton();
      }, 500);
    };

    script.onerror = (error) => {
      console.error("[Apple Pay] Failed to load SDK script:", error);
      setIsLoading(false);
      setIsAvailable(false);
      setErrorMessage("Failed to load Apple Pay SDK. Please check Content Security Policy settings.");

      // Even if script fails, try to use Payment Request API
      console.log("[Apple Pay] Trying Payment Request API as fallback...");
      setTimeout(() => {
        initializeButton();
      }, 1000);
    };

    try {
      document.head.appendChild(script);
      console.log("[Apple Pay] Script element added to head");
    } catch (error) {
      console.error("[Apple Pay] Error adding script to head:", error);
      // Try to use Payment Request API without SDK
      setTimeout(() => {
        initializeButton();
      }, 1000);
    }
  }, []);

  const initializeButton = async () => {
    try {
      console.log("[Apple Pay] Initializing button...");

      const isSecure = typeof window !== 'undefined' &&
        (window.location.protocol === 'https:' ||
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1');

      console.log("[Apple Pay] Secure context check:", {
        protocol: window.location?.protocol,
        hostname: window.location?.hostname,
        isSecure: isSecure
      });

      const isLocalhost = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1');

      if (!isSecure && !isLocalhost && window.location?.protocol === 'http:') {
        const errorMsg = "Apple Pay requires HTTPS. Please access this page via HTTPS (https://yourdomain.com) instead of HTTP. Localhost (http://localhost) is allowed for development.";
        setErrorMessage(errorMsg);
        setIsLoading(false);
        setIsAvailable(false);
        console.warn("[Apple Pay]", errorMsg);
        console.warn("[Apple Pay] Current URL:", window.location.href);
        return;
      }

      // Log context information
      console.log("[Apple Pay] Context info:", {
        protocol: window.location?.protocol,
        hostname: window.location?.hostname,
        isSecure: isSecure,
        isLocalhost: isLocalhost,
        fullUrl: window.location?.href
      });

      // Check availability
      const availability = await checkApplePayAvailability();
      console.log("[Apple Pay] Availability check result:", availability);

      setIsAvailable(availability.available);

      if (!availability.available) {
        let errorMsg = "Apple Pay is not available on this device or browser.";

        if (isLocalhost) {
          errorMsg = "Apple Pay is not available on localhost. Apple Pay requires a registered domain with HTTPS. " +
            "For testing, please use a production domain with HTTPS or test on a device with Safari (iOS/macOS). " +
            "You can still test the payment flow by using the 'Process Preauthorization' button without Apple Pay token.";
        } else if (availability.error === 'insecure_context') {
          errorMsg = "Apple Pay requires HTTPS. Please access this page via HTTPS (https://yourdomain.com) instead of HTTP.";
        } else if (typeof window !== 'undefined' && window.PaymentRequest) {
          errorMsg += " Payment Request API is available but Apple Pay is not supported. " +
            "Please use Safari on iOS, macOS, or iPadOS, or Chrome/Edge on supported devices. " +
            "Note: Apple Pay requires a registered domain and cannot work on localhost.";
        } else if (typeof window !== 'undefined' && window.ApplePaySession) {
          errorMsg += " Apple Pay JS API is available but cannot make payments. " +
            "Please check your device settings and ensure you have a card added to Wallet.";
        } else {
          errorMsg += " Please use Safari on iOS, macOS, or iPadOS, or a browser that supports Payment Request API (Chrome, Edge, Safari).";
        }

        setErrorMessage(errorMsg);
        setIsLoading(false);
        console.warn("[Apple Pay] Not available:", errorMsg);
        return;
      }

      console.log("[Apple Pay] Button initialized successfully, method:", availability.method);
      setIsReady(true);
      setIsLoading(false);
    } catch (error) {
      console.error("[Apple Pay] Initialization error:", error);
      setIsLoading(false);
      setIsAvailable(false);

      // Check for insecure context error
      if (error.message && error.message.includes('insecure')) {
        setErrorMessage("Apple Pay requires HTTPS. Please access this page via HTTPS (https://yourdomain.com) instead of HTTP. Localhost is allowed for development.");
      } else {
        setErrorMessage(error.message || "Failed to initialize Apple Pay");
      }

      if (onError) {
        onError(error);
      }
    }
  };

  const handleApplePayClick = async () => {
    console.log("[Apple Pay] Button clicked, checking readiness...", {
      isReady,
      isAvailable,
      amount,
      currency,
      countryCode,
      protocol: window.location?.protocol,
      hostname: window.location?.hostname
    });

    // Check HTTPS requirement
    const isSecure = typeof window !== 'undefined' &&
      (window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1');

    if (!isSecure && window.location?.protocol === 'http:') {
      const errorMsg = "Apple Pay requires HTTPS. Please access this page via HTTPS.";
      console.error("[Apple Pay]", errorMsg);
      if (onError) {
        onError(new Error(errorMsg));
      }
      return;
    }

    if (!isReady || !isAvailable) {
      console.error("[Apple Pay] Not ready or not available");
      if (onError) {
        onError(new Error("Apple Pay is not ready"));
      }
      return;
    }

    try {
      const amountValue = (parseFloat(amount) / 100).toFixed(2);
      const gatewayMerchantId = settings?.mid || settings?.portalid || '';
      const merchantId = merchantIdentifier || gatewayMerchantId || "merchant.com.payone.test";

      console.log("[Apple Pay] Starting payment request:", {
        amount: amountValue,
        currency,
        merchantId,
        countryCode,
        supportedNetworks,
        merchantCapabilities
      });

      // Define PaymentMethodData for Apple Pay
      const paymentMethodData = [{
        supportedMethods: "https://apple.com/apple-pay",
        data: {
          version: 3,
          merchantIdentifier: merchantId,
          merchantCapabilities: merchantCapabilities,
          supportedNetworks: supportedNetworks,
          countryCode: countryCode,
          currencyCode: currency
        }
      }];

      // Define PaymentDetails
      const paymentDetails = {
        total: {
          label: settings?.merchantName || "Demo Payment",
          amount: {
            value: amountValue,
            currency: currency
          }
        }
      };

      // Define PaymentOptions
      const paymentOptions = {
        requestPayerName: requestPayerName,
        requestBillingAddress: requestBillingAddress,
        requestPayerEmail: requestPayerEmail,
        requestPayerPhone: requestPayerPhone,
        requestShipping: requestShipping,
        shippingType: shippingType
      };

      // Create PaymentRequest
      const request = new PaymentRequest(paymentMethodData, paymentDetails, paymentOptions);

      // Handle merchant validation
      request.onmerchantvalidation = async (event) => {
        console.log("[Apple Pay] Merchant validation requested:", {
          validationURL: event.validationURL,
          domain: window.location.hostname
        });

        try {
          // Call backend to validate merchant with Payone
          const merchantSessionPromise = validateMerchantWithPayone(event.validationURL, {
            mid: gatewayMerchantId,
            portalid: settings?.portalid,
            domain: window.location.hostname,
            displayName: settings?.merchantName || "Test Store"
          });

          merchantSessionPromise.then(session => {
            console.log("[Apple Pay] Merchant session received:", {
              hasMerchantIdentifier: !!session.merchantIdentifier,
              domainName: session.domainName,
              displayName: session.displayName
            });
          }).catch(err => {
            console.error("[Apple Pay] Merchant session error:", err);
          });

          event.complete(merchantSessionPromise);
        } catch (error) {
          console.error("[Apple Pay] Merchant validation error:", error);
          if (onError) {
            onError(error);
          }
          // Complete with empty object - Payone will handle validation
          event.complete({});
        }
      };

      // Handle payment method change
      request.onpaymentmethodchange = (event) => {
        // Update payment details if needed based on payment method
        const paymentDetailsUpdate = {
          total: paymentDetails.total
        };
        event.updateWith(paymentDetailsUpdate);
      };

      // Handle shipping option change
      request.onshippingoptionchange = (event) => {
        const paymentDetailsUpdate = {
          total: paymentDetails.total
        };
        event.updateWith(paymentDetailsUpdate);
      };

      // Handle shipping address change
      request.onshippingaddresschange = (event) => {
        const paymentDetailsUpdate = {};
        event.updateWith(paymentDetailsUpdate);
      };

      // Show payment sheet and get response
      console.log("[Apple Pay] Showing payment sheet...");
      let response;
      try {
        response = await request.show();
      } catch (error) {
        console.error("[Apple Pay] Error showing payment sheet:", error);
        if (onError) {
          onError(error);
        }
        return;
      }

      console.log("[Apple Pay] Payment response received:", {
        hasDetails: !!response.details,
        payerName: response.payerName,
        shippingAddress: !!response.shippingAddress
      });

      // Extract payment token
      const paymentToken = response.details?.paymentToken || response.details?.token;

      if (!paymentToken) {
        console.error("[Apple Pay] Payment token is missing from response");
        try {
          await response.complete("fail");
        } catch (completeError) {
          console.error("[Apple Pay] Error completing payment with fail:", completeError);
        }
        if (onError) {
          onError(new Error("Apple Pay token is missing"));
        }
        return;
      }

      console.log("[Apple Pay] Payment token received:", {
        hasToken: !!paymentToken,
        tokenType: typeof paymentToken
      });

      // Convert token to base64 string for Payone
      let tokenString;
      try {
        if (typeof paymentToken === 'string') {
          tokenString = paymentToken;
        } else {
          tokenString = JSON.stringify(paymentToken);
        }
        // Base64 encode for Payone
        tokenString = btoa(unescape(encodeURIComponent(tokenString)));
      } catch (e) {
        console.error("Token encoding error:", e);
        tokenString = btoa(unescape(encodeURIComponent(JSON.stringify(paymentToken))));
      }

      // Call the callback with the token BEFORE completing payment
      // This ensures the token is processed before the dialog closes
      console.log("[Apple Pay] Sending token to callback");
      let callbackSuccess = true;
      if (onTokenReceived) {
        try {
          // If callback is async, wait for it
          const callbackResult = onTokenReceived(tokenString, {
            paymentToken: paymentToken,
            billingContact: response.payerName || response.details?.billingContact,
            shippingContact: response.shippingAddress || response.details?.shippingAddress,
            shippingOption: response.shippingOption || response.details?.shippingOption
          });
          
          // If callback returns a promise, wait for it
          if (callbackResult && typeof callbackResult.then === 'function') {
            await callbackResult;
          }
        } catch (callbackError) {
          console.error("[Apple Pay] Error in token callback:", callbackError);
          callbackSuccess = false;
        }
      }

      // Complete payment with success or fail based on callback result
      console.log("[Apple Pay] Completing payment with status:", callbackSuccess ? "success" : "fail");
      try {
        await response.complete(callbackSuccess ? "success" : "fail");
        console.log("[Apple Pay] Payment completed successfully");
      } catch (completeError) {
        console.error("[Apple Pay] Error completing payment:", completeError);
        if (onError) {
          onError(completeError);
        }
      }

    } catch (error) {
      console.error("[Apple Pay] Payment error:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      if (onError) {
        onError(error);
      }
    }
  };

  // Validate merchant with Payone
  const validateMerchantWithPayone = async (validationURL, config) => {
    console.log("[Apple Pay] Validating merchant with Payone:", {
      validationURL,
      config: {
        mid: config.mid,
        portalid: config.portalid,
        domain: config.domain,
        displayName: config.displayName
      }
    });

    try {
      // Call Strapi backend to validate with Payone
      const response = await fetch('/api/strapi-plugin-payone-provider/validate-apple-pay-merchant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validationURL,
          ...config
        })
      });

      console.log("[Apple Pay] Validation response status:", response.status);

      if (response.ok) {
        const merchantSession = await response.json();
        console.log("[Apple Pay] Merchant session received from backend:", {
          hasData: !!merchantSession.data,
          merchantIdentifier: merchantSession.data?.merchantIdentifier
        });
        return merchantSession.data || merchantSession;
      } else {
        // If validation fails, return empty object - Payone will handle it
        const errorText = await response.text();
        console.warn("[Apple Pay] Merchant validation failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return {};
      }
    } catch (error) {
      console.error("[Apple Pay] Merchant validation error:", {
        message: error.message,
        stack: error.stack
      });
      // Return empty object - Payone will handle validation
      return {};
    }
  };

  return (
    <Box width="100%">
      <Flex direction="column" gap={3} alignItems="stretch">
        {isLoading && (
          <Typography variant="pi" textColor="neutral600" style={{ textAlign: "left" }}>
            Checking Apple Pay availability...
          </Typography>
        )}
        {!isLoading && !isAvailable && (
          <Box style={{ width: "100%", display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "8px" }}>
            {errorMessage && (
              <Typography variant="sigma" textColor="neutral500" style={{ textAlign: "left", fontSize: "12px" }}>
                {errorMessage}
              </Typography>
            )}
          </Box>
        )}
        {!isLoading && isAvailable && (
          <>
            <Typography variant="sigma" textColor="neutral700" fontWeight="semiBold" style={{ textAlign: "left" }}>
              Apple Pay Payment
            </Typography>
            <Typography variant="pi" textColor="neutral600" style={{ textAlign: "left" }}>
              Click the button below to pay with Apple Pay. The token will be automatically sent to Payone.
            </Typography>
            <Box ref={buttonContainerRef} style={{ minHeight: "40px", width: "100%", display: "flex", justifyContent: "flex-start" }}>
              {typeof window !== 'undefined' && window.customElements && window.customElements.get('apple-pay-button') ? (
                <apple-pay-button
                  buttonstyle={buttonStyle}
                  type={buttonType}
                  locale="en-US"
                  onClick={handleApplePayClick}
                  style={{
                    width: "200px",
                    height: "40px",
                    cursor: isReady ? "pointer" : "not-allowed",
                    opacity: isReady ? 1 : 0.5
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={handleApplePayClick}
                  disabled={!isReady}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "-apple-pay-button",
                    ApplePayButtonType: buttonType,
                    ApplePayButtonStyle: buttonStyle,
                    height: "40px",
                    width: "200px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isReady ? "pointer" : "not-allowed",
                    opacity: isReady ? 1 : 0.5,
                    backgroundColor: buttonStyle === "black" ? "#000" : buttonStyle === "white" ? "#fff" : "transparent",
                    color: buttonStyle === "black" ? "#fff" : "#000",
                    borderWidth: buttonStyle === "white-outline" ? "1px" : "0",
                    borderStyle: buttonStyle === "white-outline" ? "solid" : "none",
                    borderColor: buttonStyle === "white-outline" ? "#000" : "transparent",
                    fontSize: "16px",
                    fontWeight: "400",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  className="apple-pay-button-custom"
                >
                  {buttonType === "pay" ? "Pay" : buttonType === "buy" ? "Buy" : buttonType === "donate" ? "Donate" : "Pay with Apple Pay"}
                </button>
              )}
            </Box>
          </>
        )}
      </Flex>
    </Box>
  );
};

export default ApplePayButton;
