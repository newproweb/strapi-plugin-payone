import { Box, Button } from "@strapi/design-system";
import RenderInput from "../RenderInput";
import { ArrowsCounterClockwise } from "@strapi/icons";

const FiltersPanel = ({ filters, handleFiltersChange }) => {
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

  const filterOptions = [
    {
      name: "search",
      label: "Search",
      type: "text",
      inputType: "textInput",
      placeholder: "Search by reference or transaction ID",
      tooltipContent:
        "Search by reference or transaction ID to filter transactions",
      flex: 1,
    },
    {
      name: "status",
      label: "Status",
      type: "enumeration",
      inputType: "select",
      placeholder: "All Statuses",
      tooltipContent:
        "Filter transactions by their status (Approved, Error, Redirect, Invalid, Pending, Cancelled)",
      options: [
        { value: "", label: "All Statuses" },
        { value: "APPROVED", label: "Approved" },
        { value: "ERROR", label: "Error" },
        { value: "REDIRECT", label: "Redirect" },
        { value: "INVALID", label: "Invalid" },
        { value: "PENDING", label: "Pending" },
        { value: "CANCELLED", label: "Cancelled" },
      ],
      flex: 1,
    },
    {
      name: "request_type",
      label: "Request Type",
      type: "enumeration",
      inputType: "select",
      placeholder: "All Types",
      tooltipContent:
        "Filter transactions by request type (Preauthorization, Authorization, Capture, Refund)",
      options: [
        { value: "", label: "All Types" },
        { value: "preauthorization", label: "Preauthorization" },
        { value: "authorization", label: "Authorization" },
        { value: "capture", label: "Capture" },
        { value: "refund", label: "Refund" },
      ],
      flex: 1,
    },
    {
      name: "payment_method",
      label: "Payment Method",
      type: "enumeration",
      inputType: "select",
      placeholder: "All Methods",
      tooltipContent:
        "Filter transactions by payment method (Credit Card, PayPal, Google Pay, Apple Pay, Sofort Banking, SEPA Direct Debit)",
      options: [
        { value: "", label: "All Methods" },
        { value: "credit_card", label: "Credit Card" },
        { value: "paypal", label: "PayPal" },
        { value: "google_pay", label: "Google Pay" },
        { value: "apple_pay", label: "Apple Pay" },
        { value: "sofort", label: "Sofort Banking" },
        { value: "sepa", label: "SEPA Direct Debit" },
      ],
      flex: 1,
    },
  ];

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        alignItems: "end",
      }}
    >
      {filterOptions.map((filter) => (
        <RenderInput
          key={filter.name}
          name={filter.name}
          value={filters[filter.name] || ""}
          onChange={(e) => {
            const value =
              filter.inputType === "textInput"
                ? e.target.value
                : e.target?.value || e;
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
        label="Date From"
        tooltipContent="Filter transactions from this date onwards. Select the starting date for the date range filter."
      />

      <RenderInput
        name="date_to"
        value={filters.date_to || ""}
        onChange={(e) => handleFiltersChange({ date_to: e.target.value })}
        inputType="dateInput"
        label="Date To"
        tooltipContent="Filter transactions up to this date. Select the ending date for the date range filter."
      />

      <Button
        variant="secondary"
        onClick={handleReset}
        startIcon={<ArrowsCounterClockwise />}
        size="S"
        maxWidth="100px"
      >
        Reset
      </Button>
    </Box>
  );
};

export default FiltersPanel;
