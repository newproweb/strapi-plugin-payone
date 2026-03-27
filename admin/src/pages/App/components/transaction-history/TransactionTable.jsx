import React from "react";
import {
  Box,
  Button,
  Flex,
  Typography,
  Tr,
  Td,
  SimpleMenu,
  MenuItem,
  Checkbox,
} from "@strapi/design-system";
import { Table } from "@strapi/helper-plugin";
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Bell,
} from "@strapi/icons";

import StatusBadge from "../StatusBadge";
import FiltersPanel from "./FiltersPanel";
import TransactionDetails from "./details/TransactionDetails";
import TransactionTablePagination from "./TransactionTablePagination";
import useTransactionHistory from "../../../hooks/useTransactionHistory";
import {
  formatAmount,
  formatDate,
  getPaymentMethodName,
} from "../../../utils/transactionTableUtils";

const headers = [
  { name: "txid", label: "TxId", sortKey: "txid", sortable: true },
  {
    name: "reference",
    label: "Reference",
    sortKey: "reference",
    sortable: true,
  },
  { name: "amount", label: "Amount", sortKey: "amount", sortable: true },
  {
    name: "paymentMethod",
    label: "Payment Method",
    sortKey: null,
    sortable: false,
  },
  { name: "type", label: "Type", sortKey: "request_type", sortable: true },
  { name: "status", label: "Status", sortKey: "status", sortable: true },
  {
    name: "created_at",
    label: "Created At",
    sortKey: "createdAt",
    sortable: true,
  },
  {
    name: "updated_at",
    label: "Updated At",
    sortKey: "updatedAt",
    sortable: true,
  },
  { name: "details", label: "Details", sortKey: null, sortable: false },
];

