import ApplePayButtonElement from "apple-pay-button";
import { Alert, Box, Typography } from "@strapi/design-system";
import { getFetchClient } from "@strapi/strapi/admin";
import { pluginId } from "../../../pluginId";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { NATIVE_BUTTON_STYLES, NATIVE_BUTTON_TYPES } from "../../../constants/apple-pay";

const APPLE_PAY_VERSION = 3;
const DEFAULT_NETWORKS = ["visa", "masterCard", "amex"];
const DEFAULT_CAPABILITIES = ["supports3DS"];
const PMI_HINT =
  "Please check your Payone Apple Pay configuration in PMI (CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Payment type configuration tab).";

const encodeToken = (tokenObject) => btoa(unescape(encodeURIComponent(JSON.stringify(tokenObject))));

const logTokenStructure = (paymentData) => {
  const header = paymentData.header || {};
  console.log("[Apple Pay] Token structure validation:", {
    hasVersion: !!paymentData.version,
    hasData: !!paymentData.data,
    hasSignature: !!paymentData.signature,
    hasHeader: !!paymentData.header,
    hasEphemeralPublicKey: !!header.ephemeralPublicKey,
    hasPublicKeyHash: !!header.publicKeyHash,
    hasTransactionId: !!paymentData.transactionId || !!header.transactionId,
    dataLength: paymentData.data ? paymentData.data.length : 0,
    signatureLength: paymentData.signature ? paymentData.signature.length : 0,
  });
};

