import { Box, TextInput, Select, Option } from "@strapi/design-system";
import {
  getSalutationOptions,
  getGenderOptions,
  getCurrencyOptions,
  getCountryOptions,
} from "../../../../utils/countryLanguageUtils";
import InfoTooltip from "../../common/InfoTooltip";

const PreauthorizationFormFields = ({
  paymentAmount,
  setPaymentAmount,
  preauthReference,
  setPreauthReference,
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
  paymentMethod,
}) => {
  const countryOptions = getCountryOptions(paymentMethod);
  const salutationOptions = getSalutationOptions(country || "US");
  const genderOptions = getGenderOptions(country || "US");
  const currencyOptions = getCurrencyOptions();

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "16px",
      }}
    >
      <TextInput
        label="Amount *"
        name="paymentAmount"
        value={paymentAmount}
        onChange={(e) => setPaymentAmount(e.target.value)}
        placeholder="Enter amount (e.g., 1000 for €10.00)"
        required
        endAction={
          <InfoTooltip
            label="Amount"
            description="Amount in cents (e.g., 1000 = €10.00)"
            id="paymentAmount-tooltip"
          />
        }
      />
      <TextInput
        label="Reference *"
        name="preauthReference"
        value={preauthReference}
        onChange={(e) => setPreauthReference(e.target.value)}
        placeholder="Auto-generated if empty"
        className="payment-input"
        endAction={
          <InfoTooltip
            label="Reference"
            description="Reference will be auto-generated if left empty"
            id="preauthReference-tooltip"
          />
        }
      />
      <TextInput
        label="First Name"
        name="firstname"
        value={firstname || ""}
        onChange={(e) => setFirstname(e.target.value)}
        placeholder="John"
        className="payment-input"
        endAction={
          <InfoTooltip
            label="First Name"
            description="Customer first name"
            id="firstname-tooltip"
          />
        }
      />
      <TextInput
        label="Last Name"
        name="lastname"
        value={lastname || ""}
        onChange={(e) => setLastname(e.target.value)}
        placeholder="Doe"
        className="payment-input"
        endAction={
          <InfoTooltip
            label="Last Name"
            description="Customer last name"
            id="lastname-tooltip"
          />
        }
      />
      <TextInput
        label="Email"
        name="email"
        value={email || ""}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="john.doe@example.com"
        className="payment-input"
        endAction={
          <InfoTooltip
            label="Email"
            description="Customer email address"
            id="email-tooltip"
          />
        }
      />
      <TextInput
        label="Phone Number"
        name="telephonenumber"
        value={telephonenumber || ""}
        onChange={(e) => setTelephonenumber(e.target.value)}
        placeholder="+4917512345678"
        className="payment-input"
        endAction={
          <InfoTooltip
            label="Phone Number"
            description={`Customer phone number. Format should match selected country: ${
              country || "US"
            } (e.g., +4917512345678 for Germany, +12125551234 for US)`}
            id="telephonenumber-tooltip"
          />
        }
      />
      <Select
        label="Gender"
        name="gender"
        value={gender || ""}
        onChange={(value) => setGender(value)}
        placeholder="Select gender"
        labelAction={
          <InfoTooltip
            label="Gender"
            description={`Customer gender. Options depend on selected country: ${
              country || "US"
            }`}
            id="gender-tooltip"
          />
        }
      >
        <Option value="" multi={false}>
          Select gender
        </Option>
        {genderOptions.map((option) => (
          <Option key={option.value} value={option.value} multi={false}>
            {option.label}
          </Option>
        ))}
      </Select>
      <Select
        label="Salutation"
        name="salutation"
        value={salutation || ""}
        onChange={(value) => setSalutation(value)}
        placeholder="Select salutation"
        labelAction={
          <InfoTooltip
            label="Salutation"
            description={`Customer salutation (e.g., Mr., Mrs., Ms.). Options depend on selected country: ${
              country || "US"
            }`}
            id="salutation-tooltip"
          />
        }
      >
        <Option value="" multi={false}>
          Select salutation
        </Option>
        {salutationOptions.map((option) => (
          <Option key={option.value} value={option.value} multi={false}>
            {option.label}
          </Option>
        ))}
      </Select>
      <Select
        label="Country"
        name="country"
        value={country || ""}
        onChange={(value) => setCountry(value)}
        placeholder="Select country"
        labelAction={
          <InfoTooltip
            label="Country"
            description="Billing address country. This affects available currencies, phone number formats, and ZIP code formats."
            id="country-tooltip"
          />
        }
      >
        <Option value="" multi={false}>
          Select country
        </Option>
        {countryOptions.map((option) => (
          <Option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            multi={false}
          >
            {option.label}
          </Option>
        ))}
      </Select>
      <Select
        label="Currency"
        name="currency"
        value={currency || "EUR"}
        onChange={(value) => setCurrency(value)}
        placeholder="Select currency"
        labelAction={
          <InfoTooltip
            label="Currency"
            description={`Currency code (e.g., EUR, USD, GBP). Should match the selected country: ${
              country || "US"
            }`}
            id="currency-tooltip"
          />
        }
      >
        {currencyOptions.map((option) => (
          <Option key={option.value} value={option.value} multi={false}>
            {option.label}
          </Option>
        ))}
      </Select>
      <TextInput
        label="City"
        name="city"
        value={city || ""}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Berlin"
        className="payment-input"
        endAction={
          <InfoTooltip
            label="City"
            description={`Billing address city for country: ${country || "US"}`}
            id="city-tooltip"
          />
        }
      />
      <TextInput
        label="Street"
        name="street"
        value={street || ""}
        onChange={(e) => setStreet(e.target.value)}
        placeholder="Main Street 123"
        className="payment-input"
        endAction={
          <InfoTooltip
            label="Street"
            description="Billing address street"
            id="street-tooltip"
          />
        }
      />
      <TextInput
        label="ZIP Code"
        name="zip"
        value={zip || ""}
        onChange={(e) => setZip(e.target.value)}
        placeholder="12345"
        className="payment-input"
        endAction={
          <InfoTooltip
            label="ZIP Code"
            description={`Billing address ZIP/postal code. Format should match selected country: ${
              country || "US"
            } (e.g., 12345 for US, 10115 for Germany)`}
            id="zip-tooltip"
          />
        }
      />
    </Box>
  );
};

export default PreauthorizationFormFields;