const TransactionTable = () => {
  const [visibleColumns, setVisibleColumns] = React.useState(
    headers.reduce((acc, col) => {
      acc[col.name] = true;
      return acc;
    }, {}),
  );

  const {
    transactions,
    isLoadingHistory,
    selectedTransaction,
    filters,
    handleFiltersChange,
    handleTransactionSelect,
    pagination,
    sort,
    handleSort,
  } = useTransactionHistory();

  const toggleableHeaders = headers.filter(
    (header) => header.name !== "details",
  );
  const visibleHeaders = headers.filter(
    (header) => visibleColumns[header.name],
  );
  const visibleColumnCount = Math.max(visibleHeaders.length, 1);
  const areAllToggleableColumnsVisible = toggleableHeaders.every(
    (header) => visibleColumns[header.name],
  );

  const renderHeaderLabel = (header) => {
    const isSorted = header.sortKey && sort.sort_by === header.sortKey;
    const SortIcon =
      isSorted && sort.sort_order === "asc" ? ArrowUp : ArrowDown;

    if (!header.sortable || !header.sortKey) {
      return header.label;
    }

    return (
      <Flex
        alignItems="center"
        gap={1}
        onClick={() => handleSort(header.sortKey)}
        style={{ cursor: "pointer", userSelect: "none" }}
        title={`Sort by ${header.label}`}
      >
        <Typography variant="sigma" textColor="neutral600">
          {header.label}
        </Typography>
        {isSorted ? (
          <SortIcon width={12} height={12} />
        ) : (
          <Box width={12} height={12} aria-hidden />
        )}
      </Flex>
    );
  };

  const toggleColumn = (key) => {
    if (key === "details") {
      return;
    }

    setVisibleColumns((prev) => {
      const currentlyVisible = headers.filter(
        (header) => prev[header.name],
      ).length;
      const isTryingToHideLastColumn = prev[key] && currentlyVisible === 1;

      if (isTryingToHideLastColumn) {
        return prev;
      }

      return {
        ...prev,
        [key]: !prev[key],
      };
    });
  };

  const showAllColumns = () => {
    setVisibleColumns(
      headers.reduce((acc, col) => {
        acc[col.name] = true;
        return acc;
      }, {}),
    );
  };

  const renderCellContent = (headerName, transaction, isSelected) => {
    switch (headerName) {
      case "txid":
        return (
          <Typography variant="pi" textColor="neutral600">
            {transaction.txid || "N/A"}
          </Typography>
        );
      case "reference":
        return (
          <Typography variant="pi" fontWeight="medium">
            {transaction.reference || "N/A"}
          </Typography>
        );
      case "amount":
        return (
          <Typography variant="pi" textColor="neutral600">
            {formatAmount(transaction.amount, transaction.currency)}
          </Typography>
        );
      case "paymentMethod":
        return (
          <Typography variant="pi">
            {getPaymentMethodName(
              transaction.raw_request?.clearingtype ||
                transaction?.body?.raw_request?.clearingtype,
              transaction.raw_request?.wallettype ||
                transaction?.body?.raw_request?.wallettype,
              transaction.raw_request?.cardtype ||
                transaction?.body?.raw_request?.cardtype,
            )}
          </Typography>
        );
      case "type":
        return (
          <Typography variant="pi" fontWeight="semiBold">
            {transaction.request_type ||
              transaction?.body?.request_type ||
              "N/A"}
          </Typography>
        );
      case "status":
        return (
          <StatusBadge
            status={transaction.status || transaction?.body?.status}
            transaction={transaction}
          />
        );
      case "created_at":
        return (
          <Typography variant="pi" textColor="neutral600">
            {formatDate(transaction.createdAt ?? transaction.created_at)}
          </Typography>
        );
      case "updated_at":
        return (
          <Typography variant="pi" textColor="neutral600">
            {formatDate(transaction.updatedAt ?? transaction.updated_at)}
          </Typography>
        );

      case "details":
        return (
          <Button
            variant="tertiary"
            size="S"
            minWidth="100px"
            startIcon={isSelected ? <ChevronUp /> : <ChevronDown />}
            onClick={() => handleTransactionSelect(transaction)}
          >
            {isSelected ? "Hide" : "Details"}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Flex direction="column" alignItems="stretch" gap={4} minHeight={"800px"}>
      <FiltersPanel
        filters={filters}
        handleFiltersChange={handleFiltersChange}
        isLoading={isLoadingHistory}
      />

      <Flex
        justifyContent="flex-end"
        gap={3}
        alignItems="stretch"
        marginBottom={2}
        marginTop={4}
      >
        <SimpleMenu
          label="Actions"
          id={`actions-menu`}
          as={Button}
          onReachEnd={() => {}}
          variant="secondary"
        >
          {toggleableHeaders.map((header) => (
            <MenuItem
              to={undefined}
              href={undefined}
              onClick={() => toggleColumn(header.name)}
            >
              <Flex alignItems="center" gap={2}>
                <Checkbox
                  checked={visibleColumns[header.name]}
                  onChange={() => toggleColumn(header.name)}
                />
                <span>{header.label}</span>
              </Flex>
            </MenuItem>
          ))}
        </SimpleMenu>
      </Flex>

      <Box>
        <Table.Root
          colCount={visibleColumnCount}
          rows={transactions}
          isLoading={isLoadingHistory}
          isFetching={isLoadingHistory}
        >
          <Table.Content footer={null}>
            <Table.Head>
              {visibleHeaders.map((header) => (
                <Table.HeaderCell
                  fieldSchemaType="custom"
                  isSortable={header.sortable}
                  key={header.name}
                  label={renderHeaderLabel(header)}
                  name={header.name}
                />
              ))}
            </Table.Head>
            <Table.Body>
              <Table.LoadingBody />
              {transactions.length === 0 && !isLoadingHistory && (
                <Tr>
                  <Td colSpan={visibleColumnCount}>
                    <Box padding={6}>
                      <Typography textAlign="center" textColor="neutral600">
                        No transactions found
                      </Typography>
                    </Box>
                  </Td>
                </Tr>
              )}
              {transactions.length > 0 &&
                transactions.map((transaction) => {
                  const isSelected = selectedTransaction?.id === transaction.id;
                  return (
                    <React.Fragment key={transaction.id}>
                      <Tr>
                        {visibleHeaders.map((header) => (
                          <Td key={`${transaction.id}-${header.name}`}>
                            {renderCellContent(
                              header.name,
                              transaction,
                              isSelected,
                            )}
                          </Td>
                        ))}
                      </Tr>
                      {isSelected && (
                        <Tr>
                          <Td colSpan={visibleColumnCount}>
                            <TransactionDetails transaction={transaction} />
                          </Td>
                        </Tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </Table.Body>
          </Table.Content>
        </Table.Root>
      </Box>

      {transactions.length > 0 && (
        <TransactionTablePagination pageCount={pagination.pageCount} />
      )}
    </Flex>
  );
};

export default TransactionTable;
