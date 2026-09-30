import * as React from "react";
import { useNotification, useQueryParams } from "@strapi/strapi/admin";
import { usePayoneApi } from "../../api/payone.api";
import { DEFAULT_PAGE_SIZE, EMPTY_FILTERS } from "../../constants/transactions";

const pageFromQuery = (query) => ({
  page: parseInt(query?.page || "1", 10),
  pageSize: parseInt(query?.pageSize || String(DEFAULT_PAGE_SIZE), 10),
});

/** Transaction list with filters, query-string pagination and the transaction opened in the details view. */
export const useTransactionHistory = () => {
  const { toggleNotification } = useNotification();
  const { getTransactionHistory } = usePayoneApi();
  const [{ query }, setQuery] = useQueryParams();

  const [filters, setFilters] = React.useState(EMPTY_FILTERS);
  const [pagination, setPagination] = React.useState({ ...pageFromQuery(query), pageCount: 1, total: 0 });
  const [transactionHistory, setTransactionHistory] = React.useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
  const [loadError, setLoadError] = React.useState(null);
  const [selectedTransaction, setSelectedTransaction] = React.useState(null);

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, ...pageFromQuery(query) }));
  }, [query?.page, query?.pageSize]);

  const loadTransactionHistory = async () => {
    setIsLoadingHistory(true);
    setLoadError(null);
    try {
      const response = await getTransactionHistory({ filters, pagination });
      const result = response?.data || response;
      const historyData = Array.isArray(result?.data) ? result.data : [];
      const paginationMeta = result?.meta?.pagination;

      const hasMeta = paginationMeta && paginationMeta.total !== undefined;
      setPagination((prev) => ({
        ...prev,
        pageCount: hasMeta ? paginationMeta.pageCount || 1 : Math.ceil(historyData.length / pagination.pageSize) || 1,
        total: hasMeta ? paginationMeta.total || 0 : historyData.length,
      }));
      setTransactionHistory(historyData);
    } catch (error) {
      console.error("Error loading transaction history:", error);
      setTransactionHistory([]);
      setPagination((prev) => ({ ...prev, pageCount: 1, total: 0 }));
      setLoadError(error);
      toggleNotification({ type: "danger", message: "Failed to load transaction history" });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  React.useEffect(() => {
    loadTransactionHistory();
  }, [
    filters.search,
    filters.status,
    filters.request_type,
    filters.payment_method,
    filters.date_from,
    filters.date_to,
    pagination.page,
    pagination.pageSize,
  ]);

  React.useEffect(() => {
    setSelectedTransaction(null);
  }, [filters, pagination.page]);

  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(selectedTransaction?.id === transaction?.id ? null : transaction);
  };

  const handleCloseDetails = () => setSelectedTransaction(null);

  /** Applies filter changes and returns to the first page so the results are never hidden on a later page. */
  const handleFiltersChange = (newFilters) => {
    if (!newFilters || typeof newFilters !== "object") return;
    setFilters((prev) => ({ ...prev, ...newFilters }));
    if (pagination.page !== 1) setQuery({ ...query, page: 1 });
  };

  return {
    transactions: Array.isArray(transactionHistory) ? transactionHistory : [],
    isLoadingHistory,
    loadError,
    selectedTransaction,
    handleTransactionSelect,
    handleCloseDetails,
    loadTransactionHistory,
    filters,
    handleFiltersChange,
    pagination,
  };
};
