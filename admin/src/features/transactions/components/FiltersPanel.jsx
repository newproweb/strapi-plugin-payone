import * as React from "react";
import { Box } from "@strapi/design-system";
import { FormField } from "../../../components/FormField";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { EMPTY_FILTERS } from "../../../constants/transactions";
import { ImportExportBar } from "./ImportExportBar";

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

const FILTERS_GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  alignItems: "start",
};

const normalizeFilterValue = (raw) => (raw === "all" || raw === undefined ? "" : String(raw));

export const FiltersPanel = ({ filters, handleFiltersChange, loadTransactionHistory }) => {
  const { t } = usePluginTranslations();

  const toOptions = (allLabel, entries) => [
    { value: "", label: allLabel },
    ...entries.map(([value, key, fallback]) => ({ value, label: t(key, fallback) })),
  ];

  const filterFields = React.useMemo(
    () => [
      {
        name: "search",
        label: t("filters.search", "Search"),
        inputType: "textInput",
        placeholder: t("filters.searchPlaceholder", "Search by reference or transaction ID"),
        tooltipContent: t("filters.searchTooltip", "Search by reference or transaction ID to filter transactions"),
      },
      {
        name: "status",
        label: t("filters.status", "Status"),
        inputType: "select",
        placeholder: "",
        tooltipContent: t("filters.statusTooltip", "Filter transactions by their status (Approved, Error, Redirect, Invalid, Pending, Cancelled)"),
        options: toOptions(t("filters.allStatuses", "All Statuses"), STATUS_OPTIONS),
      },
      {
        name: "request_type",
        label: t("filters.requestType", "Request Type"),
        inputType: "select",
        placeholder: t("filters.allTypes", "All Types"),
        tooltipContent: t("filters.requestTypeTooltip", "Filter transactions by request type (Preauthorization, Authorization, Capture, Refund)"),
        options: toOptions(t("filters.allTypes", "All Types"), REQUEST_TYPE_OPTIONS),
      },
      {
        name: "payment_method",
        label: t("filters.paymentMethod", "Payment Method"),
        inputType: "select",
        placeholder: t("filters.allMethods", "All Methods"),
        tooltipContent: t("filters.paymentMethodTooltip", "Filter transactions by payment method (Credit Card, PayPal, Google Pay, Apple Pay, Sofort Banking, SEPA Direct Debit)"),
        options: toOptions(t("filters.allMethods", "All Methods"), PAYMENT_METHOD_OPTIONS),
      },
    ],
    [t]
  );

  const handleFilterChange = (filter) => (e) => {
    const raw = filter.inputType === "textInput" ? e.target.value : e.target?.value ?? e;
    handleFiltersChange({ [filter.name]: normalizeFilterValue(raw) });
  };

  return (
    <Box style={FILTERS_GRID_STYLE}>
      {filterFields.map((filter) => (
        <FormField
          key={filter.name}
          name={filter.name}
          value={filters[filter.name] ?? ""}
          onChange={handleFilterChange(filter)}
          inputType={filter.inputType}
          label={filter.label}
          placeholder={filter.placeholder}
          tooltipContent={filter.tooltipContent}
          options={filter.options}
        />
      ))}

      <FormField
        name="date_from"
        value={filters.date_from || ""}
        onChange={(e) => handleFiltersChange({ date_from: e.target.value })}
        inputType="dateInput"
        label={t("filters.dateFrom", "Date From")}
        tooltipContent={t("filters.dateFromTooltip", "Filter transactions from this date onwards. Select the starting date for the date range filter.")}
      />
      <FormField
        name="date_to"
        value={filters.date_to || ""}
        onChange={(e) => handleFiltersChange({ date_to: e.target.value })}
        inputType="dateInput"
        label={t("filters.dateTo", "Date To")}
        tooltipContent={t("filters.dateToTooltip", "Filter transactions up to this date. Select the ending date for the date range filter.")}
      />

      <ImportExportBar filters={filters} onReset={() => handleFiltersChange(EMPTY_FILTERS)} onImportDone={loadTransactionHistory} />
    </Box>
  );
};
