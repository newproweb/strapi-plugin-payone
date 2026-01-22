import React from "react";
import {
  Box,
  Flex,
  Typography,
  TextInput,
  Button,
  Select,
  Option,
} from "@strapi/design-system";
import { Play } from "@strapi/icons";
import { getCurrencyOptions } from "../../../utils/countryLanguageUtils";
import InfoTooltip from "../common/InfoTooltip";

const RefundForm = ({
  paymentAmount,
  setPaymentAmount,
  refundTxid,
  setRefundTxid,
  refundSequenceNumber,
  setRefundSequenceNumber,
  refundReference,
  setRefundReference,
  refundCurrency,
  setRefundCurrency,
  isProcessingPayment,
  onRefund,
}) => {
  const currencyOptions = getCurrencyOptions();

  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Flex direction="row" gap={2}>
        <Typography
          variant="omega"
          fontWeight="semiBold"
          textColor="neutral800"
          className="payment-form-title"
        >
          Refund
        </Typography>
        <Typography
          variant="pi"
          textColor="neutral600"
          className="payment-form-description"
        >
          Refund a previously captured amount.
        </Typography>
      </Flex>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
        }}
      >
        <TextInput
          label="Transaction ID *"
          name="refundTxid"
          value={refundTxid}
          onChange={(e) => setRefundTxid(e.target.value)}
          placeholder="Enter TxId from capture"
          required
          className="payment-input"
          endAction={
            <InfoTooltip
              label="Transaction ID"
              description="Transaction ID (TxId) from a previous capture. This is required to refund the captured amount."
              id="refundTxid-tooltip"
            />
          }
        />

        <TextInput
          label="Sequence Number"
          name="refundSequenceNumber"
          value={refundSequenceNumber || "2"}
          onChange={(e) => setRefundSequenceNumber(e.target.value)}
          placeholder="2"
          className="payment-input"
          endAction={
            <InfoTooltip
              label="Sequence Number"
              description="Sequence number for this refund (1-127). Default is 2 for the first refund. Increment for multiple refunds."
              id="refundSequenceNumber-tooltip"
            />
          }
        />

        <TextInput
          label="Amount *"
          name="refundAmount"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder="1000"
          required
          className="payment-input"
          endAction={
            <InfoTooltip
              label="Amount"
              description="Amount in cents to refund (e.g., 1000 = €10.00). The amount will be automatically converted to negative. Cannot exceed the captured amount."
              id="refundAmount-tooltip"
            />
          }
        />

        <Select
          label="Currency"
          name="refundCurrency"
          value={refundCurrency || "EUR"}
          onChange={(value) => setRefundCurrency(value)}
          placeholder="EUR"
          labelAction={
            <InfoTooltip
              label="Currency"
              description="Currency code (e.g., EUR, USD, GBP). Must match the currency used in the original capture transaction."
              id="refundCurrency-tooltip"
            />
          }
        >
          {currencyOptions.map((option) => (
            <Option key={option.value} value={option.value} multi={false}>
              {option.label}
            </Option>
          ))}
        </Select>

        <TextInput
          label="Reference"
          name="refundReference"
          value={refundReference || ""}
          onChange={(e) => setRefundReference(e.target.value)}
          placeholder="Optional reference"
          className="payment-input"
          endAction={
            <InfoTooltip
              label="Reference"
              description="Optional reference for this refund. Useful for tracking and reconciliation purposes."
              id="refundReference-tooltip"
            />
          }
        />
      </Box>

      <Button
        variant="default"
        onClick={onRefund}
        loading={isProcessingPayment}
        startIcon={<Play />}
        style={{ maxWidth: "200px" }}
        className="payment-button payment-button-primary"
        disabled={!refundTxid.trim() || !paymentAmount.trim()}
      >
        Process Refund
      </Button>
    </Flex>
  );
};

export default RefundForm;
