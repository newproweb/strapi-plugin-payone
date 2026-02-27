import * as React from "react";
import { Box, Flex, Typography, Button } from "@strapi/design-system";
import { Play } from "@strapi/icons";
import RenderInput from "../RenderInput";
import { getCurrencyOptions } from "../../../utils/countryLanguageUtils";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const RefundForm = ({ paymentActions }) => {
  const { t } = usePluginTranslations();
  const currencyOptions = getCurrencyOptions();
  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Flex direction="row" gap={2}>
        <Typography variant="omega" fontWeight="semiBold" textColor="neutral800" className="payment-form-title">
          {t("refund.title", "Refund")}
        </Typography>
        <Typography variant="pi" textColor="neutral600" className="payment-form-description">
          {t("refund.description", "Refund a captured payment.")}
        </Typography>
      </Flex>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
        }}
      >
        <RenderInput
          name="refundTxid"
          label={t("common.transactionId", "Transaction ID *")}
          value={paymentActions.paymentState.refundTxid || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("refundTxid", e.target.value)
          }
          inputType="textInput"
          placeholder={t("refund.placeholderTxid", "Enter TxId from capture")}
          required
          tooltipContent={t("refund.tooltipTxid", "Transaction ID from a previous capture")}
        />

        <RenderInput
          name="refundSequenceNumber"
          label={t("refund.sequenceNumber", "Sequence Number")}
          value={paymentActions.paymentState.refundSequenceNumber || "2"}
          onChange={(e) =>
            paymentActions.handleFieldChange(
              "refundSequenceNumber",
              e.target.value
            )
          }
          inputType="textInput"
          placeholder="2"
          tooltipContent={t("refund.tooltipSequence", "Sequence number for this refund (1-127), default is 2 for first refund")}
        />

        <RenderInput
          name="refundAmount"
          label={t("common.amount", "Amount *")}
          value={paymentActions.paymentState.paymentAmount || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("paymentAmount", e.target.value)
          }
          inputType="textInput"
          placeholder="1000"
          required
          tooltipContent={t("refund.tooltipAmount", "Amount in cents to refund (will be negative automatically)")}
        />

        <RenderInput
          name="refundCurrency"
          label={t("common.currency", "Currency")}
          value={paymentActions.paymentState.refundCurrency || "EUR"}
          onChange={(e) =>
            paymentActions.handleFieldChange("refundCurrency", e.target.value)
          }
          inputType="select"
          options={currencyOptions}
          placeholder="EUR"
          tooltipContent="Currency code (e.g., EUR, USD)"
        />

        <RenderInput
          name="refundReference"
          label="Reference"
          value={paymentActions.paymentState.refundReference || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("refundReference", e.target.value)
          }
          inputType="textInput"
          placeholder="Optional reference"
          tooltipContent="Optional reference for this refund"
        />
      </Box>

      <Button
        variant="default"
        onClick={() => paymentActions.handleRefund()}
        loading={paymentActions.isProcessingPayment}
        startIcon={<Play />}
        style={{ maxWidth: "200px" }}
        className="payment-button payment-button-primary"
        disabled={
          !paymentActions.paymentState.refundTxid.trim() ||
          !paymentActions.paymentState.paymentAmount.trim()
        }
      >
        {t("refund.submit", "Refund")}
      </Button>
    </Flex>
  );
};

export default RefundForm;
