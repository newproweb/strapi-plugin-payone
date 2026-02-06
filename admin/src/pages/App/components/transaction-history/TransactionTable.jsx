import * as React from "react";
import { Typography, Box, Button, Flex } from "@strapi/design-system";
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

const TransactionTable = () => {
  const {
    transactions,
    isLoadingHistory,
    selectedTransaction,
    handleTransactionSelect,
    filters,
    handleFiltersChange,
    pagination,
  } = useTransactionHistory();

  const headers = [
    { name: "txid", label: "TxId" },
    { name: "reference", label: "Reference" },
    { name: "amount", label: "Amount" },
    { name: "paymentMethod", label: "Payment Method" },
    { name: "type", label: "Type" },
    { name: "status", label: "Status" },
    { name: "created_at", label: "Created At" },
    { name: "updated_at", label: "Updated At" },
    { name: "details", label: "Details" },
  ];

  return (
    <Flex direction="column" alignItems="stretch" gap={4} minHeight={"800px"}>
      <FiltersPanel
        filters={filters}
        handleFiltersChange={handleFiltersChange}
      />

      <Box>
        <Table.Root
          rows={transactions}
          headers={headers}
          isLoading={isLoadingHistory}
        >
          <Table.Content>
            <Table.Head>
              {headers.map((header) => (
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
                        <Table.Cell>
                          <Typography variant="pi" textColor="neutral600">
                            {transaction.txid || "N/A"}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="pi" fontWeight="medium">
                            {transaction.reference || "N/A"}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="pi" textColor="neutral600">
                            {formatAmount(
                              transaction.amount,
                              transaction.currency
                            )}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="pi">
                            {getPaymentMethodName(
                              (transaction.raw_request?.clearingtype || transaction.body?.raw_request?.clearingtype),
                              (transaction.raw_request?.wallettype || transaction.body?.raw_request?.wallettype)
                            )}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="pi" fontWeight="semiBold">
                            {transaction.request_type || "N/A"}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <StatusBadge status={transaction?.status} transaction={transaction} />
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="pi" textColor="neutral600">
                            {formatDate(transaction.created_at ?? transaction.createdAt)}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Typography variant="pi" textColor="neutral600">
                            {formatDate(transaction.updated_at ?? transaction.updatedAt)}
                          </Typography>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            size="S"
                            variant="tertiary"
                            minWidth="100px"
                            onClick={() => handleTransactionSelect(transaction)}
                            startIcon={
                              isSelected ? (
                                <ChevronUpIcon size={16} />
                              ) : (
                                <ChevronDownIcon size={16} />
                              )
                            }
                          >
                            {isSelected ? "Hide" : "Details"}
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                      {isSelected && (
                        <Table.Row>
                          <Table.Cell colSpan={10}>
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
