import React, { useState, useEffect } from "react";
import { useNotification, useFetchClient } from "@strapi/helper-plugin";
import {
  Layout,
  HeaderLayout,
  ContentLayout,
  Box,
  Button,
  Tabs,
  Tab,
  TabGroup,
  TabPanels,
  TabPanel,
  Typography
} from "@strapi/design-system";
import { Check } from "@strapi/icons";
import payoneRequests from "../utils/api";
import ConfigurationPanel from "./components/ConfigurationPanel";
import HistoryPanel from "./components/HistoryPanel";
import PaymentActionsPanel from "./components/PaymentActionsPanel";

const App = () => {
  const toggleNotification = useNotification();
  const { get, put } = useFetchClient();

  const [settings, setSettings] = useState({
    aid: "",
    portalid: "",
    mid: "",
    key: "",
    mode: "test",
    api_version: "3.10"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Transaction Management state
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    request_type: "",
    txid: "",
    reference: "",
    date_from: "",
    date_to: ""
  });

  // Payment Actions state
  const [paymentAmount, setPaymentAmount] = useState("1000");
  const [preauthReference, setPreauthReference] = useState("");
  const [authReference, setAuthReference] = useState("");
  const [captureTxid, setCaptureTxid] = useState("");
  const [refundTxid, setRefundTxid] = useState("");
  const [refundSequenceNumber, setRefundSequenceNumber] = useState("2");
  const [refundReference, setRefundReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cc");
  const [captureMode, setCaptureMode] = useState("full"); // full, partial


  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadSettings();
    loadTransactionHistory();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(transactionHistory.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = transactionHistory.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedTransaction(null);
  };

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data } = await get(`/payone-provider/settings`);
      if (data?.data) setSettings(data.data);
    } catch (error) {
      toggleNotification({
        type: "warning",
        message: "Failed to load settings"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await put(`/payone-provider/settings`, settings);
      toggleNotification({
        type: "success",
        message: "Settings saved successfully"
      });
    } catch (error) {
      toggleNotification({
        type: "warning",
        message: "Failed to save settings"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const response = await payoneRequests.testConnection();
      if (response.data) {
        const result = response.data;
        setTestResult(result);
        if (result.success !== undefined) {
          toggleNotification({
            type: Boolean(result.success) ? "success" : "warning",
            message: result.message || "Test completed"
          });
        }
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      toggleNotification({
        type: "warning",
        message: "Failed to test connection"
      });
      setTestResult({
        success: false,
        message:
          "Failed to test connection. Please check your network and server logs for details.",
        details: {
          errorCode: "NETWORK",
          rawResponse: error.message || "Network error"
        }
      });
    } finally {
      setIsTesting(false);
    }
  };

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

  const handlePreauthorization = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
      const params = {
        amount: parseInt(paymentAmount),
        currency: "EUR",
        reference: preauthReference || `PREAUTH-${Date.now()}`,
        clearingtype: "cc",
        cardtype: "V",
        cardpan: "4111111111111111",
        cardexpiredate: "2512",
        cardcvc2: "123",
        firstname: "John",
        lastname: "Doe",
        street: "Test Street 123",
        zip: "12345",
        city: "Test City",
        country: "DE",
        email: "test@example.com",
        salutation: "Herr",
        gender: "m",
        telephonenumber: "01752345678",
        ip: "127.0.0.1",
        customer_is_present: "yes",
        language: "de"
      };
      const result = await payoneRequests.preauthorization(params);
      setPaymentResult(result);
      toggleNotification({
        type: "success",
        message: "Preauthorization completed successfully"
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.data?.Error?.ErrorMessage ||
        error.message ||
        "Preauthorization failed";
      setPaymentError(errorMessage);
      toggleNotification({
        type: "warning",
        message: "Preauthorization failed"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAuthorization = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
      const params = {
        amount: parseInt(paymentAmount),
        currency: "EUR",
        reference: authReference || `AUTH-${Date.now()}`,
        clearingtype: "cc",
        cardtype: "V",
        cardpan: "4111111111111111",
        cardexpiredate: "2512",
        cardcvc2: "123",
        firstname: "John",
        lastname: "Doe",
        street: "Test Street 123",
        zip: "12345",
        city: "Test City",
        country: "DE",
        email: "test@example.com",
        salutation: "Herr",
        gender: "m",
        telephonenumber: "01752345678",
        ip: "127.0.0.1",
        customer_is_present: "yes",
        language: "de"
      };
      const result = await payoneRequests.authorization(params);
      setPaymentResult(result);
      toggleNotification({
        type: "success",
        message: "Authorization completed successfully"
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.data?.Error?.ErrorMessage ||
        error.message ||
        "Authorization failed";
      setPaymentError(errorMessage);
      toggleNotification({ type: "warning", message: "Authorization failed" });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCapture = async () => {
    if (!captureTxid.trim()) {
      setPaymentError("Transaction ID is required for capture");
      return;
    }
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
      const params = {
        txid: captureTxid,
        amount: parseInt(paymentAmount),
        currency: "EUR"
      };
      const result = await payoneRequests.capture(params);
      setPaymentResult(result);
      toggleNotification({
        type: "success",
        message: "Capture completed successfully"
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.data?.Error?.ErrorMessage ||
        error.message ||
        "Capture failed";
      setPaymentError(errorMessage);
      toggleNotification({ type: "warning", message: "Capture failed" });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleRefund = async () => {
    if (!refundTxid.trim()) {
      setPaymentError("Transaction ID is required for refund");
      return;
    }
    setIsProcessingPayment(true);
    setPaymentError(null);
    setPaymentResult(null);
    try {
      const params = {
        txid: refundTxid,
        sequencenumber: parseInt(refundSequenceNumber),
        amount: -Math.abs(parseInt(paymentAmount)),
        currency: "EUR",
        reference: refundReference || `REFUND-${Date.now()}`
      };
      const result = await payoneRequests.refund(params);
      setPaymentResult(result);
      toggleNotification({
        type: "success",
        message: "Refund completed successfully"
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.data?.Error?.ErrorMessage ||
        error.message ||
        "Refund failed";
      setPaymentError(errorMessage);
      toggleNotification({ type: "warning", message: "Refund failed" });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <Layout>
      <HeaderLayout
        title={
          <Box>
            <Typography variant="alpha" as="h1" fontWeight="bold">
              Payone Provider
            </Typography>
            <Typography variant="pi" marginTop={2}>
              Configure your Payone integration and manage payment transactions
            </Typography>
          </Box>
        }
        primaryAction={
          activeTab === 0 ? (
            <Button
              loading={isSaving}
              onClick={handleSave}
              startIcon={<Check />}
              size="L"
              variant="default"
              style={{
                background: "#28a745",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600"
              }}
            >
              Save Configuration
            </Button>
          ) : null
        }
      />
      <ContentLayout>
        <Box padding={6}>
          <TabGroup
            label="Payone Provider Tabs"
            onTabChange={(index) => setActiveTab(index)}
          >
            <Tabs style={{ borderBottom: "2px solid #f6f6f9" }}>
              <Tab
                style={{
                  fontWeight: activeTab === 0 ? "600" : "400",
                  color: activeTab === 0 ? "#4945ff" : "#666687"
                }}
              >
                Configuration
              </Tab>
              <Tab style={{ fontWeight: activeTab === 1 ? "600" : "400" }}>
                Transaction History
              </Tab>
              <Tab
                style={{
                  fontWeight: activeTab === 2 ? "600" : "400",
                  color: activeTab === 2 ? "#4945ff" : "#666687"
                }}
              >
                Payment Actions
              </Tab>
            </Tabs>
            <TabPanels>
              <TabPanel>
                <ConfigurationPanel
                  settings={settings}
                  isSaving={isSaving}
                  isTesting={isTesting}
                  testResult={testResult}
                  onSave={handleSave}
                  onTestConnection={handleTestConnection}
                  onInputChange={handleInputChange}
                />
              </TabPanel>

              <TabPanel>
                <HistoryPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onFilterApply={handleFilterApply}
                  isLoadingHistory={isLoadingHistory}
                  transactionHistory={transactionHistory}
                  paginatedTransactions={paginatedTransactions}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onRefresh={loadTransactionHistory}
                  onPageChange={handlePageChange}
                  selectedTransaction={selectedTransaction}
                  onTransactionSelect={handleTransactionSelect}
                />
              </TabPanel>

              <TabPanel>
                <PaymentActionsPanel
                  paymentAmount={paymentAmount}
                  setPaymentAmount={setPaymentAmount}
                  preauthReference={preauthReference}
                  setPreauthReference={setPreauthReference}
                  authReference={authReference}
                  setAuthReference={setAuthReference}
                  captureTxid={captureTxid}
                  setCaptureTxid={setCaptureTxid}
                  setCaptureMode={setCaptureMode}
                  captureMode={captureMode}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  refundTxid={refundTxid}
                  setRefundTxid={setRefundTxid}
                  refundSequenceNumber={refundSequenceNumber}
                  setRefundSequenceNumber={setRefundSequenceNumber}
                  refundReference={refundReference}
                  setRefundReference={setRefundReference}
                  isProcessingPayment={isProcessingPayment}
                  paymentError={paymentError}
                  paymentResult={paymentResult}
                  onPreauthorization={handlePreauthorization}
                  onAuthorization={handleAuthorization}
                  onCapture={handleCapture}
                  onRefund={handleRefund}
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </Box>
      </ContentLayout>
    </Layout>
  );
};

export default App;