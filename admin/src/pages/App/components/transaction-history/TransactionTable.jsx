import * as React from "react";
import {
  Typography,
  Box,
  Button,
  Flex,
  Checkbox,
  SimpleMenu,
  MenuItem,
  Accordion,
} from "@strapi/design-system";
import { Table, Pagination } from "@strapi/strapi/admin";
import { ChevronDownIcon, ChevronUpIcon } from "../icons";
import {
  formatAmount,
  formatDate,
  getPaymentMethodName,
} from "../../../utils/transactionTableUtils";
import TransactionDetails from "./details/TransactionDetails";
import FiltersPanel from "./FiltersPanel";
import useTransactionHistory from "../../../hooks/useTransactionHistory";
import StatusBadge from "../StatusBadge";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const TransactionTable = () => {
  const { t } = usePluginTranslations();
  const {
    transactions,
    isLoadingHistory,
    selectedTransaction,
    handleTransactionSelect,
    filters,
    handleFiltersChange,
    pagination,
    loadTransactionHistory,
  } = useTransactionHistory();

  const headers = React.useMemo(
    () => [
      { name: "txid", label: t("table.txid", "TxId") },
      { name: "reference", label: t("table.reference", "Reference") },
      { name: "amount", label: t("table.amount", "Amount") },
      { name: "paymentMethod", label: t("table.paymentMethod", "Payment Method") },
      { name: "type", label: t("table.type", "Type") },
      { name: "status", label: t("table.status", "Status") },
      { name: "created_at", label: t("table.createdAt", "Created At") },
      { name: "updated_at", label: t("table.updatedAt", "Updated At") },
      { name: "details", label: t("table.details", "Details") },
    ],
    [t]
  );

  const [visibleColumns, setVisibleColumns] = React.useState(() =>
    headers.reduce((acc, col) => {
      acc[col.name] = true;
      return acc;
    }, {})
  );

  React.useEffect(() => {
    setVisibleColumns((prev) =>
      headers.reduce((acc, col) => {
        acc[col.name] = prev[col.name] ?? true;
        return acc;
      }, {})
    );
  }, [headers]);

  const toggleableHeaders = React.useMemo(
    () => headers.filter((header) => header.name !== "details"),
    [headers]
  );

  const visibleHeaders = React.useMemo(
    () => headers.filter((header) => visibleColumns[header.name]),
    [headers, visibleColumns]
  );

  const visibleColumnCount = Math.max(visibleHeaders.length, 1);

  const toggleColumn = (key) => {
    if (key === "details") {
      return;
    }

    setVisibleColumns((prev) => {
      const currentlyVisibleToggleableCount = toggleableHeaders.filter(
        (header) => prev[header.name]
      ).length;

      const isTryingToHideLastToggleableColumn =
        prev[key] && currentlyVisibleToggleableCount === 1;

      if (isTryingToHideLastToggleableColumn) {
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
      }, {})
    );
  };

  const renderCellContent = (headerName, transaction, isSelected) => {
    switch (headerName) {
      case "txid":
        return (
          <Typography variant="pi" textColor="neutral600">
            {transaction.txid || t("table.na", "N/A")}
          </Typography>
        );
      case "reference":
        return (
          <Typography variant="pi" fontWeight="medium">
            {transaction.reference || t("table.na", "N/A")}
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
                transaction.body?.raw_request?.clearingtype,
              transaction.raw_request?.wallettype ||
                transaction.body?.raw_request?.wallettype,
              transaction.raw_request?.cardtype ||
                transaction.body?.raw_request?.cardtype
            )}
          </Typography>
        );
      case "type":
        return (
          <Typography variant="pi" fontWeight="semiBold">
            {transaction.request_type || transaction.body?.request_type || t("table.na", "N/A")}
          </Typography>
        );
      case "status":
        return (
          <StatusBadge
            status={transaction.status || transaction.body?.status}
            transaction={transaction}
          />
        );
      case "created_at":
        return (
          <Typography variant="pi" textColor="neutral600">
            {formatDate(transaction.created_at ?? transaction.createdAt)}
          </Typography>
        );
      case "updated_at":
        return (
          <Typography variant="pi" textColor="neutral600">
            {formatDate(transaction.updated_at ?? transaction.updatedAt)}
          </Typography>
        );
      case "details":
        return (
          <Button
            size="S"
            variant="tertiary"
            minWidth="100px"
            onClick={() => handleTransactionSelect(transaction)}
            startIcon={
              isSelected ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />
            }
          >
            {isSelected ? t("table.hide", "Hide") : t("table.details", "Details")}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Flex direction="column" alignItems="stretch" gap={4} minHeight={"800px"}>
   
    <Accordion.Root type="multiple">
      <Accordion.Item value="filters">
        <Accordion.Header>
          <Accordion.Trigger>Filters</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content style={{padding:"16px"}}>
          <FiltersPanel
            filters={filters}
            handleFiltersChange={handleFiltersChange}
            loadTransactionHistory={loadTransactionHistory}
          />
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
      <Flex
        justifyContent="flex-end"
        gap={3}
        alignItems="stretch"
        marginBottom={2}
        marginTop={4}
      >
        <SimpleMenu
          label={t("table.actions", "Actions")}
          id="transaction-table-actions-menu"
          onReachEnd={() => {}}
          variant="secondary"
        >
          {toggleableHeaders.map((header) => (
            <MenuItem
              key={header.name}
              onClick={(e) => {
                e?.preventDefault?.();
                toggleColumn(header.name);
              }}
            >
              <Flex alignItems="center" gap={2}>
                <span
                  onClick={(e) => {
                    e?.stopPropagation?.();
                  }}
                >
                  <Checkbox
                    name={`column-${header.name}`}
                    checked={visibleColumns[header.name]}
                    onCheckedChange={() => toggleColumn(header.name)}
                  />
                </span>
                <span>{header.label}</span>
              </Flex>
            </MenuItem>
          ))}
          <MenuItem
            onClick={(e) => {
              e?.preventDefault?.();
              showAllColumns();
            }}
          >
            {t("table.showAllColumns", "Show all columns")}
          </MenuItem>
        </SimpleMenu>
      </Flex>

      <Box>
        <Table.Root
          rows={transactions}
          headers={visibleHeaders}
          isLoading={isLoadingHistory}
        >
          <Table.Content>
            <Table.Head>
              {visibleHeaders.map((header) => (
                <Table.HeaderCell
                  key={header.name}
                  name={header.name}
                  label={header.label}
                />
              ))}
            </Table.Head>
            <Table.Body>
              <Table.Loading />
              <Table.Empty />
              {transactions.length > 0 &&
                transactions.map((transaction) => {
                  const isSelected = selectedTransaction?.id === transaction.id;
                  return (
                    <React.Fragment key={transaction.id}>
                      <Table.Row>
                        {visibleHeaders.map((header) => (
                          <Table.Cell key={`${transaction.id}-${header.name}`}>
                            {renderCellContent(header.name, transaction, isSelected)}
                          </Table.Cell>
                        ))}
                      </Table.Row>
                      {isSelected && (
                        <Table.Row>
                          <Table.Cell colSpan={visibleColumnCount}>
                            <TransactionDetails transaction={transaction} />
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </React.Fragment>
                  );
                })}
            </Table.Body>
          </Table.Content>
        </Table.Root>
      </Box>

      {transactions.length > 0 && (
        <Box paddingTop={6} paddingBottom={4}>
          <Pagination.Root
            pageCount={pagination.pageCount}
            defaultPage={pagination.page}
            defaultPageSize={pagination.pageSize}
            total={pagination.total}
          >
            <Pagination.PageSize options={["5", "10", "20", "50", "100"]} />
            <Pagination.Links boundaryCount={1} siblingCount={1} />
          </Pagination.Root>
        </Box>
      )}
    </Flex>
  );
};

export default TransactionTable;
