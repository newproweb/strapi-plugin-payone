import React from "react";
import {
  Box,
  Flex,
  Select,
  Option,
  Button,
  TextInput,
  Typography,
} from "@strapi/design-system";
import { Search } from "@strapi/icons";

const TransactionHistoryTableFilters = ({
  filters,
  onFilterChange,
  onFilterApply,
  isLoading,
}) => {
  const handleDateFromClick = (e) => {
    const input = e.target.closest('div')?.querySelector('input[type="date"]');
    if (input) {
      input.showPicker?.();
    }
  };

  const handleDateToClick = (e) => {
    const input = e.target.closest('div')?.querySelector('input[type="date"]');
    if (input) {
      input.showPicker?.();
    }
  };
  return (
    <Box marginBottom={2}>
      <Flex gap={3} marginBottom={3} alignItems="center">
        <TextInput
          label="Search"
          name="search"
          value={filters?.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
          placeholder="Search by Status, Transaction ID, or Reference"
          style={{ flex: 1, minWidth: "250px" }}
        />
        <Select
          label="Status"
          name="status"
          value={filters?.status || ""}
          onChange={(value) => onFilterChange("status", value)}
          placeholder="All Statuses"
          style={{ width: "180px", minWidth: "180px" }}
        >
          <Option value="">All Statuses</Option>
          <Option value="APPROVED">APPROVED</Option>
          <Option value="PENDING">PENDING</Option>
          <Option value="ERROR">ERROR</Option>
          <Option value="CANCELLED">CANCELLED</Option>
          <Option value="REDIRECT">REDIRECT</Option>
          <Option value="CREATED">CREATED</Option>
        </Select>
        <Select
          label="Request Type"
          name="request_type"
          value={filters?.request_type || ""}
          onChange={(value) => onFilterChange("request_type", value)}
          placeholder="Select request type"
          style={{ width: "220px", minWidth: "220px" }}
        >
          <Option value="">All Types</Option>
          <Option value="preauthorization">Preauthorization</Option>
          <Option value="authorization">Authorization</Option>
          <Option value="capture">Capture</Option>
          <Option value="refund">Refund</Option>
        </Select>
      </Flex>
      <Flex gap={3} marginBottom={3} alignItems="center">
        <Box onClick={handleDateFromClick} style={{ cursor: "pointer" }}>
          <TextInput
            label="Date From"
            name="date_from"
            value={filters?.date_from || ""}
            onChange={(e) => onFilterChange("date_from", e.target.value)}
            placeholder="YYYY-MM-DD"
            type="date"
            style={{ minWidth: "150px" }}
          />
        </Box>
        <Box onClick={handleDateToClick} style={{ cursor: "pointer" }}>
          <TextInput
            label="Date To"
            name="date_to"
            value={filters?.date_to || ""}
            onChange={(e) => onFilterChange("date_to", e.target.value)}
            placeholder="YYYY-MM-DD"
            type="date"
            style={{ minWidth: "150px" }}
          />
        </Box>
        <Typography variant="pi" textColor="neutral600" style={{ fontSize: "12px", marginTop: "20px" }}>
          By default, the last 30 days are shown
        </Typography>
      </Flex>
      <Button
        variant="default"
        onClick={onFilterApply}
        loading={isLoading}
        startIcon={<Search />}
      >
        Apply Filters
      </Button>
    </Box>
  );
};

export default TransactionHistoryTableFilters;
