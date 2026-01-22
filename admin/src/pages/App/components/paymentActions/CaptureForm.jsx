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

const CaptureForm = ({
  paymentAmount,
  setPaymentAmount,
  captureTxid,
  setCaptureTxid,
  captureCurrency,
  setCaptureCurrency,
  captureSequenceNumber,
  setCaptureSequenceNumber,
  captureMode,
  setCaptureMode,
  paymentMethod,
  isProcessingPayment,
  onCapture,
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
          Capture
        </Typography>
        <Typography
          variant="pi"
          textColor="neutral600"
          className="payment-form-description"
        >
          Capture a previously authorized amount. Note: Reference parameter is
          not supported by Payone capture.
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
          name="captureTxid"
          value={captureTxid}
          onChange={(e) => setCaptureTxid(e.target.value)}
          placeholder="Enter TxId from preauthorization"
          required
          className="payment-input"
          endAction={
            <InfoTooltip
              label="Transaction ID"
              description="Transaction ID (TxId) from a previous preauthorization. This is required to capture the authorized amount."
              id="captureTxid-tooltip"
            />
          }
        />

        <TextInput
          label="Amount *"
          name="captureAmount"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder="1000"
          required
          className="payment-input"
          endAction={
            <InfoTooltip
              label="Amount"
              description="Amount in cents to capture (e.g., 1000 = €10.00). Cannot exceed the preauthorized amount."
              id="captureAmount-tooltip"
            />
          }
        />

        <Select
          label="Currency"
          name="captureCurrency"
          value={captureCurrency || "EUR"}
          onChange={(value) => setCaptureCurrency(value)}
          placeholder="EUR"
          labelAction={
            <InfoTooltip
              label="Currency"
              description="Currency code (e.g., EUR, USD, GBP). Must match the currency used in the original preauthorization."
              id="captureCurrency-tooltip"
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
          label="Sequence Number"
          name="captureSequenceNumber"
          value={captureSequenceNumber || "1"}
          onChange={(e) => setCaptureSequenceNumber(e.target.value)}
          placeholder="1"
          className="payment-input"
          endAction={
            <InfoTooltip
              label="Sequence Number"
              description="Sequence number for this capture (1-127). Default is 1 for the first capture. Increment for partial captures."
              id="captureSequenceNumber-tooltip"
            />
          }
        />

        {["wlt", "gpp", "apl"].includes(paymentMethod) && (
          <Select
            label="Capture Mode"
            name="captureMode"
            value={captureMode || "full"}
            onChange={(value) => setCaptureMode(value)}
            labelAction={
              <InfoTooltip
                label="Capture Mode"
                description="Capture mode for wallet payments (Google Pay, Apple Pay): 'full' captures the entire authorized amount, 'partial' allows capturing a portion."
                id="captureMode-tooltip"
              />
            }
          >
            <Option value="full" multi={false}>
              Full
            </Option>
            <Option value="partial" multi={false}>
              Partial
            </Option>
          </Select>
        )}
      </Box>

      <Button
        variant="default"
        onClick={onCapture}
        loading={isProcessingPayment}
        startIcon={<Play />}
        style={{ maxWidth: "200px" }}
        className="payment-button payment-button-primary"
        disabled={!captureTxid.trim() || !paymentAmount.trim()}
      >
        Process Capture
      </Button>
    </Flex>
  );
};

export default CaptureForm;
