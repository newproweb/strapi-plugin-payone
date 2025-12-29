import React, { useEffect, useRef, useState } from "react";
import { Box, Flex, Typography } from "@strapi/design-system";
import { request } from "@strapi/helper-plugin";
import pluginId from "../../../pluginId";
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
      
      // Check secure context using browser's native property
      // This is the most reliable way to check if we're in a secure context
      const isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
      const protocol = typeof window !== 'undefined' ? window.location.protocol : '';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

      // For Apple Pay, we need a secure context (HTTPS or localhost)
      // window.isSecureContext is true for:
      // - HTTPS pages
      // - localhost (even on HTTP)
      // - 127.0.0.1 (even on HTTP)
      // - file:// URLs
      const isSecure = isSecureContext || isLocalhost;
      
      console.log("[Apple Pay] Secure context check:", {
        isSecureContext: isSecureContext,
        protocol: protocol,
        hostname: hostname,
        isLocalhost: isLocalhost,
        isSecure: isSecure,
        fullUrl: typeof window !== 'undefined' ? window.location.href : ''
      });

      // If not secure, log detailed information
      if (!isSecure) {
        console.error("[Apple Pay] NOT in secure context!", {
          isSecureContext: isSecureContext,
          protocol: protocol,
          hostname: hostname,
          isLocalhost: isLocalhost,
          fullUrl: typeof window !== 'undefined' ? window.location.href : '',
          reason: !isSecureContext ? "window.isSecureContext is false" : "Unknown"
        });
      }
      
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

      // If canMakePayment is not available, check secure context again
      // Re-check secure context to ensure we have the latest state
      const isSecureContextFinal = typeof window !== 'undefined' && window.isSecureContext;
      const hostnameFinal = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhostFinal = hostnameFinal === 'localhost' || hostnameFinal === '127.0.0.1';
      const isSecureFinal = isSecureContextFinal || isLocalhostFinal;
      
      if (isSecureFinal) {
        console.log("[Apple Pay] canMakePayment not available, assuming support (secure context)");
        return { available: true, method: 'paymentRequest' };
      } else {
        console.warn("[Apple Pay] canMakePayment not available and insecure context");
        console.warn("[Apple Pay] Context details:", {
          isSecureContext: isSecureContextFinal,
          hostname: hostnameFinal,
          isLocalhost: isLocalhostFinal
        });
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
      // Re-check secure context
      const isSecureContextFallback = typeof window !== 'undefined' && window.isSecureContext;
      const hostnameFallback = typeof window !== 'undefined' ? window.location.hostname : '';
      const isLocalhostFallback = hostnameFallback === 'localhost' || hostnameFallback === '127.0.0.1';
      const isSecureFallback = isSecureContextFallback || isLocalhostFallback;
      
      if (typeof window !== 'undefined' && window.ApplePaySession && isSecureFallback) {
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
              merchantIdentifier: session.merchantIdentifier,
              domainName: session.domainName,
              displayName: session.displayName,
              epochTimestamp: session.epochTimestamp,
              expiresAt: session.expiresAt,
              fullSession: session
            });
            
            // Validate merchant session
            if (!session || (!session.merchantIdentifier && !session.merchantSessionIdentifier)) {
              console.error("[Apple Pay] Invalid merchant session - missing merchantIdentifier");
              console.error("[Apple Pay] Session object:", JSON.stringify(session, null, 2));
              throw new Error("Invalid merchant session: missing merchantIdentifier");
            }
          }).catch(err => {
            console.error("[Apple Pay] Merchant session error:", err);
            // Re-throw so Payment Request API knows validation failed
            throw err;
          });

          // Complete with the merchant session promise
          // If the promise rejects, Payment Request API will close the dialog
          // This is expected behavior - we cannot proceed without a valid merchant session
          event.complete(merchantSessionPromise);
        } catch (error) {
          console.error("[Apple Pay] Merchant validation error:", {
            message: error.message,
            stack: error.stack,
            response: error.response
          });
          
          // Call onError to notify the user
          if (typeof onError === 'function') {
            onError(new Error(`Apple Pay merchant validation failed: ${error.message}. Please check your Payone Apple Pay configuration in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Apple Pay).`));
          }
          
          // Complete with a rejected promise
          // This will cause Apple Pay to close the dialog, which is expected behavior
          // We cannot proceed without a valid merchant session from Payone
          event.complete(Promise.reject(error));
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
        console.log("[Apple Pay] Payment sheet shown successfully");
      } catch (error) {
        console.error("[Apple Pay] Error showing payment sheet:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        // Check if error is due to cancellation (user cancelled)
        // Payment Request API throws "AbortError" when user cancels
        if (error.name === 'AbortError' || 
            (error.message && (
              error.message.includes('Cancelled') || 
              error.message.includes('cancel') ||
              error.message.includes('abort')
            ))) {
          console.log("[Apple Pay] User cancelled the payment");
          // Don't call onError for user cancellation
          return;
        }
        
        // If it's a merchant validation error, log it specifically
        if (error.message && (
          error.message.includes('merchant') ||
          error.message.includes('validation') ||
          error.message.includes('identifier')
        )) {
          console.error("[Apple Pay] Merchant validation failed - this may cause the dialog to close");
          if (typeof onError === 'function') {
            onError(new Error("Merchant validation failed. Please check your Apple Pay configuration and merchant identifier in Payone settings."));
          }
        } else {
          // For other errors, call onError
          if (typeof onError === 'function') {
            onError(error);
          }
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
      // This ensures the token is saved before the dialog closes
      console.log("[Apple Pay] Sending token to callback");
      let callbackSuccess = true;
      let callbackError = null;

      if (onTokenReceived) {
        try {
          // Call the callback to save the token
          // The callback should set the token in state and return success immediately
          // It should NOT process the payment yet - that will happen when user clicks the button
          const callbackResult = onTokenReceived(tokenString, {
          paymentToken: paymentToken,
          billingContact: response.payerName || response.details?.billingContact,
          shippingContact: response.shippingAddress || response.details?.shippingAddress,
          shippingOption: response.shippingOption || response.details?.shippingOption
        });

          // If callback returns a promise, wait for it to resolve or reject
          if (callbackResult && typeof callbackResult.then === 'function') {
            try {
              const result = await callbackResult;
              console.log("[Apple Pay] Token callback completed successfully:", result);
              // Check if result indicates success
              if (result && result.success === false) {
                callbackSuccess = false;
                callbackError = new Error(result.message || "Token callback returned failure");
              }
            } catch (error) {
              console.error("[Apple Pay] Token callback promise rejected:", error);
              callbackSuccess = false;
              callbackError = error;
            }
          } else if (callbackResult === false) {
            // If callback explicitly returns false, treat as failure
            callbackSuccess = false;
            console.warn("[Apple Pay] Token callback returned false");
          } else {
            // If callback returns a value (not a promise), assume success
            console.log("[Apple Pay] Token callback returned synchronously");
          }
        } catch (error) {
          console.error("[Apple Pay] Error in token callback:", error);
          callbackSuccess = false;
          callbackError = error;
        }
      } else {
        console.warn("[Apple Pay] No onTokenReceived callback provided");
        // If no callback, we should still complete the payment
        // But mark as success since we can't determine the result
        callbackSuccess = true;
      }

      // Complete payment with success or fail based on callback result
      // IMPORTANT: Only call complete() after the callback has fully finished
      console.log("[Apple Pay] Completing payment with status:", callbackSuccess ? "success" : "fail");

      try {
        // Use a small delay to ensure state updates are complete
        // This prevents the dialog from closing before the token is saved
        await new Promise(resolve => setTimeout(resolve, 200));

        const completionStatus = callbackSuccess ? "success" : "fail";
        await response.complete(completionStatus);
        console.log("[Apple Pay] Payment completed with status:", completionStatus);

        // If there was an error, notify the error handler
        if (!callbackSuccess && callbackError && onError) {
          onError(callbackError);
        }
      } catch (completeError) {
        console.error("[Apple Pay] Error completing payment:", completeError);
        // Try to complete with fail status if there's an error
        try {
          await response.complete("fail");
        } catch (finalError) {
          console.error("[Apple Pay] Failed to complete payment even with fail status:", finalError);
        }
        // Only call onError if it's defined
        if (typeof onError === 'function') {
          onError(completeError);
        }
      }

    } catch (error) {
      console.error("[Apple Pay] Payment error:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Check if error is due to cancellation (user cancelled)
      if (error.message && error.message.includes('Cancelled')) {
        console.log("[Apple Pay] User cancelled the payment");
        // Don't call onError for user cancellation
        return;
      }
      // Only call onError if it's defined and it's not a cancellation
      if (typeof onError === 'function') {
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
      console.log("[Apple Pay] Making validation request using Strapi helper...");

      // Use Strapi helper-plugin's request function which automatically handles authentication
      // This uses the admin API route which requires admin authentication
      const merchantSession = await request(`/${pluginId}/validate-apple-pay-merchant`, {
        method: 'POST',
        body: {
          validationURL,
          ...config
        }
      });

        console.log("[Apple Pay] Merchant session received from backend:", {
          hasData: !!merchantSession.data,
          merchantIdentifier: merchantSession.data?.merchantIdentifier,
          hasError: !!merchantSession.error,
          errorMessage: merchantSession.error?.message,
          fullResponse: merchantSession
        });

        // Check if there's an error in the response
        if (merchantSession.error) {
          console.error("[Apple Pay] Backend returned error:", merchantSession.error);
          throw new Error(merchantSession.error.message || "Apple Pay merchant validation failed");
        }

        // Validate merchant session
        const session = merchantSession.data || merchantSession;
        if (!session || !session.merchantIdentifier) {
          console.error("[Apple Pay] Invalid merchant session - missing merchantIdentifier");
          console.error("[Apple Pay] Session object:", JSON.stringify(session, null, 2));
          throw new Error("Invalid merchant session: missing merchantIdentifier. Please check your Payone Apple Pay configuration in PMI.");
        }

        return session;
    } catch (error) {
      console.error("[Apple Pay] Merchant validation error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        stack: error.stack
      });

      // Log specific error details
      if (error.response?.status === 403) {
        console.error("[Apple Pay] 403 Forbidden - Authentication failed. Make sure you are logged in as admin.");
      } else if (error.response?.status === 401) {
        console.error("[Apple Pay] 401 Unauthorized - Please log in again.");
      } else if (error.response?.status >= 500) {
        console.error("[Apple Pay] Server error - Check server logs for details.");
      }

      // If validation fails, we cannot proceed
      // Apple Pay requires a valid merchant session from Payone
      console.error("[Apple Pay] Merchant validation failed - cannot proceed without valid session");
      throw error;
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
