import { Box, Flex } from "@strapi/design-system";
import AuthorizationFormHeader from "./AuthorizationFormHeader";
import AuthorizationFormFields from "./AuthorizationFormFields";
import AuthorizationPaymentButtons from "./AuthorizationPaymentButtons";
import CardDetailsInput from "../CardDetailsInput";

const AuthorizationForm = ({
  paymentAmount,
  setPaymentAmount,
  authReference,
  setAuthReference,
  isProcessingPayment,
  onAuthorization,
  paymentMethod,
  settings,
  setGooglePayToken,
  applePayToken,
  setApplePayToken,
  cardtype,
  setCardtype,
  cardpan,
  setCardpan,
  cardexpiredate,
  setCardexpiredate,
  cardcvc2,
  setCardcvc2,
}) => {
  const handleGooglePayToken = (token, paymentData) => {
    if (!token) {
      return;
    }
    setGooglePayToken(token);
    onAuthorization(token);
  };

  const handleGooglePayError = (error) => {
    console.error("[AuthorizationForm] Google Pay error:", error);
  };

  const handleApplePayToken = async (token, paymentData) => {
    if (!token) {
      return Promise.reject(new Error("Token is missing"));
    }

    setApplePayToken(token);

    return Promise.resolve({
      success: true,
      message:
        "Token received successfully. Please click 'Process Authorization' to complete the payment.",
    });
  };

  const handleApplePayError = (error) => {
    console.error("[AuthorizationForm] Apple Pay error:", error);
  };

  const isCardDetailsValid =
    !!cardtype && !!cardpan && !!cardexpiredate && !!cardcvc2;

  const isDisabled =
    !paymentAmount.trim() ||
    (paymentMethod === "cc" &&
      settings?.enable3DSecure !== false &&
      !isCardDetailsValid) ||
    (paymentMethod === "apl" && !applePayToken);

  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <AuthorizationFormHeader />

      <AuthorizationFormFields
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        authReference={authReference}
        setAuthReference={setAuthReference}
      />

      {paymentMethod === "cc" && settings?.enable3DSecure && (
        <Box marginTop={4}>
          <CardDetailsInput
            cardtype={cardtype}
            setCardtype={setCardtype}
            cardpan={cardpan}
            setCardpan={setCardpan}
            cardexpiredate={cardexpiredate}
            setCardexpiredate={setCardexpiredate}
            cardcvc2={cardcvc2}
            setCardcvc2={setCardcvc2}
          />
        </Box>
      )}

      <AuthorizationPaymentButtons
        paymentMethod={paymentMethod}
        paymentAmount={paymentAmount}
        authReference={authReference}
        isProcessingPayment={isProcessingPayment}
        onAuthorization={onAuthorization}
        settings={settings}
        handleGooglePayToken={handleGooglePayToken}
        handleGooglePayError={handleGooglePayError}
        handleApplePayToken={handleApplePayToken}
        handleApplePayError={handleApplePayError}
        applePayToken={applePayToken}
        isDisabled={isDisabled}
      />
    </Flex>
  );
};

export default AuthorizationForm;

