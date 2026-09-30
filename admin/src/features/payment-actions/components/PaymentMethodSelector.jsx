import { Box, Flex } from "@strapi/design-system";
import { FormField } from "../../../components/FormField";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { CAPTURE_MODE_OPTIONS } from "../../../constants/payment";
import { getPaymentMethodDisplayName, getPaymentMethodOptions, supportsCaptureMode } from "../../../utils/payment-params";
import { ApplePaySetupNotice, GooglePaySetupNotice } from "./WalletSetupNotice";

export const PaymentMethodSelector = ({ paymentActions, onNavigateToConfig, isLiveMode }) => {
  const { t } = usePluginTranslations();
  const method = paymentActions.paymentState.paymentMethod;

  const handleSelect = (field) => (e) => paymentActions.handleFieldChange(field, e.target?.value || e);

  return (
    <Box>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <FormField
          name="paymentMethod"
          label={t("paymentMethodSelector.label", "Select Payment Method")}
          value={method || ""}
          onChange={handleSelect("paymentMethod")}
          inputType="select"
          options={getPaymentMethodOptions(isLiveMode)}
          placeholder={t("paymentMethodSelector.placeholder", "Select payment method")}
          hint={`${t("paymentMethodSelector.hintCurrent", "Current")}: ${getPaymentMethodDisplayName(method)}`}
          tooltipContent={t("paymentMethodSelector.tooltip", "Select the payment method you want to use for this transaction")}
        />
        {method === "apl" && onNavigateToConfig && <ApplePaySetupNotice onNavigateToConfig={onNavigateToConfig} />}
        {method === "gpp" && onNavigateToConfig && <GooglePaySetupNotice onNavigateToConfig={onNavigateToConfig} />}
        {method !== "apl" && supportsCaptureMode(method) && (
          <FormField
            name="captureMode"
            label="Capture Mode"
            value={paymentActions.paymentState.captureMode || ""}
            onChange={handleSelect("captureMode")}
            inputType="select"
            options={CAPTURE_MODE_OPTIONS}
            placeholder="Select capture mode"
            hint="Select capture mode for wallet payments"
            tooltipContent="Choose how the payment should be captured for wallet payments"
          />
        )}
      </Flex>
    </Box>
  );
};
