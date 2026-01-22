import React from "react";
import { Box, Button, Flex, Typography, Tr, Td } from "@strapi/design-system";
import { Table } from "@strapi/helper-plugin";
import { ChevronDown, ChevronUp } from "@strapi/icons";

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

const TransactionTable = () => {
  const {
    transactions,
    isLoadingHistory,
    selectedTransaction,
    filters,
    handleFiltersChange,
    handleTransactionSelect,
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
        isLoading={isLoadingHistory}
      />
      <Box>
        <Table.Root
          colCount={9}
          rows={transactions}
          isLoading={isLoadingHistory}
          isFetching={isLoadingHistory}
        >
          <Table.Content footer={null}>
            <Table.Head>
              {headers.map((header) => (
                <Table.HeaderCell
                  fieldSchemaType="custom"
                  isSortable={true}
                  key={header.name}
                  label={header.label}
                  name={header.name}
                />
              ))}
            </Table.Head>
            <Table.Body>
              <Table.LoadingBody />
              {transactions.length === 0 && !isLoadingHistory && (
                <Tr>
                  <Td colSpan={9}>
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
                        <Td>
                          <Typography variant="pi" textColor="neutral600">
                            {transaction.txid || "N/A"}
                          </Typography>
                        </Td>
                        <Td>
                          <Typography variant="pi" fontWeight="medium">
                            {transaction.reference || "N/A"}
                          </Typography>
                        </Td>
                        <Td>
                          <Typography variant="pi" textColor="neutral600">
                            {formatAmount(
                              transaction.amount,
                              transaction.currency
                            )}
                          </Typography>
                        </Td>
                        <Td>
                          <Typography variant="pi">
                            {getPaymentMethodName(
                              transaction.raw_request?.clearingtype,
                              transaction.raw_request?.wallettype,
                              transaction.raw_request?.cardtype
                            )}
                          </Typography>
                        </Td>
                        <Td>
                          <Typography variant="pi" fontWeight="semiBold">
                            {transaction.request_type || "N/A"}
                          </Typography>
                        </Td>
                        <Td>
                          <StatusBadge
                            status={transaction?.status}
                            transaction={transaction}
                          />
                        </Td>
                        <Td>
                          <Typography variant="pi" textColor="neutral600">
                            {formatDate(transaction.created_at)}
                          </Typography>
                        </Td>
                        <Td>
                          <Typography variant="pi" textColor="neutral600">
                            {formatDate(transaction.updated_at)}
                          </Typography>
                        </Td>
                        <Td>
                          <Button
                            variant="tertiary"
                            size="S"
                            minWidth="100px"
                            startIcon={
                              isSelected ? <ChevronUp /> : <ChevronDown />
                            }
                            onClick={() => handleTransactionSelect(transaction)}
                          >
                            {isSelected ? "Hide" : "Details"}
                          </Button>
                        </Td>
                      </Tr>
                      {isSelected && (
                        <Tr>
                          <Td colSpan={9}>
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
