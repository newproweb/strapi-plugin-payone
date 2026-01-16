import React, { useState } from "react";
import {
  Box,
  Flex,
  Button,
  TextInput,
  Typography,
  Select,
  Option,
} from "@strapi/design-system";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "@strapi/icons";

const TransactionHistoryTablePagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading,
}) => {
  const [pageInput, setPageInput] = useState(currentPage.toString());

  // Update input when currentPage changes externally
  React.useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputChange = (e) => {
    const value = e.target.value;
    // Allow empty input or valid numbers
    if (value === "" || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputBlur = () => {
    const pageNum = parseInt(pageInput, 10);
    if (pageNum && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      // Reset to current page if invalid
      setPageInput(currentPage.toString());
    }
  };

  const handlePageInputKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePageInputBlur();
    }
  };

  const goToFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const goToLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Box>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        gap={4}
        wrap="wrap"
      >
        <Flex alignItems="center" gap={2}>
          <Typography variant="pi" textColor="neutral600">
            {totalItems > 0
              ? `Showing ${startItem}-${endItem} of ${totalItems} transactions`
              : `No transactions`}
          </Typography>
          <Flex alignItems="center" gap={2}>
            <Typography variant="pi" textColor="neutral600">
              Page size:
            </Typography>
            <Select
              value={pageSize.toString()}
              onChange={(value) => onPageSizeChange(parseInt(value, 10))}
              disabled={isLoading}
              style={{ width: "80px", minWidth: "80px" }}
            >
              <Option value="10">10</Option>
              <Option value="20">20</Option>
              <Option value="30">30</Option>
              <Option value="50">50</Option>
              <Option value="100">100</Option>
            </Select>
          </Flex>
        </Flex>

        {totalPages > 1 && (
          <Flex alignItems="center" gap={2}>
            <Button
              variant="tertiary"
              onClick={goToFirstPage}
              disabled={currentPage === 1 || isLoading}
              startIcon={<ChevronLeft />}
              size="S"
            >
              First
            </Button>

            <Button
              variant="tertiary"
              onClick={goToPreviousPage}
              disabled={currentPage === 1 || isLoading}
              startIcon={<ArrowLeft />}
              size="S"
            >
              Prev
            </Button>

            <Flex alignItems="center" gap={2}>
              <Typography variant="pi" textColor="neutral600">
                Page
              </Typography>
              <TextInput
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
                onKeyPress={handlePageInputKeyPress}
                disabled={isLoading}
                aria-label="Page number"
                style={{ width: "60px", textAlign: "center" }}
              />
              <Typography variant="pi" textColor="neutral600">
                of {totalPages}
              </Typography>
            </Flex>

            <Button
              variant="tertiary"
              onClick={goToNextPage}
              disabled={currentPage === totalPages || isLoading}
              endIcon={<ArrowRight />}
              size="S"
            >
              Next
            </Button>

            <Button
              variant="tertiary"
              onClick={goToLastPage}
              disabled={currentPage === totalPages || isLoading}
              endIcon={<ChevronRight />}
              size="S"
            >
              Last
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default TransactionHistoryTablePagination;

