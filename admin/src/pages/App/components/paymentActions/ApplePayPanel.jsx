import { Box, Typography } from "@strapi/design-system";
import PaymentMethodSelector from "./PaymentMethodSelector";
import AuthorizationForm from "./authorization/AuthorizationForm";

const ApplePayOnlyPanel = ({
  paymentAmount,
  setPaymentAmount,
  authReference,
  setAuthReference,
  isProcessingPayment,
  onAuthorization,
  paymentMethod,
  settings,
  setGooglePayToken,
  setPaymentMethod,
  captureMode,
  setCaptureMode,
  onNavigateToConfig,
  isLiveMode,
  setCardcvc2,
  cardtype,
  setCardtype,
  cardpan,
  setCardpan,
  cardexpiredate,
  setCardexpiredate,
  cardcvc2,
  applePayToken,
  setApplePayToken,
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
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "16px",
        marginTop: "24px",
        width: "100%",
      }}
    >
      <Typography
        variant="pi"
        textColor="warning600"
        style={{
          fontSize: "14px",
          marginTop: "12px",
          marginBottom: "12px",
          fontWeight: "bold",
        }}
      >
        ⚠️ Apple Pay can only be tested on a production domain with HTTPS and
        Live mode. Testing in Strapi admin panel is not supported. Please test
        Apple Pay on your production website.
      </Typography>

      <PaymentMethodSelector
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        captureMode={captureMode}
        setCaptureMode={setCaptureMode}
        onNavigateToConfig={onNavigateToConfig}
        isLiveMode={isLiveMode}
      />

      <hr className="payment-divider" />

      <AuthorizationForm
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        authReference={authReference}
        setAuthReference={setAuthReference}
        isProcessingPayment={isProcessingPayment}
        onAuthorization={onAuthorization}
        paymentMethod={paymentMethod}
        settings={settings}
        setGooglePayToken={setGooglePayToken}
        applePayToken={applePayToken}
        setApplePayToken={setApplePayToken}
        cardtype={cardtype}
        setCardtype={setCardtype}
        cardpan={cardpan}
        setCardpan={setCardpan}
        cardexpiredate={cardexpiredate}
        setCardexpiredate={setCardexpiredate}
        cardcvc2={cardcvc2}
        setCardcvc2={setCardcvc2}
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
      />
    </Box>
  );
};

export default ApplePayOnlyPanel;
