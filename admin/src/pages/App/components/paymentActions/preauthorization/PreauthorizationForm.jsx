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
  firstname,
  setFirstname,
  lastname,
  setLastname,
  email,
  setEmail,
  telephonenumber,
  setTelephonenumber,
  gender,
  setGender,
  salutation,
  setSalutation,
  country,
  setCountry,
  currency,
  setCurrency,
  city,
  setCity,
  street,
  setStreet,
  zip,
  setZip,
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
        firstname={firstname}
        setFirstname={setFirstname}
        lastname={lastname}
        setLastname={setLastname}
        email={email}
        setEmail={setEmail}
        telephonenumber={telephonenumber}
        setTelephonenumber={setTelephonenumber}
        gender={gender}
        setGender={setGender}
        salutation={salutation}
        setSalutation={setSalutation}
        country={country}
        setCountry={setCountry}
        currency={currency}
        setCurrency={setCurrency}
        city={city}
        setCity={setCity}
        street={street}
        setStreet={setStreet}
        zip={zip}
        setZip={setZip}
        paymentMethod={paymentMethod}
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

