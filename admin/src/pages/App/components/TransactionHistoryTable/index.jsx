import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Typography,
  Button,
  Flex,
} from "@strapi/design-system";
import { User, File, ArrowUp, ArrowDown } from "@strapi/icons";
import StatusBadge from "../StatusBadge";
import CustomerInfoPopover from "../CustomerInfoPopover";
import RawDataPopover from "../RawDataPopover";
import TransactionHistoryTableFilters from "./TransactionHistoryTableFilters";
import TransactionHistoryTablePagination from "./TransactionHistoryTablePagination";

const TransactionHistoryTable = ({
  transactions,
  isLoading,
  filters,
  onFilterChange,
  onFilterApply,
  sorting,
  onSort,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const SortableHeader = ({ column, label, sortable = true }) => {
    const isActive = sorting?.sortBy === column;
    const sortOrder = isActive ? sorting?.sortOrder : null;

    const handleClick = () => {
      if (sortable && onSort) {
        onSort(column);
      }
    };

    return (
      <Th>
        <Flex
          alignItems="center"
          gap={2}
          onClick={handleClick}
          style={{ cursor: sortable ? "pointer" : "default" }}
        >
          <Typography fontWeight="bold" textColor="primary500">
            {label}
          </Typography>
          {sortable && (
            <Box style={{ display: "flex", alignItems: "center" }}>
              {sortOrder === "asc" && <ArrowUp size={8} />}
              {sortOrder === "desc" && <ArrowDown size={8} />}
              {!isActive && (
                <Box style={{ opacity: 0.3 }}>
                  <ArrowUp size={8} />
                </Box>
              )}
            </Box>
          )}
        </Flex>
      </Th>
    );
  };
  const getCardTypeName = (cardtype) => {
    switch (cardtype) {
      case "V":
        return "Visa";
      case "M":
        return "MasterCard";
      default:
        return cardtype || "";
    }
  };

  const getPaymentMethodName = (clearingtype, wallettype, cardtype) => {
    switch (clearingtype) {
      case "cc":
        const cardTypeName = getCardTypeName(cardtype);
        return cardTypeName ? `CC / ${cardTypeName}` : "Credit Card";
      case "sb":
        return "Online Banking";
      case "wlt":
        return wallettype === "PPE" ? "PayPal" : "Wallet";
      case "elv":
        return "Direct Debit (SEPA)";
      default:
        return "Unknown";
    }
  };

  const formatAmount = (amount, currency) => {
    return `${(amount / 100).toFixed(2)} ${currency}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      {/* Table Filters */}
      <TransactionHistoryTableFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onFilterApply={onFilterApply}
        isLoading={isLoading}
      />


      <Box style={{ maxHeight: "600px", overflow: "auto", marginBottom: "1rem" }}>
        <Table colCount={6} rowCount={transactions.length}>
          <Thead>
            <Tr>
              <SortableHeader column="amount" label="Amount" />
              <SortableHeader column="created_at" label="Created At" />
              <SortableHeader column="status" label="Status" />
              <SortableHeader column="reference" label="Reference" />
              <SortableHeader column="method" label="Method" />
              <Th>
                <Typography fontWeight="bold" textColor="primary500">
                  Actions
                </Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.length === 0 && !isLoading ? (
              <Tr>
                <Td colSpan={6}>
                  <Box padding={6}>
                    <Typography textAlign="center" textColor="neutral600">
                      No transactions found
                    </Typography>
                  </Box>
                </Td>
              </Tr>
            ) : (
              transactions.map((transaction) => (
                <Tr key={transaction.id}>
                  <Td>
                    <Typography variant="pi" fontWeight="bold" textColor="primary600">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </Typography>
                  </Td>
                  <Td>
                    <Typography variant="pi" textColor="neutral800">
                      {formatDate(transaction.created_at)}
                    </Typography>
                  </Td>
                  <Td>
                    <StatusBadge status={transaction.status} transaction={transaction} />
                  </Td>
                  <Td>
                    <Typography variant="pi" textColor="neutral800">
                      {transaction.reference}
                    </Typography>
                  </Td>
                  <Td>
                    <Typography variant="pi" textColor="neutral800">
                      {getPaymentMethodName(
                        transaction.raw_request?.clearingtype,
                        transaction.raw_request?.wallettype,
                        transaction.raw_request?.cardtype
                      )}
                    </Typography>
                  </Td>
                  <Td>
                    <Flex gap={2} justifyContent="flex-start">
                      <CustomerInfoPopover transaction={transaction}>
                        <Button
                          variant="secondary"
                          size="S"
                          startIcon={<User />}
                        >
                          View Customer
                        </Button>
                      </CustomerInfoPopover>
                      <RawDataPopover transaction={transaction}>
                        <Button
                          variant="secondary"
                          size="S"
                          startIcon={<File />}
                        >
                          View Raw Data
                        </Button>
                      </RawDataPopover>
                    </Flex>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      <TransactionHistoryTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default TransactionHistoryTable;

