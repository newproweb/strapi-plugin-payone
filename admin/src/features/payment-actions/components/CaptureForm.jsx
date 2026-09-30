import { FormField } from "../../../components/FormField";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { getCurrencyOptions } from "../../../utils/locale-options";
import { supportsCaptureMode } from "../../../utils/payment-params";
import { ActionForm, SubmitButton } from "./ActionForm";

const CAPTURE_MODES = [
  { value: "full", label: "Full" },
  { value: "partial", label: "Partial" },
];

export const CaptureForm = ({ paymentActions }) => {
  const { t } = usePluginTranslations();
  const { paymentState, handleFieldChange } = paymentActions;

  const fields = (
    <>
      <FormField
        name="captureTxid"
        label={t("common.transactionId", "Transaction ID *")}
        value={paymentState.captureTxid || ""}
        onChange={(e) => handleFieldChange("captureTxid", e.target.value)}
        inputType="textInput"
        placeholder={t("capture.placeholderTxid", "Enter TxId from preauthorization")}
        required
        tooltipContent={t("capture.tooltipTxid", "Transaction ID from a previous preauthorization")}
      />
      <FormField
        name="captureAmount"
        label={t("common.amount", "Amount *")}
        value={paymentState.paymentAmount || ""}
        onChange={(e) => handleFieldChange("paymentAmount", e.target.value)}
        inputType="textInput"
        placeholder="1000"
        required
        tooltipContent={t("capture.tooltipAmount", "Amount in cents to capture")}
      />
      <FormField
        name="captureCurrency"
        label={t("common.currency", "Currency")}
        value={paymentState.captureCurrency || "EUR"}
        onChange={(e) => handleFieldChange("captureCurrency", e.target.value)}
        inputType="select"
        options={getCurrencyOptions()}
        placeholder="EUR"
        tooltipContent="Currency code (e.g., EUR, USD)"
      />
      <FormField
        name="captureSequenceNumber"
        label={t("capture.sequenceNumber", "Sequence Number")}
        value={paymentState.captureSequenceNumber || "1"}
        onChange={(e) => handleFieldChange("captureSequenceNumber", e.target.value)}
        inputType="textInput"
        placeholder="1"
        tooltipContent={t("capture.tooltipSequence", "Sequence number for this capture (1-127), default is 1")}
      />
      {supportsCaptureMode(paymentState.paymentMethod) && (
        <FormField
          name="captureMode"
          label="Capture Mode"
          value={paymentState.captureMode || "full"}
          onChange={(e) => handleFieldChange("captureMode", e.target.value)}
          inputType="select"
          options={CAPTURE_MODES}
          tooltipContent="Capture mode for wallet payments: full or partial"
        />
      )}
    </>
  );

  return (
    <ActionForm title={t("capture.title", "Capture")} description={t("capture.description", "Capture a previously preauthorized amount.")} fields={fields}>
      <SubmitButton
        onClick={() => paymentActions.handleCapture()}
        loading={paymentActions.isProcessingPayment}
        disabled={!paymentState.captureTxid?.trim() || !paymentState.paymentAmount?.trim()}
      >
        {t("capture.submit", "Capture")}
      </SubmitButton>
    </ActionForm>
  );
};
