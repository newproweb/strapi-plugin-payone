import { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useNotification } from "@strapi/helper-plugin";
import payoneRequests from "../utils/api";

const PAGE_SIZE = 10;

const useTransactionHistory = () => {
  const toggleNotification = useNotification();
  const location = useLocation();
  const history = useHistory();

  const getDefaultDateFrom = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };

  const getDefaultDateTo = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const getQueryParams = () => {
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || String(PAGE_SIZE), 10);

    return { page, pageSize };
  };

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    request_type: "",
    payment_method: "",
    date_from: getDefaultDateFrom(),
    date_to: getDefaultDateTo(),
  });

  const initialQueryParams = getQueryParams();
  const [pagination, setPagination] = useState({
    page: initialQueryParams.page,
    pageSize: initialQueryParams.pageSize,
    pageCount: 1,
    total: 0,
  });

  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const loadTransactionHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await payoneRequests.getTransactionHistory({
        filters,
        pagination
      });

      if (response && response.data && response.pagination) {
        setTransactionHistory(response.data);
        setPagination(response.pagination);
      } else {
        setTransactionHistory([]);
        setPagination((prev) => ({
          ...prev,
          pageCount: 1,
          total: 0,
        }));
      }
    } catch (error) {
      console.error("Error loading transaction history:", error);
      setTransactionHistory([]);
      setPagination((prev) => ({
        ...prev,
        pageCount: 1,
        total: 0,
      }));
      toggleNotification({
        type: "warning",
        message: "Failed to load transaction history",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    const params = getQueryParams();
    setPagination((prev) => ({
      ...prev,
      page: params.page,
      pageSize: params.pageSize,
    }));
  }, [location.search]);

  useEffect(() => {
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
      const updatedQuery = new URLSearchParams(location.search);
      if (newPagination.page !== undefined) {
        updatedQuery.set('page', String(newPagination.page));
      }
      if (newPagination.pageSize !== undefined) {
        updatedQuery.set('pageSize', String(newPagination.pageSize));
        updatedQuery.set('page', '1');
      }
      history.push({ search: updatedQuery.toString() });
    }
  };

  const handleFiltersChange = (newFilters) => {
    if (newFilters && typeof newFilters === "object") {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));
      // Reset to first page when filters change
      const updatedQuery = new URLSearchParams(location.search);
      updatedQuery.set('page', '1');
      history.push({ search: updatedQuery.toString() });
    }
  };

  useEffect(() => {
    setSelectedTransaction(null);
  }, [filters, pagination.page]);

  return {
    transactions: Array.isArray(transactionHistory) ? transactionHistory : [],
    isLoadingHistory,
    selectedTransaction,
    handleTransactionSelect,
    loadTransactionHistory,
    filters,
    handleFiltersChange,
    pagination,
    handlePaginationChange,
  };
};

export default useTransactionHistory;

