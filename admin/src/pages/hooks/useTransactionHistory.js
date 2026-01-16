import { useState, useEffect } from "react";
import { useNotification } from "@strapi/helper-plugin";
import payoneRequests from "../utils/api";

const DEFAULT_PAGE_SIZE = 10;

const useTransactionHistory = () => {
  const toggleNotification = useNotification();
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  // Calculate default dates
  const getDefaultDateFrom = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };

  const getDefaultDateTo = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1); // Add 1 day to include today's transactions
    return date.toISOString().split('T')[0];
  };

  const [filters, setFilters] = useState({
    search: "",
    request_type: "",
    payment_method: "",
    date_from: getDefaultDateFrom(),
    date_to: getDefaultDateTo(),
    status: ""
  });

  const [sorting, setSorting] = useState({
    sortBy: null,
    sortOrder: null // 'asc' or 'desc'
  });

  useEffect(() => {
    loadTransactionHistory();
  }, []);

  const loadTransactionHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const params = { ...filters };
      if (sorting.sortBy && sorting.sortOrder) {
        params.sort_by = sorting.sortBy;
        params.sort_order = sorting.sortOrder;
      }
      const result = await payoneRequests.getTransactionHistory(params);
      setTransactionHistory(result.data || []);
      setCurrentPage(1);
    } catch (error) {
      toggleNotification({
        type: "warning",
        message: "Failed to load transaction history"
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilterApply = () => {
    loadTransactionHistory();
  };

  const handleSort = (column) => {
    setSorting((prev) => {
      // If clicking the same column, cycle through: null -> asc -> desc -> null
      if (prev.sortBy === column) {
        if (!prev.sortOrder) {
          return { sortBy: column, sortOrder: "asc" };
        } else if (prev.sortOrder === "asc") {
          return { sortBy: column, sortOrder: "desc" };
        } else {
          return { sortBy: null, sortOrder: null };
        }
      } else {
        // If clicking a different column, reset and set new column to asc
        return { sortBy: column, sortOrder: "asc" };
      }
    });
  };

  // Reload when sorting changes (but not on initial mount)
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    // Only reload if sorting is actually set or cleared
    loadTransactionHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting.sortBy, sorting.sortOrder]);

  const handleTransactionSelect = (transaction) => {
    if (selectedTransaction?.id === transaction?.id) {
      setSelectedTransaction(null);
    } else {
      setSelectedTransaction(transaction);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedTransaction(null);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
    setSelectedTransaction(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(transactionHistory.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = transactionHistory.slice(startIndex, endIndex);

  return {
    transactionHistory,
    paginatedTransactions,
    isLoadingHistory,
    selectedTransaction,
    filters,
    sorting,
    currentPage,
    totalPages,
    pageSize,
    handleFilterChange,
    handleFilterApply,
    handleSort,
    handleTransactionSelect,
    handlePageChange,
    handlePageSizeChange,
    loadTransactionHistory
  };
};

export default useTransactionHistory;

