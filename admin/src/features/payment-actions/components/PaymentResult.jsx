import { Alert, Card, CardBody, Flex, Typography } from "@strapi/design-system";
import { StatusBadge } from "../../../components/StatusBadge";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";
import { formatTransactionData } from "../../../utils/transaction-format";

const isRawKey = (key) => key.toLowerCase().includes("raw");

const renderMissingRedirectAlert = (paymentResult) => (
  <Alert variant="warning" title="3D Secure Authentication Required">
    <Flex direction="column" gap={2}>
      <Typography variant="pi">Payone requires 3D Secure authentication, but no redirect URL was provided in the response.</Typography>
      <Typography variant="pi" fontWeight="semiBold">
        Possible solutions:
      </Typography>
      <Typography variant="pi" component="ul" style={{ marginLeft: "20px" }}>
        <li>Check Payone portal configuration for 3DS settings</li>
        <li>Verify that redirect URLs (successurl, errorurl, backurl) are properly configured</li>
        <li>Ensure you're using test mode with proper test credentials</li>
        <li>Check if 3dscheck request is needed before authorization</li>
      </Typography>
      <Typography variant="pi" textColor="neutral600" marginTop={2}>
        <strong>Error Code:</strong> {paymentResult?.errorCode || paymentResult?.ErrorCode || "4219"}
      </Typography>
    </Flex>
  </Alert>
);

/** Error alert and key/value dump of the last payment response. */
export const PaymentResult = ({ paymentError, paymentResult }) => {
  const { t } = usePluginTranslations();
  if (!paymentError && !paymentResult) return null;

  const rows = formatTransactionData(paymentResult);

  return (
    <>
      {paymentError && (
        <Alert variant="danger" title={t("paymentResult.errorTitle", "Error")}>
          {paymentError}
        </Alert>
      )}

      {paymentResult && (
        <Card>
          <CardBody>
            <Flex direction="column" gap={4} alignItems="stretch">
              <Flex direction="row" alignItems="center" gap={2}>
                <Typography variant="delta" as="h3">
                  {t("paymentResult.title", "Payment Result")}
                </Typography>
                {paymentResult?.Status && <StatusBadge status={paymentResult.Status} />}
              </Flex>

              <Flex direction="column" gap={3} alignItems="stretch">
                {rows.map((item, index) => (
                  <Flex
                    key={index}
                    justifyContent="space-between"
                    alignItems="start"
                    style={{ padding: "8px 0", borderBottom: index < rows.length - 1 ? "1px solid #e8e8ea" : "none" }}
                  >
                    <Typography variant="pi" textColor="neutral600" style={{ minWidth: "200px", fontWeight: "500" }}>
                      {item.key}:
                    </Typography>
                    <Typography
                      variant="pi"
                      style={{
                        flex: 1,
                        textAlign: "right",
                        fontWeight: "400",
                        wordBreak: "break-word",
                        fontFamily: isRawKey(item.key) ? "monospace" : "inherit",
                        fontSize: isRawKey(item.key) ? "11px" : "inherit",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Flex>
                ))}
              </Flex>
              {paymentResult?.is3DSRequired && !paymentResult?.redirectUrl && renderMissingRedirectAlert(paymentResult)}
            </Flex>
          </CardBody>
        </Card>
      )}
    </>
  );
};
