import { useState, useEffect } from "react";
import { useNotification } from "@strapi/helper-plugin";
import payoneRequests from "../utils/api";

const PAGE_SIZE = 10;

const useTransactionHistory = () => {
  const toggleNotification = useNotification();
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    request_type: "",
    txid: "",
    reference: "",
    date_from: "",
    date_to: ""
  });

  useEffect(() => {
    loadTransactionHistory();
  }, []);

  const loadTransactionHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const result = await payoneRequests.getTransactionHistory(filters);
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

  // Pagination calculations
  const totalPages = Math.ceil(transactionHistory.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedTransactions = transactionHistory.slice(startIndex, endIndex);

  return {
    transactionHistory,
    paginatedTransactions,
    isLoadingHistory,
    selectedTransaction,
    filters,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    handleFilterChange,
    handleFilterApply,
    handleTransactionSelect,
    handlePageChange,
    loadTransactionHistory
  };
};

export default useTransactionHistory;

