import React from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Stack,
  Typography,
  TextInput,
  Divider
} from "@strapi/design-system";
import { Search } from "@strapi/icons";
import TransactionHistoryItem from "./TransactionHistoryItem";

const HistoryPanel = ({
  filters,
  onFilterChange,
  onFilterApply,
  isLoadingHistory,
  transactionHistory,
  paginatedTransactions,
  currentPage,
  totalPages,
  pageSize,
  onRefresh,
  onPageChange
}) => {

  return (
    <Box
      className="payment-container"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
    >
      <Flex direction="column" alignItems="stretch" gap={8}>
        <Box>
          <Typography variant="beta" as="h2" className="payment-title" style={{ fontSize: '20px', marginBottom: '4px' }}>
            Transaction Management
          </Typography>
          <Typography variant="pi" textColor="neutral600" className="payment-subtitle" style={{ fontSize: '14px', marginTop: '4px' }}>
            View and filter all payment transactions processed through Payone
          </Typography>
        </Box>
        {/* Filters */}
        <Box>
          <Box marginBottom={4}>
            <Typography variant="delta" as="h3" fontWeight="bold">
              Transaction Filters
            </Typography>
            <Typography variant="pi" textColor="neutral600" marginTop={2}>
              Filter transactions by status, type, date range, and more
            </Typography>
          </Box>
          <Card className="payment-card">
            <CardBody padding={6}>
              <Stack spacing={4}>
                <Flex gap={4} wrap="wrap" alignItems="center">
                  <TextInput
                    label="Status"
                    name="status"
                    value={filters.status}
                    onChange={(e) => onFilterChange("status", e.target.value)}
                    placeholder="APPROVED, ERROR, etc."
                    className="payment-input"
                    style={{ flex: 1, minWidth: "200px" }}
                  />
                  <TextInput
                    label="Request Type"
                    name="request_type"
                    value={filters.request_type}
                    onChange={(e) =>
                      onFilterChange("request_type", e.target.value)
                    }
                    placeholder="preauthorization, authorization, etc."
                    className="payment-input"
                    style={{ flex: 1, minWidth: "200px" }}
                  />
                  <TextInput
                    label="Transaction ID"
                    name="txid"
                    value={filters.txid}
                    onChange={(e) => onFilterChange("txid", e.target.value)}
                    placeholder="Enter TxId"
                    className="payment-input"
                    style={{ flex: 1, minWidth: "200px" }}
                  />
                  <TextInput
                    label="Reference"
                    name="reference"
                    value={filters.reference}
                    onChange={(e) =>
                      onFilterChange("reference", e.target.value)
                    }
                    placeholder="Enter reference"
                    className="payment-input"
                    style={{ flex: 1, minWidth: "200px" }}
                  />
                  <TextInput
                    label="Date From"
                    name="date_from"
                    value={filters.date_from}
                    onChange={(e) =>
                      onFilterChange("date_from", e.target.value)
                    }
                    placeholder="YYYY-MM-DD"
                    type="date"
                    className="payment-input"
                    style={{ flex: 1, minWidth: "200px" }}
                  />
                  <TextInput
                    label="Date To"
                    name="date_to"
                    value={filters.date_to}
                    onChange={(e) => onFilterChange("date_to", e.target.value)}
                    placeholder="YYYY-MM-DD"
                    type="date"
                    className="payment-input"
                    style={{ flex: 1, minWidth: "200px" }}
                  />
                  <Button
                    variant="default"
                    onClick={onFilterApply}
                    loading={isLoadingHistory}
                    startIcon={<Search />}
                    className="payment-button payment-button-primary"
                  >
                    Apply Filters
                  </Button>
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        </Box>

        <Divider />

        {/* Transaction History */}
        <Box>
          <Box marginBottom={6}>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              marginBottom={4}
            >
              <Box>
                <Typography variant="delta" as="h3" fontWeight="bold">
                  Transaction History
                </Typography>
                <Typography variant="pi" textColor="neutral600" marginTop={2}>
                  {transactionHistory.length} total transactions •{" "}
                  {paginatedTransactions.length} on page {currentPage} of{" "}
                  {totalPages}
                </Typography>
              </Box>
              <Button
                variant="default"
                onClick={onRefresh}
                loading={isLoadingHistory}
                startIcon={<Search />}
                size="S"
                className="payment-button payment-button-success"
              >
                Refresh
              </Button>
            </Flex>
          </Box>

          {isLoadingHistory ? (
            <Box padding={4} textAlign="center">
              <Typography>Loading transactions...</Typography>
            </Box>
          ) : transactionHistory.length === 0 ? (
            <Box padding={4} textAlign="center">
              <Typography textColor="neutral600">
                No transactions found
              </Typography>
            </Box>
          ) : (
            <Box>
              {paginatedTransactions.map((transaction) => (
                <TransactionHistoryItem
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}

              {/* Pagination */}
              <Box paddingTop={6} paddingBottom={4}>
                <Card className="payment-card">
                  <CardBody padding={4}>
                    <Flex justifyContent="space-between" alignItems="center">
                      {transactionHistory.length > pageSize &&
                        totalPages > 1 ? (
                        <Flex gap={3} alignItems="center">
                          <Button
                            variant="default"
                            size="S"
                            onClick={() =>
                              onPageChange(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className={`payment-button ${currentPage === 1 ? '' : 'payment-button-success'}`}
                            style={{
                              background: currentPage === 1 ? "#f6f6f9" : undefined,
                              color: currentPage === 1 ? "#666687" : undefined
                            }}
                          >
                            ← Previous
                          </Button>

                          <Box
                            padding={2}
                            background="#f6f6f9"
                            borderRadius="6px"
                          >
                            <Typography
                              variant="pi"
                              textColor="neutral600"
                              fontWeight="bold"
                            >
                              Page {currentPage} of {totalPages}
                            </Typography>
                          </Box>

                          <Button
                            variant="default"
                            size="S"
                            onClick={() =>
                              onPageChange(
                                Math.min(totalPages, currentPage + 1)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className={`payment-button ${currentPage === totalPages ? '' : 'payment-button-success'}`}
                            style={{
                              background: currentPage === totalPages ? "#f6f6f9" : undefined,
                              color: currentPage === totalPages ? "#666687" : undefined
                            }}
                          >
                            Next →
                          </Button>
                        </Flex>
                      ) : (
                        <Typography
                          variant="pi"
                          textColor="neutral600"
                          fontWeight="medium"
                        >
                          {transactionHistory.length <= pageSize
                            ? "All transactions shown"
                            : "No pagination needed"}
                        </Typography>
                      )}
                    </Flex>
                  </CardBody>
                </Card>
                <Typography
                  variant="pi"
                  textColor="neutral600"
                  fontWeight="medium"
                >
                  Showing {paginatedTransactions.length} of{" "}
                  {transactionHistory.length} transactions
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Box paddingTop={4}>
          <Typography variant="sigma" textColor="neutral600">
            Note: This shows all Payone transactions processed through this
            plugin. Transactions are automatically logged with detailed
            request/response data.
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

export default HistoryPanel;
