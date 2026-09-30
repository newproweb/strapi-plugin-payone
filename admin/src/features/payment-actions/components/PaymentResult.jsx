import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { Accordion, Alert, Box, Flex, Typography } from "@strapi/design-system";
import { SectionCard } from "../../../components/SectionCard";
import { StatusBadge } from "../../../components/StatusBadge";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const responseOf = (result) => result?.data && typeof result.data === "object" ? result.data : result;

const SUMMARY_FIELDS = [
  { labelKey: "paymentResult.txid", label: "TxId", read: (r) => r?.TxId || r?.txid },
  { labelKey: "paymentResult.status", label: "Status", read: (r) => r?.Status || r?.status },
  { labelKey: "paymentResult.errorCode", label: "Error code", read: (r) => r?.errorCode || r?.Error?.ErrorCode },
  { labelKey: "paymentResult.errorMessage", label: "Error message", read: (r) => r?.errorMessage || r?.Error?.ErrorMessage },
  { labelKey: "paymentResult.customerMessage", label: "Customer message", read: (r) => r?.customerMessage || r?.Error?.CustomerMessage },
];

const renderMissingRedirectAlert = (response) => (
  <Alert variant="warning" title="3D Secure Authentication Required">
    <Flex direction="column" alignItems="flex-start" gap={2}>
      <Typography variant="pi">Payone requires 3D Secure authentication, but no redirect URL was provided in the response.</Typography>
      <Typography variant="pi" tag="ul" style={{ marginLeft: "20px" }}>
        <li>Check Payone portal configuration for 3DS settings</li>
        <li>Verify that redirect URLs (successurl, errorurl, backurl) are properly configured</li>
        <li>Ensure you're using test mode with proper test credentials</li>
        <li>Check if 3dscheck request is needed before authorization</li>
      </Typography>
      <Typography variant="pi" textColor="neutral600">
        <strong>Error Code:</strong> {response?.errorCode || response?.ErrorCode || "4219"}
      </Typography>
    </Flex>
  </Alert>
);

/** Response of the last test request: error, a short summary and the raw Payone response. */
export const PaymentResult = ({ paymentError, paymentResult, isProcessing }) => {
  const { t } = usePluginTranslations();
  const response = responseOf(paymentResult);
  const summary = SUMMARY_FIELDS.map((field) => ({ ...field, value: field.read(response) })).filter((field) => field.value);

  const renderBody = () => {
    if (isProcessing) {
      return (
        <Typography variant="pi" textColor="neutral600">
          {t("paymentResult.waiting", "Waiting for Payone…")}
        </Typography>
      );
    }
    if (!paymentError && !paymentResult) {
      return (
        <Typography variant="pi" textColor="neutral600">
          {t("paymentResult.empty", "Run a test payment to see Payone's response here.")}
        </Typography>
      );
    }
    return (
      <Flex direction="column" alignItems="stretch" gap={4}>
        {paymentError && (
          <Alert variant="danger" title={t("paymentResult.errorTitle", "Error")} closeLabel={t("common.close", "Close")}>
            {paymentError}
          </Alert>
        )}
        {summary.length > 0 && (
          <Flex direction="column" alignItems="stretch" gap={2}>
            {summary.map((field) => (
              <Flex key={field.label} justifyContent="space-between" gap={4}>
                <Typography variant="pi" textColor="neutral600">
                  {t(field.labelKey, field.label)}
                </Typography>
                <Typography variant="pi" fontWeight="semiBold" textAlign="right" style={{ wordBreak: "break-word" }}>
                  {String(field.value)}
                </Typography>
              </Flex>
            ))}
          </Flex>
        )}
        {response?.is3DSRequired && !response?.redirectUrl && renderMissingRedirectAlert(response)}
        {paymentResult && (
          <Accordion.Root>
            <Accordion.Item value="raw">
              <Accordion.Header>
                <Accordion.Trigger>{t("paymentResult.raw", "Raw response")}</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <Box padding={3}>
                  <JsonView value={paymentResult} style={githubDarkTheme} displayDataTypes={false} enableClipboard collapsed={1} displayObjectSize={false} />
                </Box>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        )}
      </Flex>
    );
  };

  return (
    <SectionCard
      title={t("paymentResult.title", "Payment Result")}
      action={response?.Status ? <StatusBadge status={response.Status} transaction={{ raw_response: response }} /> : null}
    >
      {renderBody()}
    </SectionCard>
  );
};
