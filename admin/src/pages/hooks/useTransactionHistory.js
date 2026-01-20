import * as React from "react";
import { useNotification, useQueryParams } from "@strapi/strapi/admin";
import usePayoneRequests from "../utils/api";

const PAGE_SIZE = 10;

const useTransactionHistory = () => {
  const { toggleNotification } = useNotification();
  const { getTransactionHistory } = usePayoneRequests();
  const [{ query }, setQuery] = useQueryParams();

  const [filters, setFilters] = React.useState({
    search: "",
    status: "",
    request_type: "",
    payment_method: "",
    date_from: "",
    date_to: "",
  });

  const [pagination, setPagination] = React.useState({
    page: parseInt(query?.page || "1", 10),
    pageSize: parseInt(query?.pageSize || String(PAGE_SIZE), 10),
    pageCount: 1,
    total: 0,
  });

  const [transactionHistory, setTransactionHistory] = React.useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState(null);

  React.useEffect(() => {
    const page = parseInt(query?.page || "1", 10);
    const pageSize = parseInt(query?.pageSize || String(PAGE_SIZE), 10);
    setPagination((prev) => ({
      ...prev,
      page,
      pageSize,
    }));
  }, [query?.page, query?.pageSize]);


  const loadTransactionHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await getTransactionHistory({
        filters,
        pagination
      });
      const result = response?.data || response;
      const historyData = Array.isArray(result?.data) ? result.data : [];
      const paginationMeta = result?.meta?.pagination;

      if (paginationMeta && paginationMeta.total !== undefined) {
        setPagination((prev) => ({
          ...prev,
          pageCount: paginationMeta.pageCount || 1,
          total: paginationMeta.total || 0,
        }));
      } else {
        const calculatedTotal = historyData.length;
        const calculatedPageCount = Math.ceil(calculatedTotal / pagination.pageSize) || 1;
        setPagination((prev) => ({
          ...prev,
          pageCount: calculatedPageCount,
          total: calculatedTotal,
        }));
      }

      setTransactionHistory(historyData);
    } catch (error) {
      console.error("Error loading transaction history:", error);
      setTransactionHistory([]);
      setPagination((prev) => ({
        ...prev,
        pageCount: 1,
        total: 0,
      }));
      toggleNotification({
        type: "danger",
        message: "Failed to load transaction history",
      });
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

  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(
      selectedTransaction?.id === transaction?.id ? null : transaction
    );
  };

  const handlePaginationChange = (newPagination) => {
    if (newPagination && typeof newPagination === "object") {
      const updatedQuery = {
        ...query,
        page: query.page || 1,
        pageSize: String(newPagination.pageSize || pagination.pageSize),
      };
      setQuery(updatedQuery, "push", false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    if (newFilters && typeof newFilters === "object") {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));
    }
  };

  React.useEffect(() => {
    setSelectedTransaction(null);
  }, [filters, pagination.page]);

  return {
    transactions: Array.isArray(transactionHistory) ? transactionHistory : [],
    isLoadingHistory,
    selectedTransaction,
    currentPage: pagination.page,
    totalPages: pagination.pageCount,
    totalCount: pagination.total,
    pageSize: pagination.pageSize,
    handleTransactionSelect,
    loadTransactionHistory,
    filters,
    handleFiltersChange,
    pagination,
    handlePaginationChange,
  };
};

export default useTransactionHistory;
