import { Accordion, Box, Flex, Typography } from "@strapi/design-system";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { GooglePayButton } from "../../wallets/google-pay/GooglePayButton";
import { ApplePayButton } from "../../wallets/apple-pay/ApplePayButton";
import { ActionForm, SubmitButton } from "./ActionForm";
import { CardDetailsInput } from "./CardDetailsInput";
import { AmountFields, CustomerFields } from "./CustomerFields";

const CUSTOMER_GRID_STYLE = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" };

const FORMS = {
  preauthorization: {
    submitKey: "preauth.submit",
    submit: "Preauthorize",
    amountName: "paymentAmount",
    supportsApplePay: false,
    handlerName: "handlePreauthorization",
  },
  authorization: {
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
  const pluginSettings = settings?.savedSettings;
  const method = paymentState.paymentMethod;
  const submitLabel = t(form.submitKey, form.submit);
  const customerName = [paymentState.firstname, paymentState.lastname].filter(Boolean).join(" ");

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
        <Typography variant="pi" textColor="neutral600">
          Apple Pay is only supported for Authorization, not Preauthorization.
        </Typography>
      );
    }
    return (
      <Box>
        <ApplePayButton amount={paymentState.paymentAmount} onTokenReceived={handleApplePayToken} onError={handleWalletError("[AuthorizationForm] Apple Pay")} settings={pluginSettings} />
        {paymentState.applePayToken && (
          <Flex direction="column" alignItems="flex-start" gap={3} marginTop={3}>
            <Typography variant="pi" textColor="success600" fontWeight="bold">
              Apple Pay token received. You can now process the authorization.
            </Typography>
            <SubmitButton
              onClick={() => submitPayment(paymentState.applePayToken)}
              loading={isProcessingPayment}
              disabled={!paymentState.paymentAmount.trim() || !paymentState.authReference.trim()}
            >
              {submitLabel}
            </SubmitButton>
          </Flex>
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
    <ActionForm fields={<AmountFields paymentActions={paymentActions} amountName={form.amountName} />}>
      <Flex direction="column" alignItems="stretch" gap={5}>
        {method === "cc" && pluginSettings?.enable3DSecure && (
          <CardDetailsInput
            cardtype={paymentState.cardtype}
            cardpan={paymentState.cardpan}
            cardexpiredate={paymentState.cardexpiredate}
            cardcvc2={paymentState.cardcvc2}
            onFieldChange={handleFieldChange}
          />
        )}

        <Accordion.Root>
          <Accordion.Item value="customer">
            <Accordion.Header>
              <Accordion.Trigger description={customerName || undefined}>{t("paymentForm.customer", "Customer and billing address")}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <Box padding={4} style={CUSTOMER_GRID_STYLE}>
                <CustomerFields paymentActions={paymentActions} />
              </Box>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>

        <Box>{renderPaymentAction()}</Box>
      </Flex>
    </ActionForm>
  );
};
