import * as React from "react";
import { Box, Field, Flex, Searchbar, SingleSelect, SingleSelectOption, TextButton, TextInput } from "@strapi/design-system";
import { ArrowsCounterClockwise } from "@strapi/icons";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { EMPTY_FILTERS } from "../../../constants/transactions";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_OPTIONS = [
  ["APPROVED", "status.approved", "Approved"],
  ["ERROR", "status.error", "Error"],
  ["REDIRECT", "status.redirect", "Redirect"],
  ["INVALID", "status.invalid", "Invalid"],
  ["PENDING", "status.pending", "Pending"],
  ["CANCELLED", "status.cancelled", "Cancelled"],
];

const REQUEST_TYPE_OPTIONS = [
  ["preauthorization", "requestType.preauthorization", "Preauthorization"],
  ["authorization", "requestType.authorization", "Authorization"],
  ["capture", "requestType.capture", "Capture"],
  ["refund", "requestType.refund", "Refund"],
];

const PAYMENT_METHOD_OPTIONS = [
  ["credit_card", "paymentMethod.creditCard", "Credit Card"],
  ["paypal", "paymentMethod.paypal", "PayPal"],
  ["google_pay", "paymentMethod.googlePay", "Google Pay"],
  ["apple_pay", "paymentMethod.applePay", "Apple Pay"],
  ["sofort", "paymentMethod.sofort", "Sofort Banking"],
  ["sepa", "paymentMethod.sepa", "SEPA Direct Debit"],
];

const hasActiveFilters = (filters) => Object.values(filters).some(Boolean);

/** Always-visible filter toolbar: debounced search, status / type / method selects and a date range. */
export const FiltersPanel = ({ filters, handleFiltersChange }) => {
  const { t } = usePluginTranslations();
  const [searchInput, setSearchInput] = React.useState(filters.search);
  const debounceRef = React.useRef(null);

  React.useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleFiltersChange({ search: value }), SEARCH_DEBOUNCE_MS);
  };

  const handleReset = () => {
    clearTimeout(debounceRef.current);
    setSearchInput("");
    handleFiltersChange(EMPTY_FILTERS);
  };

  const renderSelect = (name, label, allLabel, entries) => (
    <Box minWidth="180px">
      <SingleSelect
        aria-label={label}
        placeholder={allLabel}
        value={filters[name] || ""}
        onChange={(value) => handleFiltersChange({ [name]: value === "all" ? "" : String(value) })}
      >
        <SingleSelectOption value="all">{allLabel}</SingleSelectOption>
        {entries.map(([value, key, fallback]) => (
          <SingleSelectOption key={value} value={value}>
            {t(key, fallback)}
          </SingleSelectOption>
        ))}
      </SingleSelect>
    </Box>
  );

  const renderDate = (name, label) => (
    <Field.Root name={name}>
      <Flex gap={2} alignItems="center">
        <Field.Label>{label}</Field.Label>
        <TextInput type="date" value={filters[name] || ""} onChange={(e) => handleFiltersChange({ [name]: e.target.value })} />
      </Flex>
    </Field.Root>
  );

  return (
    <Flex gap={3} wrap="wrap" alignItems="center">
      <Box flex="1" minWidth="240px">
        <Searchbar
          name="search"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          onClear={() => handleSearchChange("")}
          clearLabel={t("filters.clearSearch", "Clear search")}
          placeholder={t("filters.searchPlaceholder", "Search by reference or transaction ID")}
        >
          {t("filters.search", "Search")}
        </Searchbar>
      </Box>
      {renderSelect("status", t("filters.status", "Status"), t("filters.allStatuses", "All Statuses"), STATUS_OPTIONS)}
      {renderSelect("request_type", t("filters.requestType", "Request Type"), t("filters.allTypes", "All Types"), REQUEST_TYPE_OPTIONS)}
      {renderSelect("payment_method", t("filters.paymentMethod", "Payment Method"), t("filters.allMethods", "All Methods"), PAYMENT_METHOD_OPTIONS)}
      {renderDate("date_from", t("filters.dateFrom", "Date From"))}
      {renderDate("date_to", t("filters.dateTo", "Date To"))}
      {hasActiveFilters(filters) && (
        <TextButton startIcon={<ArrowsCounterClockwise />} onClick={handleReset}>
          {t("filters.reset", "Reset")}
        </TextButton>
      )}
    </Flex>
  );
};
