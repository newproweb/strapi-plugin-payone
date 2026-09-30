import { Box, Typography } from "@strapi/design-system";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { GooglePayButton } from "../../wallets/google-pay/GooglePayButton";
import { ApplePayButton } from "../../wallets/apple-pay/ApplePayButton";
import { ActionForm, SubmitButton } from "./ActionForm";
import { CardDetailsInput } from "./CardDetailsInput";
import { CustomerFields } from "./CustomerFields";

const FORMS = {
  preauthorization: {
    titleKey: "preauth.title",
    title: "Preauthorization",
    descriptionKey: "preauth.description",
    description: "Reserve an amount on a credit card without capturing it immediately.",
    submitKey: "preauth.submit",
    submit: "Preauthorize",
    amountName: "paymentAmount",
    supportsApplePay: false,
    handlerName: "handlePreauthorization",
  },
  authorization: {
    titleKey: "auth.title",
    title: "Authorization",
    descriptionKey: "auth.description",
    description: "Authorize a payment with an existing preauthorization.",
    submitKey: "auth.submit",
    submit: "Authorize",
    amountName: "authAmount",
    supportsApplePay: true,
    handlerName: "handleAuthorization",
  },
};

const hasCardDetails = (state) => state.cardtype && state.cardpan && state.cardexpiredate && state.cardcvc2;

/** Preauthorization or authorization test form (`type`), with card, Google Pay or Apple Pay input. */
export const PaymentForm = ({ type, paymentActions, settings }) => {
  const { t } = usePluginTranslations();
  const form = FORMS[type];
  const { paymentState, handleFieldChange, isProcessingPayment } = paymentActions;
  const submitPayment = paymentActions[form.handlerName];
  const pluginSettings = settings?.settings;
  const method = paymentState.paymentMethod;
  const submitLabel = t(form.submitKey, form.submit);

  const handleGooglePayToken = (token) => {
    if (!token) return;
    handleFieldChange("googlePayToken", token);
    submitPayment(token);
  };

  const handleApplePayToken = async (token) => {
    if (!token) throw new Error("Token is missing");
    handleFieldChange("applePayToken", token);
    return { success: true, message: `Token received successfully. Please click '${submitLabel}' to complete the payment.` };
  };

  const handleWalletError = (wallet) => (error) => console.error(`${wallet} error:`, error);

  const isSubmitDisabled =
    !paymentState.paymentAmount.trim() ||
    (method === "cc" && pluginSettings?.enable3DSecure !== false && !hasCardDetails(paymentState));

  const renderApplePay = () => {
    if (!form.supportsApplePay) {
      return (
        <Box>
          <Typography variant="pi" textColor="neutral600">
            Apple Pay is only supported for Authorization, not Preauthorization.
          </Typography>
        </Box>
      );
    }
    return (
      <Box>
        <ApplePayButton amount={paymentState.paymentAmount} onTokenReceived={handleApplePayToken} onError={handleWalletError("[AuthorizationForm] Apple Pay")} settings={pluginSettings} />
        {paymentState.applePayToken && (
          <Box marginTop={3} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
            <Typography variant="pi" textColor="success600" style={{ marginBottom: "8px", fontWeight: "bold" }}>
              ✓ Apple Pay token received. You can now process the authorization:
            </Typography>
            <SubmitButton
              onClick={() => submitPayment(paymentState.applePayToken)}
              loading={isProcessingPayment}
              disabled={!paymentState.paymentAmount.trim() || !paymentState.authReference.trim()}
            >
              {submitLabel}
            </SubmitButton>
          </Box>
        )}
      </Box>
    );
  };

  const renderPaymentAction = () => {
    if (method === "gpp") {
      return (
        <GooglePayButton
          amount={paymentState.paymentAmount}
          currency="EUR"
          onTokenReceived={handleGooglePayToken}
          onError={handleWalletError(type === "authorization" ? "[AuthorizationForm] Google Pay" : "Google Pay")}
          settings={pluginSettings}
        />
      );
    }
    if (method === "apl") return renderApplePay();
    return (
      <SubmitButton onClick={() => submitPayment()} loading={isProcessingPayment} disabled={isSubmitDisabled}>
        {submitLabel}
      </SubmitButton>
    );
  };

  return (
    <ActionForm
      title={t(form.titleKey, form.title)}
      description={t(form.descriptionKey, form.description)}
      fields={<CustomerFields paymentActions={paymentActions} amountName={form.amountName} />}
    >
      {method === "cc" && pluginSettings?.enable3DSecure && (
        <Box marginTop={4}>
          <CardDetailsInput
            cardtype={paymentState.cardtype}
            cardpan={paymentState.cardpan}
            cardexpiredate={paymentState.cardexpiredate}
            cardcvc2={paymentState.cardcvc2}
            onFieldChange={handleFieldChange}
          />
        </Box>
      )}
      {renderPaymentAction()}
    </ActionForm>
  );
};
