import React from "react";
import {
  Box,
  Button,
  TextInput,
  SingleSelect,
  SingleSelectOption,
  Typography,
} from "@strapi/design-system";
import { Refresh, Search } from "@strapi/icons";
import InfoTooltip from "../common/InfoTooltip";

const FiltersPanel = ({ filters, handleFiltersChange, isLoading }) => {
  const getDefaultDateFrom = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  };

  const getDefaultDateTo = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const handleReset = () => {
    handleFiltersChange({
      search: "",
      status: "",
      request_type: "",
      payment_method: "",
      date_from: getDefaultDateFrom(),
      date_to: getDefaultDateTo(),
    });
  };

  const handleFilterChange = (field, value) => {
    handleFiltersChange({ [field]: value });
  };

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        alignItems: "end",
      }}
    >
        <TextInput
          label="Search"
          name="search"
          value={filters?.search || ""}
        onChange={(e) => handleFilterChange("search", e.target.value)}
          placeholder="Search by reference or transaction ID"
        endAction={
          <InfoTooltip
            label="Search"
            description="Search by reference or transaction ID"
            id="search-tooltip"
        />
        }
      />

      <SingleSelect
        name="status"
        label="Status"
        value={filters?.status || ""}
        onChange={(value) => handleFilterChange("status", value)}
        placeholder="All Statuses"
        labelAction={
          <InfoTooltip
            label="Status"
            description="Filter transactions by status"
            id="status-tooltip"
          />
        }
      >
        <SingleSelectOption value="">All Statuses</SingleSelectOption>
        <SingleSelectOption value="APPROVED">Approved</SingleSelectOption>
        <SingleSelectOption value="ERROR">Error</SingleSelectOption>
        <SingleSelectOption value="REDIRECT">Redirect</SingleSelectOption>
        <SingleSelectOption value="INVALID">Invalid</SingleSelectOption>
        <SingleSelectOption value="PENDING">Pending</SingleSelectOption>
        <SingleSelectOption value="CANCELLED">Cancelled</SingleSelectOption>
      </SingleSelect>

      <SingleSelect
        name="request_type"
        label="Request Type"
        value={filters?.request_type || ""}
        onChange={(value) => handleFilterChange("request_type", value)}
        placeholder="All Types"
        labelAction={
          <InfoTooltip
            label="Request Type"
            description="Filter by payment request type"
            id="request_type-tooltip"
          />
        }
      >
        <SingleSelectOption value="">All Types</SingleSelectOption>
        <SingleSelectOption value="preauthorization">
          Preauthorization
        </SingleSelectOption>
        <SingleSelectOption value="authorization">
          Authorization
        </SingleSelectOption>
        <SingleSelectOption value="capture">Capture</SingleSelectOption>
        <SingleSelectOption value="refund">Refund</SingleSelectOption>
      </SingleSelect>

      <SingleSelect
        name="payment_method"
        label="Payment Method"
        value={filters?.payment_method || ""}
        onChange={(value) => handleFilterChange("payment_method", value)}
        placeholder="All Methods"
        labelAction={
          <InfoTooltip
            label="Payment Method"
            description="Filter by payment method"
            id="payment_method-tooltip"
          />
        }
      >
        <SingleSelectOption value="">All Methods</SingleSelectOption>
        <SingleSelectOption value="credit_card">Credit Card</SingleSelectOption>
        <SingleSelectOption value="paypal">PayPal</SingleSelectOption>
        <SingleSelectOption value="google_pay">Google Pay</SingleSelectOption>
        <SingleSelectOption value="apple_pay">Apple Pay</SingleSelectOption>
        <SingleSelectOption value="sofort">Sofort Banking</SingleSelectOption>
        <SingleSelectOption value="sepa">SEPA Direct Debit</SingleSelectOption>
      </SingleSelect>

      <TextInput
        label="Date From"
        name="date_from"
        type="date"
        value={filters?.date_from || ""}
        onChange={(e) => handleFilterChange("date_from", e.target.value)}
        placeholder="YYYY-MM-DD"
        endAction={
          <InfoTooltip
            label="Date From"
            description="Filter transactions from this date"
            id="date_from-tooltip"
          />
        }
      />

      <TextInput
        label="Date To"
        name="date_to"
        type="date"
        value={filters?.date_to || ""}
        onChange={(e) => handleFilterChange("date_to", e.target.value)}
        placeholder="YYYY-MM-DD"
        endAction={
          <InfoTooltip
            label="Date To"
            description="Filter transactions until this date"
            id="date_to-tooltip"
          />
        }
      />

      <Button
        variant="secondary"
        onClick={handleReset}
        startIcon={<Refresh />}
        loading={isLoading}
        size="S"
        maxWidth="100px"
      >
        Reset
      </Button>
    </Box>
  );
};

export default FiltersPanel;
