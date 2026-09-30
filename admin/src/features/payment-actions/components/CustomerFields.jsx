import { FormField } from "../../../components/FormField";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import {
  getCountryOptions,
  getCurrencyOptions,
  getGenderOptions,
  getSalutationOptions,
} from "../../../utils/locale-options";

/** Amount + customer and billing address inputs shared by the preauthorization and authorization forms. */
export const CustomerFields = ({ paymentActions, amountName }) => {
  const { t } = usePluginTranslations();
  const { paymentState, handleFieldChange } = paymentActions;
  const optionsCountry = paymentState.country || "US";

  const textField = (field, label, placeholder, tooltipContent) => (
    <FormField
      name={field}
      label={label}
      value={paymentState[field] || ""}
      onChange={(e) => handleFieldChange(field, e.target.value)}
      inputType="textInput"
      placeholder={placeholder}
      tooltipContent={tooltipContent}
    />
  );

  const selectField = (field, label, options, placeholder, tooltipContent, fallback = "") => (
    <FormField
      name={field}
      label={label}
      value={paymentState[field] || fallback}
      onChange={(e) => handleFieldChange(field, e.target.value)}
      inputType="select"
      options={options}
      placeholder={placeholder}
      tooltipContent={tooltipContent}
    />
  );

  return (
    <>
      <FormField
        name={amountName}
        label={t("preauth.amount", "Amount *")}
        value={paymentState.paymentAmount || ""}
        onChange={(e) => handleFieldChange("paymentAmount", e.target.value)}
        inputType="textInput"
        placeholder={t("preauth.amountPlaceholder", "Enter amount (e.g., 1000 for €10.00)")}
        required
        tooltipContent={t("preauth.amountTooltip", "Amount in cents (e.g., 1000 = €10.00)")}
      />
      {textField("firstname", t("preauth.firstName", "First Name"), "John", "Customer first name")}
      {textField("lastname", t("preauth.lastName", "Last Name"), "Doe", "Customer last name")}
      {textField("email", "Email", "john.doe@example.com", "Customer email address")}
      {textField("telephonenumber", "Phone Number", "+4917512345678", "Customer phone number")}
      {selectField("gender", "Gender", getGenderOptions(optionsCountry), "Select gender", "Customer gender")}
      {selectField("salutation", "Salutation", getSalutationOptions(optionsCountry), "Select salutation", "Customer salutation")}
      {selectField("country", "Country", getCountryOptions(paymentState.paymentMethod), "Select country", "Billing address country")}
      {selectField("currency", "Currency", getCurrencyOptions(), "Select currency", "Currency code", "EUR")}
      {textField("city", "City", "Berlin", "Billing address city")}
      {textField("street", "Street", "Main Street 123", "Billing address street")}
      {textField("zip", "ZIP Code", "12345", "Billing address ZIP code")}
    </>
  );
};
