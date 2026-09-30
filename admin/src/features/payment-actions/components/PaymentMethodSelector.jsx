import { Accordion, Box, Button, Flex, Typography } from "@strapi/design-system";
import { FormField } from "../../../components/FormField";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { CAPTURE_MODE_OPTIONS } from "../../../constants/payment";
import { getPaymentMethodOptions, supportsCaptureMode } from "../../../utils/payment-params";
import { ApplePaySetupNotice, GooglePaySetupNotice } from "./WalletSetupNotice";

const SETUP_NOTICES = {
  apl: { Notice: ApplePaySetupNotice, titleKey: "paymentMethodSelector.appleSetup", title: "Apple Pay setup requirements" },
  gpp: { Notice: GooglePaySetupNotice, titleKey: "paymentMethodSelector.googleSetup", title: "Google Pay setup requirements" },
};

/** Payment method chips, the wallet setup checklist and (for wallets) the capture mode. */
export const PaymentMethodSelector = ({ paymentActions, onNavigateToConfig, isLiveMode }) => {
  const { t } = usePluginTranslations();
  const method = paymentActions.paymentState.paymentMethod;
  const setupNotice = SETUP_NOTICES[method];

  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Box>
        <Typography variant="sigma" textColor="neutral600" tag="p" id="payment-method-label">
          {t("paymentMethodSelector.label", "Select Payment Method")}
        </Typography>
        <Flex gap={2} wrap="wrap" marginTop={2} role="group" aria-labelledby="payment-method-label">
          {getPaymentMethodOptions(isLiveMode).map((option) => (
            <Button
              key={option.value}
              size="S"
              variant={option.value === method ? "secondary" : "tertiary"}
              aria-pressed={option.value === method}
              onClick={() => paymentActions.handleFieldChange("paymentMethod", option.value)}
            >
              {option.label}
            </Button>
          ))}
        </Flex>
      </Box>

      {setupNotice && onNavigateToConfig && (
        <Accordion.Root>
          <Accordion.Item value="setup">
            <Accordion.Header>
              <Accordion.Trigger>{t(setupNotice.titleKey, setupNotice.title)}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content>
              <Box padding={4}>
                <setupNotice.Notice onNavigateToConfig={onNavigateToConfig} />
              </Box>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      )}

      {method !== "apl" && supportsCaptureMode(method) && (
        <FormField
          name="captureMode"
          label="Capture Mode"
          value={paymentActions.paymentState.captureMode || ""}
          onChange={(e) => paymentActions.handleFieldChange("captureMode", e.target?.value || e)}
          inputType="select"
          options={CAPTURE_MODE_OPTIONS}
          placeholder="Select capture mode"
          hint="Select capture mode for wallet payments"
          tooltipContent="Choose how the payment should be captured for wallet payments"
        />
      )}
    </Flex>
  );
};