/** Apple Pay button for the admin test payment: validates the merchant via the plugin and hands the token on. */
export const ApplePayButton = ({ amount, onTokenReceived, onError, settings, buttonStyle = "black", type = "pay" }) => {
  const { t } = usePluginTranslations();
  const applePayConfig = settings?.applePayConfig || {};
  const isLiveMode = (settings?.mode || "test").toLowerCase() === "live";

  const reportError = (error) => onError && onError(error);

  const validateMerchant = async (session, currencyCode) => {
    try {
      const { post } = getFetchClient();
      const merchantSession = await post(`/${pluginId}/validate-apple-pay-merchant`, {
        domainName: settings?.domainName || window.location.hostname,
        displayName: settings?.displayName || "Store",
        currency: currencyCode || applePayConfig.currencyCode || "EUR",
        countryCode: applePayConfig.countryCode || "DE",
        mode: (settings?.mode || "test").toLowerCase() || "test",
      });

      if (merchantSession.error) {
        const errorMessage = merchantSession.error.message || "Merchant validation failed";
        const errorDetails = merchantSession.error.details || "";
        console.log(`[Apple Pay] Merchant validation failed: ${errorMessage} ${errorDetails}`);
        throw new Error(errorMessage + (errorDetails ? ` - ${errorDetails}` : ""));
      }

      const sessionData = merchantSession.data || merchantSession;
      if (!sessionData || !sessionData.merchantIdentifier) {
        throw new Error(`Invalid merchant session: missing merchantIdentifier. ${PMI_HINT}`);
      }
      session.completeMerchantValidation(sessionData);
    } catch (error) {
      reportError(error);
      try {
        session.completeMerchantValidation({});
      } catch (completeError) {
        console.error(completeError);
      }
    }
  };

  const authorizePayment = async (session, payment, amountValue, currencyCode) => {
    const fail = (error) => {
      session.completePayment({ status: window.ApplePaySession.STATUS_FAILURE });
      reportError(error);
    };

    try {
      if (!payment || !payment.token) return fail(new Error("Payment token is missing"));

      const tokenObject = payment.token;
      if (!tokenObject.paymentData) {
        console.error("[Apple Pay] Invalid token structure: missing paymentData", {
          tokenKeys: Object.keys(tokenObject),
          tokenStructure: JSON.stringify(tokenObject).substring(0, 500),
        });
        return fail(new Error("Invalid Apple Pay token structure: missing paymentData field"));
      }

      logTokenStructure(tokenObject.paymentData);

      let tokenString;
      try {
        tokenString = encodeToken(tokenObject);
        console.log("[Apple Pay] Token encoded successfully:", {
          tokenLength: JSON.stringify(tokenObject).length,
          encodedLength: tokenString.length,
        });
      } catch (e) {
        console.error("[Apple Pay] Error encoding token:", e);
        return fail(new Error(`Failed to encode token: ${e.message}`));
      }

      if (onTokenReceived) {
        await onTokenReceived(tokenString, {
          paymentToken: tokenObject,
          billingContact: payment.billingContact,
          shippingContact: payment.shippingContact,
          amount: amountValue,
          currency: currencyCode,
        });
      }
      session.completePayment({ status: window.ApplePaySession.STATUS_SUCCESS });
    } catch (error) {
      fail(error);
    }
  };

  const bindSessionEvents = (session, amountValue, currencyCode) => {
    const total = { label: settings?.merchantName || "Total", type: "final", amount: amountValue };

    session.onvalidatemerchant = () => validateMerchant(session, currencyCode);
    session.onpaymentmethodselected = () => session.completePaymentMethodSelection({ newTotal: total });
    session.onshippingmethodselected = () => session.completeShippingMethodSelection({ newTotal: total });
    session.onshippingcontactselected = () => session.completeShippingContactSelection({ newTotal: total });
    session.onpaymentauthorized = (event) => authorizePayment(session, event.payment, amountValue, currencyCode);
  };

  const handleApplePayClick = () => {
    if (!settings?.mid) {
      reportError(new Error("Merchant ID is not configured. Please set Merchant ID in plugin settings."));
      return;
    }
    if (typeof window === "undefined" || !window.ApplePaySession) {
      reportError(new Error("Apple Pay is not supported in this environment."));
      return;
    }

    const amountValue = amount ? (parseFloat(amount) / 100).toFixed(2) : "0.00";
    const currencyCode = applePayConfig.currencyCode || "EUR";
    const session = new window.ApplePaySession(APPLE_PAY_VERSION, {
      countryCode: applePayConfig.countryCode || "DE",
      currencyCode,
      merchantCapabilities: applePayConfig.merchantCapabilities || DEFAULT_CAPABILITIES,
      supportedNetworks: applePayConfig.supportedNetworks || DEFAULT_NETWORKS,
      total: { label: settings?.merchantName || "Total", type: "final", amount: amountValue },
    });

    bindSessionEvents(session, amountValue, currencyCode);
    session.begin();
  };

  if (!settings?.mid) {
    return (
      <Box>
        <Alert closeLabel="Close" title={t("applePayBtn.merchantIdMissingTitle", "Merchant ID Missing")} variant="warning">
          <Typography variant="pi" marginTop={2}>
            {t("applePayBtn.merchantIdMissing", "Merchant ID is not configured. Please set Merchant ID in plugin settings.")}{" "}
            {t("applePayBtn.merchantIdHint", "You can find your merchantIdentifier in PMI at: CONFIGURATION → PAYMENT PORTALS → [Your Portal] → Payment type configuration tab.")}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!isLiveMode) {
    return (
      <Box>
        <Alert closeLabel="Close" title={t("applePayBtn.liveModeOnly", "Apple Pay Only Works in Live Mode")} variant="danger">
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

  return (
    <Box style={{ minHeight: "40px", width: "100%" }}>
      <ApplePayButtonElement
        onClick={handleApplePayClick}
        buttonStyle={NATIVE_BUTTON_STYLES[buttonStyle] || "black"}
        type={NATIVE_BUTTON_TYPES[type] || "plain"}
        style={{ width: "220px", height: "40px" }}
      />
      <br /> <br />
      <Typography variant="pi" textColor="neutral600" style={{ fontSize: "12px", marginTop: "8px", marginRight: "6px" }}>
        {t("applePayBtn.noLocalhost", "Apple Pay does NOT work on localhost. Use a production domain with HTTPS.")}
      </Typography>
    </Box>
  );
};
