import React from "react";
import ApplePayButton from "apple-pay-button";
import { Box, Typography, Alert } from "@strapi/design-system";
import { request } from "@strapi/helper-plugin";
import pluginId from "../../../pluginId";

const ApplePayBtn = ({
  amount,
  onTokenReceived,
  onError,
  settings,
  buttonStyle = "black",
  type = "pay",
}) => {
  const handleEventsForApplePay = (session, amountValue, currencyCode) => {
    session.onvalidatemerchant = async (event) => {
      try {
        const applePayConfig = settings?.applePayConfig || {};
        const requestCurrency =
          currencyCode || applePayConfig.currencyCode || "EUR";
        const requestCountryCode = applePayConfig.countryCode || "DE";

        const merchantSession = await request(
          `/${pluginId}/validate-apple-pay-merchant`,
          {
            method: "POST",
            body: {
              domain: window.location.hostname,
              domainName: window.location.hostname,
              displayName: settings?.merchantName || "Store",
              currency: requestCurrency,
              countryCode: requestCountryCode,
            },
          }
        );

        if (merchantSession.error) {
          const errorMessage =
            merchantSession.error.message || "Merchant validation failed";
          const errorDetails = merchantSession.error.details || "";

          // If it's a 403 error, provide more specific guidance
          if (merchantSession.error.status === 403) {
            throw new Error(
              `403 Forbidden: Authentication failed with Payone. ` +
                `Please check your Payone credentials (aid, portalid, mid, key) in plugin settings. ` +
                `Also ensure that: 1) Mode is set to "live" (Apple Pay only works in live mode), ` +
                `2) Your domain is registered with Payone Merchant Services, ` +
                `3) Merchant ID (mid) matches your merchantIdentifier in PMI. ` +
                `Details: ${errorDetails || errorMessage}`
            );
          }

          throw new Error(
            errorMessage + (errorDetails ? ` - ${errorDetails}` : "")
          );
        }

        const sessionData = merchantSession.data || merchantSession;

        if (!sessionData || !sessionData.merchantIdentifier) {
          throw new Error(
            "Invalid merchant session: missing merchantIdentifier. " +
              "Please check your Payone Apple Pay configuration in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Payment type configuration tab)."
          );
        }

        session.completeMerchantValidation(sessionData);
      } catch (error) {

        // Don't call completeMerchantValidation with empty object - this causes user cancellation
        // Instead, let the error propagate so user can see what went wrong
        if (onError) {
          onError(error);
        }

        // Complete with failure status to show error to user
        try {
          session.completeMerchantValidation({});
        } catch (completeError) {
          // Silent fail
        }
      }
    };

    session.onpaymentmethodselected = (event) => {
      const update = {
        newTotal: {
          label: settings?.merchantName || "Total",
          type: "final",
          amount: amountValue,
        },
      };
      session.completePaymentMethodSelection(update);
    };

    session.onshippingmethodselected = (event) => {
      const update = {
        newTotal: {
          label: settings?.merchantName || "Total",
          type: "final",
          amount: amountValue,
        },
      };
      session.completeShippingMethodSelection(update);
    };

    session.onshippingcontactselected = (event) => {
      const update = {
        newTotal: {
          label: settings?.merchantName || "Total",
          type: "final",
          amount: amountValue,
        },
      };
      session.completeShippingContactSelection(update);
    };

    session.onpaymentauthorized = async (event) => {
      try {
        const paymentData = event.payment;

        if (!paymentData || !paymentData.token) {
          const result = {
            status: window.ApplePaySession.STATUS_FAILURE,
          };
          session.completePayment(result);
          if (onError) {
            onError(new Error("Payment token is missing"));
          }
          return;
        }

        const tokenObject = paymentData.token;

        if (!tokenObject.paymentData) {
          const result = {
            status: window.ApplePaySession.STATUS_FAILURE,
          };
          session.completePayment(result);
          if (onError) {
            onError(new Error("Invalid Apple Pay token structure"));
          }
          return;
        }

        // Encode token as Base64 for transmission
        let tokenString;
        try {
          tokenString = btoa(
            unescape(encodeURIComponent(JSON.stringify(tokenObject)))
          );
        } catch (e) {
          tokenString = btoa(
            unescape(encodeURIComponent(JSON.stringify(tokenObject)))
          );
        }

        if (onTokenReceived) {
          const result = await onTokenReceived(tokenString, {
            paymentToken: tokenObject,
            billingContact: paymentData.billingContact,
            shippingContact: paymentData.shippingContact,
            amount: amountValue, //
            currency: currencyCode,
          });

          if (result && typeof result.then === "function") {
            await result;
          }

          const paymentResult = {
            status: window.ApplePaySession.STATUS_SUCCESS,
          };
          session.completePayment(paymentResult);
        } else {
          const paymentResult = {
            status: window.ApplePaySession.STATUS_SUCCESS,
          };
          session.completePayment(paymentResult);
        }
      } catch (error) {
        const result = {
          status: window.ApplePaySession.STATUS_FAILURE,
        };
        session.completePayment(result);
        if (onError) {
          onError(error);
        }
      }
    };

    session.oncancel = (event) => {
      // Session cancelled by user
    };
  };

  const handleApplePayClick = () => {
    if (!settings?.mid) {
      const error = new Error(
        "Merchant ID is not configured. Please set Merchant ID in plugin settings."
      );
      if (onError) {
        onError(error);
      }
      return;
    }

    if (typeof window === "undefined" || !window.ApplePaySession) {
      if (onError) {
        onError(new Error("Apple Pay is not supported in this environment."));
      }
      return;
    }

    const amountValue = amount ? (parseFloat(amount) / 100).toFixed(2) : "0.00";
    const applePayConfig = settings?.applePayConfig || {};
    const supportedNetworks = applePayConfig.supportedNetworks || [
      "visa",
      "masterCard",
      "amex",
    ];
    const merchantCapabilities = applePayConfig.merchantCapabilities || [
      "supports3DS",
    ];
    const currencyCode = applePayConfig.currencyCode || "EUR";
    const countryCode = applePayConfig.countryCode || "DE";

    const applePayRequest = {
      countryCode: countryCode,
      currencyCode: currencyCode,
      merchantCapabilities: merchantCapabilities,
      supportedNetworks: supportedNetworks,
      total: {
        label: settings?.merchantName || "Total",
        type: "final",
        amount: amountValue,
      },
    };

    const session = new window.ApplePaySession(3, applePayRequest);

    handleEventsForApplePay(session, amountValue, currencyCode);

    session.begin();
  };

  const mode = (settings?.mode || "test").toLowerCase();
  const isLiveMode = mode === "live";

  if (!settings?.mid) {
    return (
      <Box>
        <Alert closeLabel="Close" title="Merchant ID Missing" variant="warning">
          <Typography variant="pi" marginTop={2}>
            Merchant ID is not configured. Please set Merchant ID in plugin
            settings. You can find your merchantIdentifier in PMI at:
            CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Payment type
            configuration tab.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!isLiveMode) {
    return (
      <Box>
        <Alert
          closeLabel="Close"
          title=" Apple Pay Only Works in Live Mode"
          variant="danger"
        >
          <Typography variant="pi" marginTop={2}>
            <strong>Apple Pay is only supported in live mode.</strong> According
            to Payone documentation, test mode support will be available at a
            later time.
          </Typography>
          <Typography variant="pi" style={{ marginLeft: "8px" }}>
            Please switch to <strong>live mode</strong> in plugin settings to
            use Apple Pay.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const buttonStyleMap = {
    black: "black",
    white: "white",
    "white-outline": "white-outline",
  };

  const buttonTypeMap = {
    pay: "plain",
    buy: "buy",
    donate: "donate",
    "check-out": "check-out",
    book: "book",
    subscribe: "subscribe",
  };

  const nativeButtonStyle = buttonStyleMap[buttonStyle] || "black";
  const nativeButtonType = buttonTypeMap[type] || "plain";

  return (
    <Box style={{ minHeight: "40px", width: "100%" }}>
      <ApplePayButton
        onClick={handleApplePayClick}
        buttonStyle={nativeButtonStyle}
        type={nativeButtonType}
        style={{ width: "220px", height: "40px" }}
      />
      <br /> <br />
      <Typography
        variant="pi"
        textColor="neutral600"
        style={{ fontSize: "12px", marginTop: "8px", marginRight: "6px" }}
      >
        Apple Pay does NOT work on localhost. Use a production domain with
        HTTPS.
      </Typography>
    </Box>
  );
};

export default ApplePayBtn;
