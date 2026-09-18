import * as React from "react";
import ApplePayButton from "apple-pay-button";
import { Box, Typography, Alert } from "@strapi/design-system";
import { getFetchClient } from "@strapi/strapi/admin";
import pluginId from "../../../pluginId";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";

const ApplePayBtn = ({
  amount,
  onTokenReceived,
  onError,
  settings,
  buttonStyle = "black",
  type = "pay",
}) => {
  const { t } = usePluginTranslations();
  const handleEventsForApplePay = (session, amountValue, currencyCode) => {
    session.onvalidatemerchant = async (event) => {
      try {
        const applePayConfig = settings?.applePayConfig || {};
        const requestCurrency =
          currencyCode || applePayConfig.currencyCode || "EUR";
        const requestCountryCode = applePayConfig.countryCode || "DE";

        const { post } = getFetchClient();
        const merchantSession = await post(
          `/${pluginId}/validate-apple-pay-merchant`,
          {
            domainName: settings?.domainName || window.location.hostname,
            displayName: settings?.displayName || "Store",
            currency: requestCurrency,
            countryCode: requestCountryCode,
            mode: (settings?.mode || "test").toLowerCase() || "test",
          }
        );
        if (merchantSession.error) {
          const errorMessage =
            merchantSession.error.message || "Merchant validation failed";
          const errorDetails = merchantSession.error.details || "";

          console.log(
            `[Apple Pay] Merchant validation failed: ${errorMessage} ${errorDetails}`
          );

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
        if (onError) {
          onError(error);
        }

        try {
          session.completeMerchantValidation({});
        } catch (completeError) {
          console.error(completeError);
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

        if (!tokenObject) {
          const result = {
            status: window.ApplePaySession.STATUS_FAILURE,
          };
          session.completePayment(result);
          if (onError) {
            onError(new Error("Payment token is missing"));
          }
          return;
        }

        if (!tokenObject.paymentData) {
          console.error(
            "[Apple Pay] Invalid token structure: missing paymentData",
            {
              tokenKeys: Object.keys(tokenObject),
              tokenStructure: JSON.stringify(tokenObject).substring(0, 500),
            }
          );
          const result = {
            status: window.ApplePaySession.STATUS_FAILURE,
          };
          session.completePayment(result);
          if (onError) {
            onError(
              new Error(
                "Invalid Apple Pay token structure: missing paymentData field"
              )
            );
          }
          return;
        }

        const paymentDataObj = tokenObject.paymentData;
        const header = paymentDataObj.header || {};

        console.log("[Apple Pay] Token structure validation:", {
          hasVersion: !!paymentDataObj.version,
          hasData: !!paymentDataObj.data,
          hasSignature: !!paymentDataObj.signature,
          hasHeader: !!paymentDataObj.header,
          hasEphemeralPublicKey: !!header.ephemeralPublicKey,
          hasPublicKeyHash: !!header.publicKeyHash,
          hasTransactionId:
            !!paymentDataObj.transactionId || !!header.transactionId,
          dataLength: paymentDataObj.data ? paymentDataObj.data.length : 0,
          signatureLength: paymentDataObj.signature
            ? paymentDataObj.signature.length
            : 0,
        });

        let tokenString;
        try {
          const tokenJson = JSON.stringify(tokenObject);
          tokenString = btoa(unescape(encodeURIComponent(tokenJson)));
          console.log("[Apple Pay] Token encoded successfully:", {
            tokenLength: tokenJson.length,
            encodedLength: tokenString.length,
          });
        } catch (e) {
          console.error("[Apple Pay] Error encoding token:", e);
          const result = {
            status: window.ApplePaySession.STATUS_FAILURE,
          };
          session.completePayment(result);
          if (onError) {
            onError(new Error(`Failed to encode token: ${e.message}`));
          }
          return;
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
        <Alert closeLabel="Close" title={t("applePayBtn.merchantIdMissingTitle", "Merchant ID Missing")} variant="warning">
          <Typography variant="pi" marginTop={2}>
            {t("applePayBtn.merchantIdMissing", "Merchant ID is not configured. Please set Merchant ID in plugin settings.")} {t("applePayBtn.merchantIdHint", "You can find your merchantIdentifier in PMI at: CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Payment type configuration tab.")}
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
          title={t("applePayBtn.liveModeOnly", "Apple Pay Only Works in Live Mode")}
          variant="danger"
        >
          <Typography variant="pi" marginTop={2}>
            {t("applePayBtn.liveModeMessage", "Apple Pay is only supported in live mode. According to Payone documentation, test mode support will be available at a later time.")}
          </Typography>
          <Typography variant="pi" style={{ marginLeft: "8px" }}>
            {t("applePayBtn.switchToLive", "Please switch to live mode in plugin settings to use Apple Pay.")}
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
        {t("applePayBtn.noLocalhost", "Apple Pay does NOT work on localhost. Use a production domain with HTTPS.")}
      </Typography>
    </Box>
  );
};

export default ApplePayBtn;
