import * as React from "react";
import { Box, Checkbox, Flex, MenuItem, SimpleMenu } from "@strapi/design-system";
import { Pagination, Table } from "@strapi/strapi/admin";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { PAGE_SIZE_OPTIONS } from "../../../constants/transactions";
import { useColumnVisibility } from "../useColumnVisibility";
import { TransactionCell } from "./TransactionCell";

const COLUMNS = [
  { name: "order", labelKey: "table.order", label: "Order" },
  { name: "type", labelKey: "table.type", label: "Type" },
  { name: "paymentMethod", labelKey: "table.paymentMethod", label: "Payment Method" },
  { name: "amount", labelKey: "table.amount", label: "Amount" },
  { name: "status", labelKey: "table.status", label: "Status" },
  { name: "created_at", labelKey: "table.createdAt", label: "Created At" },
  { name: "updated_at", labelKey: "table.updatedAt", label: "Updated At", hiddenByDefault: true },
  { name: "details", labelKey: "table.details", label: "Details" },
];

/** Paginated transaction list; a row click or the eye button opens the details view. */
export const TransactionTable = ({ history, toolbar }) => {
  const { t } = usePluginTranslations();
  const { transactions, isLoadingHistory, pagination, handleTransactionSelect } = history;

  const headers = React.useMemo(
    () => COLUMNS.map((column) => ({ name: column.name, label: t(column.labelKey, column.label), hiddenByDefault: column.hiddenByDefault })),
    [t]
  );
  const { visibleColumns, toggleableHeaders, visibleHeaders, toggleColumn, showAllColumns } = useColumnVisibility(headers);

  const renderColumnMenu = () => (
    <SimpleMenu label={t("table.columns", "Columns")} id="transaction-table-columns-menu" variant="tertiary" size="S">
      {toggleableHeaders.map((header) => (
        <MenuItem
          key={header.name}
          onSelect={(e) => {
            e.preventDefault();
            toggleColumn(header.name);
          }}
        >
          <Flex alignItems="center" gap={2}>
            <Checkbox aria-label={header.label} checked={!!visibleColumns[header.name]} onCheckedChange={() => toggleColumn(header.name)} />
            <span>{header.label}</span>
          </Flex>
        </MenuItem>
      ))}
      <MenuItem onSelect={showAllColumns}>{t("table.showAllColumns", "Show all columns")}</MenuItem>
    </SimpleMenu>
  );

  return (
    <Box background="neutral0" hasRadius shadow="tableShadow">
      <Flex justifyContent="space-between" alignItems="center" gap={3} padding={4} wrap="wrap">
        {toolbar}
        {renderColumnMenu()}
      </Flex>

      <Table.Root rows={transactions} headers={visibleHeaders} isLoading={isLoadingHistory}>
        <Table.Content>
          <Table.Head>
            {visibleHeaders.map((header) => (
              <Table.HeaderCell key={header.name} name={header.name} label={header.name === "details" ? "" : header.label} />
            ))}
          </Table.Head>
          <Table.Body>
            <Table.Loading />
            <Table.Empty />
            {transactions.map((transaction) => (
              <Table.Row key={transaction.id} onClick={() => handleTransactionSelect(transaction)} style={{ cursor: "pointer" }}>
                {visibleHeaders.map((header) => (
                  <Table.Cell key={`${transaction.id}-${header.name}`}>
                    <TransactionCell column={header.name} transaction={transaction} onOpenDetails={handleTransactionSelect} />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.Root>

      {transactions.length > 0 && (
        <Box padding={4}>
          <Pagination.Root pageCount={pagination.pageCount} defaultPage={pagination.page} defaultPageSize={pagination.pageSize} total={pagination.total}>
            <Pagination.PageSize options={PAGE_SIZE_OPTIONS} />
            <Pagination.Links boundaryCount={1} siblingCount={1} />
          </Pagination.Root>
        </Box>
      )}
    </Box>
  );
};
