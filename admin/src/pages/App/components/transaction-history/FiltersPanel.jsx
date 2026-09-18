import * as React from "react";
import { Box } from "@strapi/design-system";
import RenderInput from "../RenderInput";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import ImportExportBar from "./ImportExportBar";

const FiltersPanel = ({ filters, handleFiltersChange , loadTransactionHistory}) => {
  const { t } = usePluginTranslations();

  const handleReset = () => {
    handleFiltersChange({
      search: "",
      status: "",
      request_type: "",
      payment_method: "",
      date_from: "",
      date_to: "",
    });
  };

  const filterOptions = React.useMemo(
    () => [
      {
        name: "search",
        label: t("filters.search", "Search"),
        type: "text",
        inputType: "textInput",
        placeholder: t("filters.searchPlaceholder", "Search by reference or transaction ID"),
        tooltipContent: t("filters.searchTooltip", "Search by reference or transaction ID to filter transactions"),
        flex: 1,
      },
      {
        name: "status",
        label: t("filters.status", "Status"),
        type: "enumeration",
        inputType: "select",
        placeholder: "",
        tooltipContent: t("filters.statusTooltip", "Filter transactions by their status (Approved, Error, Redirect, Invalid, Pending, Cancelled)"),
        options: [
          { value: "", label: t("filters.allStatuses", "All Statuses") },
          { value: "APPROVED", label: t("status.approved", "Approved") },
          { value: "ERROR", label: t("status.error", "Error") },
          { value: "REDIRECT", label: t("status.redirect", "Redirect") },
          { value: "INVALID", label: t("status.invalid", "Invalid") },
          { value: "PENDING", label: t("status.pending", "Pending") },
          { value: "CANCELLED", label: t("status.cancelled", "Cancelled") },
        ],
        flex: 1,
      },
      {
        name: "request_type",
        label: t("filters.requestType", "Request Type"),
        type: "enumeration",
        inputType: "select",
        placeholder: t("filters.allTypes", "All Types"),
        tooltipContent: t("filters.requestTypeTooltip", "Filter transactions by request type (Preauthorization, Authorization, Capture, Refund)"),
        options: [
          { value: "", label: t("filters.allTypes", "All Types") },
          { value: "preauthorization", label: t("requestType.preauthorization", "Preauthorization") },
          { value: "authorization", label: t("requestType.authorization", "Authorization") },
          { value: "capture", label: t("requestType.capture", "Capture") },
          { value: "refund", label: t("requestType.refund", "Refund") },
        ],
        flex: 1,
      },
      {
        name: "payment_method",
        label: t("filters.paymentMethod", "Payment Method"),
        type: "enumeration",
        inputType: "select",
        placeholder: t("filters.allMethods", "All Methods"),
        tooltipContent: t("filters.paymentMethodTooltip", "Filter transactions by payment method (Credit Card, PayPal, Google Pay, Apple Pay, Sofort Banking, SEPA Direct Debit)"),
        options: [
          { value: "", label: t("filters.allMethods", "All Methods") },
          { value: "credit_card", label: t("paymentMethod.creditCard", "Credit Card") },
          { value: "paypal", label: t("paymentMethod.paypal", "PayPal") },
          { value: "google_pay", label: t("paymentMethod.googlePay", "Google Pay") },
          { value: "apple_pay", label: t("paymentMethod.applePay", "Apple Pay") },
          { value: "sofort", label: t("paymentMethod.sofort", "Sofort Banking") },
          { value: "sepa", label: t("paymentMethod.sepa", "SEPA Direct Debit") },
        ],
        flex: 1,
      },
    ],
    [t]
  );

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        alignItems:"start"
      }}
    >
      {filterOptions.map((filter) => (
        <RenderInput
          key={filter.name}
          name={filter.name}
          value={filters[filter.name] ?? ""}
          onChange={(e) => {
            const raw =
              filter.inputType === "textInput"
                ? e.target.value
                : e.target?.value ?? e;
            const value = raw === "all" || raw === undefined ? "" : String(raw);
            handleFiltersChange({ [filter.name]: value });
          }}
          inputType={filter.inputType}
          label={filter.label}
          placeholder={filter.placeholder}
          tooltipContent={filter.tooltipContent}
          options={filter.options}
        />
      ))}

      <RenderInput
        name="date_from"
        value={filters.date_from || ""}
        onChange={(e) => handleFiltersChange({ date_from: e.target.value })}
        inputType="dateInput"
        label={t("filters.dateFrom", "Date From")}
        tooltipContent={t("filters.dateFromTooltip", "Filter transactions from this date onwards. Select the starting date for the date range filter.")}
      />

      <RenderInput
        name="date_to"
        value={filters.date_to || ""}
        onChange={(e) => handleFiltersChange({ date_to: e.target.value })}
        inputType="dateInput"
        label={t("filters.dateTo", "Date To")}
        tooltipContent={t("filters.dateToTooltip", "Filter transactions up to this date. Select the ending date for the date range filter.")}
      />

      <ImportExportBar
        filters={filters}
        handleReset={handleReset}
        onImportDone={loadTransactionHistory}
      />
    </Box>
  );
};

export default FiltersPanel;
