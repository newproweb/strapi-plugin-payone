import * as React from "react";
import { Alert, Box, Button, Flex, Grid } from "@strapi/design-system";
import { SectionCard } from "../../components/SectionCard";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";
import { PaymentMethodSelector } from "./components/PaymentMethodSelector";
import { PaymentForm } from "./components/PaymentForm";
import { CaptureForm } from "./components/CaptureForm";
import { RefundForm } from "./components/RefundForm";
import { PaymentResult } from "./components/PaymentResult";

const OPERATIONS = [
  { id: "preauthorization", titleKey: "preauth.title", title: "Preauthorization", descriptionKey: "preauth.description", description: "Reserve an amount on a credit card without capturing it immediately." },
  { id: "authorization", titleKey: "auth.title", title: "Authorization", descriptionKey: "auth.description", description: "Authorize a payment with an existing preauthorization." },
  { id: "capture", titleKey: "capture.title", title: "Capture", descriptionKey: "capture.description", description: "Capture a previously preauthorized amount.", txidField: "captureTxid" },
  { id: "refund", titleKey: "refund.title", title: "Refund", descriptionKey: "refund.description", description: "Refund a captured payment.", txidField: "refundTxid" },
];

const lastTxIdOf = (result) => result?.TxId || result?.txid || result?.data?.TxId || result?.data?.txid || "";

/** Payment tests tab: pick an operation, fill the form on the left, read Payone's answer on the right. */
export const PaymentActionsPanel = ({ onNavigateToConfig, settings, paymentActions }) => {
  const { t } = usePluginTranslations();
  const isLiveMode = (settings?.savedSettings?.mode || "test").toLowerCase() === "live";
  const method = paymentActions.paymentState.paymentMethod;
  const [operationId, setOperationId] = React.useState(isLiveMode ? "authorization" : "preauthorization");
  const operation = OPERATIONS.find((item) => item.id === operationId);
  const operations = isLiveMode ? OPERATIONS.filter((item) => item.id === "authorization") : OPERATIONS;

  React.useEffect(() => {
    if (isLiveMode && method !== "apl") paymentActions.handleFieldChange("paymentMethod", "apl");
    if (isLiveMode) setOperationId("authorization");
  }, [isLiveMode, method, paymentActions.handleFieldChange]);

  const handleOperationChange = (next) => {
    const lastTxId = lastTxIdOf(paymentActions.paymentResult);
    if (next.txidField && lastTxId && !paymentActions.paymentState[next.txidField]) {
      paymentActions.handleFieldChange(next.txidField, String(lastTxId));
    }
    setOperationId(next.id);
  };

  const renderOperationPicker = () => (
    <Flex gap={2} wrap="wrap" role="group" aria-label={t("paymentActions.operation", "Operation")}>
      {operations.map((item) => (
        <Button
          key={item.id}
          variant={item.id === operationId ? "secondary" : "tertiary"}
          aria-pressed={item.id === operationId}
          onClick={() => handleOperationChange(item)}
        >
          {t(item.titleKey, item.title)}
        </Button>
      ))}
    </Flex>
  );

  const renderForm = () => {
    if (operationId === "capture") return <CaptureForm paymentActions={paymentActions} />;
    if (operationId === "refund") return <RefundForm paymentActions={paymentActions} />;
    return (
      <Flex direction="column" alignItems="stretch" gap={5}>
        <PaymentMethodSelector paymentActions={paymentActions} onNavigateToConfig={onNavigateToConfig} isLiveMode={isLiveMode} />
        <PaymentForm type={operationId} paymentActions={paymentActions} settings={settings} />
      </Flex>
    );
  };

  return (
    <Flex direction="column" alignItems="stretch" gap={6} paddingTop={6}>
      {isLiveMode && (
        <Alert variant="warning" title={t("paymentActions.liveTitle", "Live mode")} closeLabel={t("common.close", "Close")}>
          {t(
            "applePayPanel.warning",
            "Apple Pay can only be tested on a production domain with HTTPS and Live mode. Testing in Strapi admin panel is not supported. Please test Apple Pay on your production website."
          )}
        </Alert>
      )}

      {renderOperationPicker()}

      <Grid.Root gap={6}>
        <Grid.Item col={7} s={12} direction="column" alignItems="stretch">
          <SectionCard title={t(operation.titleKey, operation.title)} description={t(operation.descriptionKey, operation.description)}>
            {renderForm()}
          </SectionCard>
        </Grid.Item>
        <Grid.Item col={5} s={12} direction="column" alignItems="stretch">
          <Box position="sticky" top={4}>
            <PaymentResult
              paymentError={paymentActions.paymentError}
              paymentResult={paymentActions.paymentResult}
              isProcessing={paymentActions.isProcessingPayment}
            />
          </Box>
        </Grid.Item>
      </Grid.Root>
    </Flex>
  );
};
