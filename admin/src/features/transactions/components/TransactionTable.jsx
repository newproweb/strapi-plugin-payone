import * as React from "react";
import { Accordion, Box, Checkbox, Flex, MenuItem, SimpleMenu } from "@strapi/design-system";
import { Pagination, Table } from "@strapi/strapi/admin";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { PAGE_SIZE_OPTIONS } from "../../../constants/transactions";
import { useTransactionHistory } from "../useTransactionHistory";
import { useColumnVisibility } from "../useColumnVisibility";
import { FiltersPanel } from "./FiltersPanel";
import { TransactionCell } from "./TransactionCell";
import { TransactionDetails } from "./TransactionDetails";

const COLUMNS = [
  { name: "txid", labelKey: "table.txid", label: "TxId" },
  { name: "reference", labelKey: "table.reference", label: "Reference" },
  { name: "amount", labelKey: "table.amount", label: "Amount" },
  { name: "paymentMethod", labelKey: "table.paymentMethod", label: "Payment Method" },
  { name: "type", labelKey: "table.type", label: "Type" },
  { name: "status", labelKey: "table.status", label: "Status" },
  { name: "created_at", labelKey: "table.createdAt", label: "Created At" },
  { name: "updated_at", labelKey: "table.updatedAt", label: "Updated At" },
  { name: "details", labelKey: "table.details", label: "Details" },
];

export const TransactionTable = () => {
  const { t } = usePluginTranslations();
  const history = useTransactionHistory();
  const { transactions, isLoadingHistory, selectedTransaction, handleTransactionSelect, pagination } = history;

  const headers = React.useMemo(() => COLUMNS.map((column) => ({ name: column.name, label: t(column.labelKey, column.label) })), [t]);
  const { visibleColumns, toggleableHeaders, visibleHeaders, toggleColumn, showAllColumns } = useColumnVisibility(headers);

  const preventDefault = (handler) => (e) => {
    e?.preventDefault?.();
    handler();
  };

  const renderColumnMenu = () => (
    <Flex justifyContent="flex-end" gap={3} alignItems="stretch" marginBottom={2} marginTop={4}>
      <SimpleMenu label={t("table.actions", "Actions")} id="transaction-table-actions-menu" variant="secondary">
        {toggleableHeaders.map((header) => (
          <MenuItem key={header.name} onClick={preventDefault(() => toggleColumn(header.name))}>
            <Flex alignItems="center" gap={2}>
              <span onClick={(e) => e?.stopPropagation?.()}>
                <Checkbox name={`column-${header.name}`} checked={visibleColumns[header.name]} onCheckedChange={() => toggleColumn(header.name)} />
              </span>
              <span>{header.label}</span>
            </Flex>
          </MenuItem>
        ))}
        <MenuItem onClick={preventDefault(showAllColumns)}>{t("table.showAllColumns", "Show all columns")}</MenuItem>
      </SimpleMenu>
    </Flex>
  );

  const renderRows = () =>
    transactions.map((transaction) => {
      const isSelected = selectedTransaction?.id === transaction.id;
      return (
        <React.Fragment key={transaction.id}>
          <Table.Row>
            {visibleHeaders.map((header) => (
              <Table.Cell key={`${transaction.id}-${header.name}`}>
                <TransactionCell column={header.name} transaction={transaction} isSelected={isSelected} onToggleDetails={handleTransactionSelect} />
              </Table.Cell>
            ))}
          </Table.Row>
          {isSelected && (
            <Table.Row>
              <Table.Cell colSpan={Math.max(visibleHeaders.length, 1)}>
                <TransactionDetails transaction={transaction} />
              </Table.Cell>
            </Table.Row>
          )}
        </React.Fragment>
      );
    });

  return (
    <Flex direction="column" alignItems="stretch" gap={4} minHeight="800px">
      <Accordion.Root type="multiple">
        <Accordion.Item value="filters">
          <Accordion.Header>
            <Accordion.Trigger>Filters</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content style={{ padding: "16px" }}>
            <FiltersPanel
              filters={history.filters}
              handleFiltersChange={history.handleFiltersChange}
              loadTransactionHistory={history.loadTransactionHistory}
            />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      {renderColumnMenu()}

      <Box>
        <Table.Root rows={transactions} headers={visibleHeaders} isLoading={isLoadingHistory}>
          <Table.Content>
            <Table.Head>
              {visibleHeaders.map((header) => (
                <Table.HeaderCell key={header.name} name={header.name} label={header.label} />
              ))}
            </Table.Head>
            <Table.Body>
              <Table.Loading />
              <Table.Empty />
              {renderRows()}
            </Table.Body>
          </Table.Content>
        </Table.Root>
      </Box>

      {transactions.length > 0 && (
        <Box paddingTop={6} paddingBottom={4}>
          <Pagination.Root pageCount={pagination.pageCount} defaultPage={pagination.page} defaultPageSize={pagination.pageSize} total={pagination.total}>
            <Pagination.PageSize options={PAGE_SIZE_OPTIONS} />
            <Pagination.Links boundaryCount={1} siblingCount={1} />
          </Pagination.Root>
        </Box>
      )}
    </Flex>
  );
};
