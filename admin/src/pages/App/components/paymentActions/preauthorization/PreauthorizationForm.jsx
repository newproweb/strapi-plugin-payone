import { Box, Flex } from "@strapi/design-system";
import PreauthorizationFormHeader from "./PreauthorizationFormHeader";
import PreauthorizationFormFields from "./PreauthorizationFormFields";
import PreauthorizationPaymentButtons from "./PreauthorizationPaymentButtons";
import CardDetailsInput from "../CardDetailsInput";

const PreauthorizationForm = ({
  paymentAmount,
  setPaymentAmount,
  preauthReference,
  setPreauthReference,
  isProcessingPayment,
  onPreauthorization,
  paymentMethod,
  settings,
  setGooglePayToken,
  cardtype,
  setCardtype,
  cardpan,
  setCardpan,
  cardexpiredate,
  setCardexpiredate,
  cardcvc2,
  setCardcvc2,
  isLiveMode = false,
}) => {
  const handleGooglePayToken = (token, paymentData) => {
    if (!token) {
      return;
    }
    setGooglePayToken(token);
    onPreauthorization(token);
  };

  const handleGooglePayError = (error) => {
    console.error("Google Pay error:", error);
  };

  const isCardDetailsValid =
    !!cardtype && !!cardpan && !!cardexpiredate && !!cardcvc2;

  const isDisabled =
    !paymentAmount.trim() ||
    (paymentMethod === "cc" &&
      settings?.enable3DSecure !== false &&
      !isCardDetailsValid);

  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <PreauthorizationFormHeader />

      <PreauthorizationFormFields
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        preauthReference={preauthReference}
        setPreauthReference={setPreauthReference}
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

      <PreauthorizationPaymentButtons
        paymentMethod={paymentMethod}
        paymentAmount={paymentAmount}
        isProcessingPayment={isProcessingPayment}
        onPreauthorization={onPreauthorization}
        settings={settings}
        handleGooglePayToken={handleGooglePayToken}
        handleGooglePayError={handleGooglePayError}
        isDisabled={isDisabled}
      />
    </Flex>
  );
};

export default PreauthorizationForm;

