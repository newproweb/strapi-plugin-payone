import * as React from "react";
import { Box, Flex, Typography, Button } from "@strapi/design-system";
import { Play } from "@strapi/icons";
import GooglePayButton from "../GooglePaybutton";
import ApplePayBtn from "../ApplePayBtn";
import CardDetailsInput from "./CardDetailsInput";
import RenderInput from "../RenderInput";
import {
  getSalutationOptions,
  getGenderOptions,
  getCurrencyOptions,
  getCountryOptions,
} from "../../../utils/countryLanguageUtils";

const AuthorizationForm = ({ paymentActions, settings }) => {
  const handleGooglePayToken = (token) => {
    if (!token) {
      return;
    }
    paymentActions.handleFieldChange("googlePayToken", token);
    paymentActions.handleAuthorization(token);
  };

  const handleGooglePayError = (error) => {
    console.error("[AuthorizationForm] Google Pay error:", error);
  };

  const handleApplePayToken = async (token) => {
    if (!token) {
      return Promise.reject(new Error("Token is missing"));
    }

    paymentActions.handleFieldChange("applePayToken", token);

    return Promise.resolve({
      success: true,
      message:
        "Token received successfully. Please click 'Process Authorization' to complete the payment.",
    });
  };

  const handleApplePayError = (error) => {
    console.error("[AuthorizationForm] Apple Pay error:", error);
  };

  const countryOptions = getCountryOptions(
    paymentActions.paymentState.paymentMethod
  );

  const salutationOptions = getSalutationOptions(
    paymentActions.paymentState.country || "US"
  );

  const genderOptions = getGenderOptions(
    paymentActions.paymentState.country || "US"
  );
  const currencyOptions = getCurrencyOptions();

  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Flex direction="row" gap={2}>
        <Typography
          variant="omega"
          fontWeight="semiBold"
          textColor="neutral800"
          className="payment-form-title"
        >
          Authorization
        </Typography>
        <Typography
          variant="pi"
          textColor="neutral600"
          className="payment-form-description"
        >
          Authorize and capture an amount immediately.
        </Typography>
      </Flex>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
        }}
      >
        <RenderInput
          name="authAmount"
          label="Amount *"
          value={paymentActions.paymentState.paymentAmount || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("paymentAmount", e.target.value)
          }
          inputType="textInput"
          placeholder="Enter amount (e.g., 1000 for €10.00)"
          required
          tooltipContent="Amount in cents (e.g., 1000 = €10.00)"
        />

        <RenderInput
          name="firstname"
          label="First Name"
          value={paymentActions.paymentState.firstname || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("firstname", e.target.value)
          }
          inputType="textInput"
          placeholder="John"
          tooltipContent="Customer first name"
        />

        <RenderInput
          name="lastname"
          label="Last Name"
          value={paymentActions.paymentState.lastname || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("lastname", e.target.value)
          }
          inputType="textInput"
          placeholder="Doe"
          tooltipContent="Customer last name"
        />

        <RenderInput
          name="email"
          label="Email"
          value={paymentActions.paymentState.email || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("email", e.target.value)
          }
          inputType="textInput"
          placeholder="john.doe@example.com"
          tooltipContent="Customer email address"
        />

        <RenderInput
          name="telephonenumber"
          label="Phone Number"
          value={paymentActions.paymentState.telephonenumber || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("telephonenumber", e.target.value)
          }
          inputType="textInput"
          placeholder="+4917512345678"
          tooltipContent="Customer phone number"
        />

        <RenderInput
          name="gender"
          label="Gender"
          value={paymentActions.paymentState.gender || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("gender", e.target.value)
          }
          inputType="select"
          options={genderOptions}
          placeholder="Select gender"
          tooltipContent="Customer gender"
        />

        <RenderInput
          name="salutation"
          label="Salutation"
          value={paymentActions.paymentState.salutation || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("salutation", e.target.value)
          }
          inputType="select"
          options={salutationOptions}
          placeholder="Select salutation"
          tooltipContent="Customer salutation"
        />

        <RenderInput
          name="country"
          label="Country"
          value={paymentActions.paymentState.country || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("country", e.target.value)
          }
          inputType="select"
          options={countryOptions}
          placeholder="Select country"
          tooltipContent="Billing address country"
        />

        <RenderInput
          name="currency"
          label="Currency"
          value={paymentActions.paymentState.currency || "EUR"}
          onChange={(e) =>
            paymentActions.handleFieldChange("currency", e.target.value)
          }
          inputType="select"
          options={currencyOptions}
          placeholder="Select currency"
          tooltipContent="Currency code"
        />

        <RenderInput
          name="city"
          label="City"
          value={paymentActions.paymentState.city || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("city", e.target.value)
          }
          inputType="textInput"
          placeholder="Berlin"
          tooltipContent="Billing address city"
        />

        <RenderInput
          name="street"
          label="Street"
          value={paymentActions.paymentState.street || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("street", e.target.value)
          }
          inputType="textInput"
          placeholder="Main Street 123"
          tooltipContent="Billing address street"
        />

        <RenderInput
          name="zip"
          label="ZIP Code"
          value={paymentActions.paymentState.zip || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("zip", e.target.value)
          }
          inputType="textInput"
          placeholder="12345"
          tooltipContent="Billing address ZIP code"
        />
      </Box>

      {paymentActions.paymentState.paymentMethod === "cc" &&
        settings?.settings?.enable3DSecure && (
          <Box marginTop={4}>
            <CardDetailsInput
              cardtype={paymentActions.paymentState.cardtype}
              setCardtype={(value) =>
                paymentActions.handleFieldChange("cardtype", value)
              }
              cardpan={paymentActions.paymentState.cardpan}
              setCardpan={(value) =>
                paymentActions.handleFieldChange("cardpan", value)
              }
              cardexpiredate={paymentActions.paymentState.cardexpiredate}
              setCardexpiredate={(value) =>
                paymentActions.handleFieldChange("cardexpiredate", value)
              }
              cardcvc2={paymentActions.paymentState.cardcvc2}
              setCardcvc2={(value) =>
                paymentActions.handleFieldChange("cardcvc2", value)
              }
            />
          </Box>
        )}

      {paymentActions.paymentState.paymentMethod === "gpp" ? (
        <GooglePayButton
          amount={paymentActions.paymentState.paymentAmount}
          currency="EUR"
          onTokenReceived={handleGooglePayToken}
          onError={handleGooglePayError}
          settings={settings?.settings}
        />
      ) : paymentActions.paymentState.paymentMethod === "apl" ? (
        <Box>
          <ApplePayBtn
            amount={paymentActions.paymentState.paymentAmount}
            onTokenReceived={handleApplePayToken}
            onError={handleApplePayError}
            settings={settings?.settings}
          />
          {paymentActions.paymentState.applePayToken && (
            <Box
              marginTop={3}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <Typography
                variant="pi"
                textColor="success600"
                style={{ marginBottom: "8px", fontWeight: "bold" }}
              >
                ✓ Apple Pay token received. You can now process the
                authorization:
              </Typography>
              <Button
                variant="default"
                onClick={() =>
                  paymentActions.handleAuthorization(
                    paymentActions.paymentState.applePayToken
                  )
                }
                loading={paymentActions.isProcessingPayment}
                startIcon={<Play />}
                style={{ maxWidth: "200px" }}
                disabled={
                  !paymentActions.paymentState.paymentAmount.trim() ||
                  !paymentActions.paymentState.authReference.trim()
                }
              >
                Process Authorization
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Button
          variant="default"
          onClick={paymentActions.handleAuthorization}
          loading={paymentActions.isProcessingPayment}
          startIcon={<Play />}
          style={{ maxWidth: "200px" }}
          disabled={
            !paymentActions.paymentState.paymentAmount.trim() ||
            (paymentActions.paymentState.paymentMethod === "cc" &&
              settings?.settings?.enable3DSecure !== false &&
              (!paymentActions.paymentState.cardtype ||
                !paymentActions.paymentState.cardpan ||
                !paymentActions.paymentState.cardexpiredate ||
                !paymentActions.paymentState.cardcvc2)) ||
            (paymentActions.paymentState.paymentMethod === "apl" &&
              !paymentActions.paymentState.applePayToken)
          }
        >
          Process Authorization
        </Button>
      )}
    </Flex>
  );
};

export default AuthorizationForm;
