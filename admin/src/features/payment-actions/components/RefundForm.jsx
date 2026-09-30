import { FormField } from "../../../components/FormField";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { getCurrencyOptions } from "../../../utils/locale-options";
import { ActionForm, SubmitButton } from "./ActionForm";

export const RefundForm = ({ paymentActions }) => {
  const { t } = usePluginTranslations();
  const { paymentState, handleFieldChange } = paymentActions;

  const fields = (
    <>
      <FormField
        name="refundTxid"
        label={t("common.transactionId", "Transaction ID *")}
        value={paymentState.refundTxid || ""}
        onChange={(e) => handleFieldChange("refundTxid", e.target.value)}
        inputType="textInput"
        placeholder={t("refund.placeholderTxid", "Enter TxId from capture")}
        required
        tooltipContent={t("refund.tooltipTxid", "Transaction ID from a previous capture")}
      />
      <FormField
        name="refundSequenceNumber"
        label={t("refund.sequenceNumber", "Sequence Number")}
        value={paymentState.refundSequenceNumber || "2"}
        onChange={(e) => handleFieldChange("refundSequenceNumber", e.target.value)}
        inputType="textInput"
        placeholder="2"
        tooltipContent={t("refund.tooltipSequence", "Sequence number for this refund (1-127), default is 2 for first refund")}
      />
      <FormField
        name="refundAmount"
        label={t("common.amount", "Amount *")}
        value={paymentState.paymentAmount || ""}
        onChange={(e) => handleFieldChange("paymentAmount", e.target.value)}
        inputType="textInput"
        placeholder="1000"
        required
        tooltipContent={t("refund.tooltipAmount", "Amount in cents to refund (will be negative automatically)")}
      />
      <FormField
        name="refundCurrency"
        label={t("common.currency", "Currency")}
        value={paymentState.refundCurrency || "EUR"}
        onChange={(e) => handleFieldChange("refundCurrency", e.target.value)}
        inputType="select"
        options={getCurrencyOptions()}
        placeholder="EUR"
        tooltipContent="Currency code (e.g., EUR, USD)"
      />
      <FormField
        name="refundReference"
        label="Reference"
        value={paymentState.refundReference || ""}
        onChange={(e) => handleFieldChange("refundReference", e.target.value)}
        inputType="textInput"
        placeholder="Optional reference"
        tooltipContent="Optional reference for this refund"
      />
    </>
  );

  return (
    <ActionForm fields={fields}>
      <SubmitButton
        onClick={() => paymentActions.handleRefund()}
        loading={paymentActions.isProcessingPayment}
        disabled={!paymentState.refundTxid.trim() || !paymentState.paymentAmount.trim()}
      >
        {t("refund.submit", "Refund")}
      </SubmitButton>
    </ActionForm>
  );
};
