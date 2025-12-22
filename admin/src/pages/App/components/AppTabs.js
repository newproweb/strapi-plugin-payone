import React from "react";
import { Tabs, Tab, TabGroup, TabPanels, TabPanel } from "@strapi/design-system";
import ConfigurationPanel from "./ConfigurationPanel";
import HistoryPanel from "./HistoryPanel";
import PaymentActionsPanel from "./PaymentActionsPanel";

const AppTabs = ({
  activeTab,
  setActiveTab,
  // Settings props
  settings,
  isSaving,
  isTesting,
  testResult,
  onSave,
  onTestConnection,
  onInputChange,
  // Transaction history props
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
  onPageChange,
  selectedTransaction,
  onTransactionSelect,
  // Payment actions props
  paymentActions
}) => {
  return (
    <TabGroup
      label="Payone Provider Tabs"
      onTabChange={(index) => setActiveTab(index)}
    >
      <Tabs style={{ borderBottom: "2px solid #e8e8ea" }}>
        <Tab
          className={`payment-tab ${activeTab === 0 ? 'payment-tab-active' : ''}`}
        >
          Configuration
        </Tab>
        <Tab
          className={`payment-tab ${activeTab === 1 ? 'payment-tab-active' : ''}`}
        >
          Transaction History
        </Tab>
        <Tab
          className={`payment-tab ${activeTab === 2 ? 'payment-tab-active' : ''}`}
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
            onSave={onSave}
            onTestConnection={onTestConnection}
            onInputChange={onInputChange}
          />
        </TabPanel>

        <TabPanel>
          <HistoryPanel
            filters={filters}
            onFilterChange={onFilterChange}
            onFilterApply={onFilterApply}
            isLoadingHistory={isLoadingHistory}
            transactionHistory={transactionHistory}
            paginatedTransactions={paginatedTransactions}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onRefresh={onRefresh}
            onPageChange={onPageChange}
            selectedTransaction={selectedTransaction}
            onTransactionSelect={onTransactionSelect}
          />
        </TabPanel>

        <TabPanel>
          <PaymentActionsPanel
            paymentAmount={paymentActions.paymentAmount}
            setPaymentAmount={paymentActions.setPaymentAmount}
            preauthReference={paymentActions.preauthReference}
            setPreauthReference={paymentActions.setPreauthReference}
            authReference={paymentActions.authReference}
            setAuthReference={paymentActions.setAuthReference}
            captureTxid={paymentActions.captureTxid}
            setCaptureTxid={paymentActions.setCaptureTxid}
            refundTxid={paymentActions.refundTxid}
            setRefundTxid={paymentActions.setRefundTxid}
            refundSequenceNumber={paymentActions.refundSequenceNumber}
            setRefundSequenceNumber={paymentActions.setRefundSequenceNumber}
            refundReference={paymentActions.refundReference}
            setRefundReference={paymentActions.setRefundReference}
            paymentMethod={paymentActions.paymentMethod}
            setPaymentMethod={paymentActions.setPaymentMethod}
            captureMode={paymentActions.captureMode}
            setCaptureMode={paymentActions.setCaptureMode}
            isProcessingPayment={paymentActions.isProcessingPayment}
            paymentError={paymentActions.paymentError}
            paymentResult={paymentActions.paymentResult}
            onPreauthorization={paymentActions.handlePreauthorization}
            onAuthorization={paymentActions.handleAuthorization}
            onCapture={paymentActions.handleCapture}
            onRefund={paymentActions.handleRefund}
            settings={settings}
            googlePayToken={paymentActions.googlePayToken}
            setGooglePayToken={paymentActions.setGooglePayToken}
            applePayToken={paymentActions.applePayToken}
            setApplePayToken={paymentActions.setApplePayToken}
            cardtype={paymentActions.cardtype}
            setCardtype={paymentActions.setCardtype}
            cardpan={paymentActions.cardpan}
            setCardpan={paymentActions.setCardpan}
            cardexpiredate={paymentActions.cardexpiredate}
            setCardexpiredate={paymentActions.setCardexpiredate}
            cardcvc2={paymentActions.cardcvc2}
            setCardcvc2={paymentActions.setCardcvc2}
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
};

export default AppTabs;

