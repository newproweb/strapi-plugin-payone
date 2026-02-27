import * as React from "react";
import { Card, CardBody, Flex, Typography, Alert } from "@strapi/design-system";
import StatusBadge from "../StatusBadge";
import { formatTransactionData } from "../../../utils/formatTransactionData";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const PaymentResult = ({ paymentError, paymentResult }) => {
  const { t } = usePluginTranslations();
  if (!paymentError && !paymentResult) {
    return null;
  }

  return (
    <>
      {paymentError && (
        <Alert variant="danger" title={t("paymentResult.errorTitle", "Error")} className="payment-alert">
          {paymentError}
        </Alert>
      )}

      {paymentResult && (
        <Card>
          <CardBody>
            <Flex direction="column" gap={4} alignItems={"stretch"}>
              <Flex direction={"row"} alignItems={"center"} gap={2}>
                <Typography variant="delta" as="h3" className="payment-section-title">
                  {t("paymentResult.title", "Payment Result")}
                </Typography>
                {paymentResult?.Status && (
                  <StatusBadge status={paymentResult.Status} />
                )}
              </Flex>

              <Flex direction="column" gap={3} alignItems={"stretch"}>
                {formatTransactionData(paymentResult).map((item, index) => (
                  <Flex
                    key={index}
                    justifyContent="space-between"
                    alignItems="start"
                    style={{
                      padding: "8px 0",
                      borderBottom:
                        index < formatTransactionData(paymentResult).length - 1
                          ? "1px solid #e8e8ea"
                          : "none",
                    }}
                  >
                    <Typography
                      variant="pi"
                      textColor="neutral600"
                      style={{ minWidth: "200px", fontWeight: "500" }}
                    >
                      {item.key}:
                    </Typography>
                    <Typography
                      variant="pi"
                      style={{
                        flex: 1,
                        textAlign: "right",
                        fontWeight: "400",
                        wordBreak: "break-word",
                        fontFamily: item.key.toLowerCase().includes("raw")
                          ? "monospace"
                          : "inherit",
                        fontSize: item.key.toLowerCase().includes("raw")
                          ? "11px"
                          : "inherit",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Flex>
                ))}
              </Flex>
              {paymentResult?.is3DSRequired && !paymentResult?.redirectUrl && (
                <Alert
                  variant="warning"
                  title="3D Secure Authentication Required"
                >
                  <Flex direction="column" gap={2}>
                    <Typography variant="pi">
                      Payone requires 3D Secure authentication, but no redirect
                      URL was provided in the response.
                    </Typography>
                    <Typography variant="pi" fontWeight="semiBold">
                      Possible solutions:
                    </Typography>
                    <Typography
                      variant="pi"
                      component="ul"
                      style={{ marginLeft: "20px" }}
                    >
                      <li>
                        Check Payone portal configuration for 3DS settings
                      </li>
                      <li>
                        Verify that redirect URLs (successurl, errorurl,
                        backurl) are properly configured
                      </li>
                      <li>
                        Ensure you're using test mode with proper test
                        credentials
                      </li>
                      <li>
                        Check if 3dscheck request is needed before authorization
                      </li>
                    </Typography>
                    <Typography
                      variant="pi"
                      textColor="neutral600"
                      marginTop={2}
                    >
                      <strong>Error Code:</strong>{" "}
                      {paymentResult?.errorCode ||
                        paymentResult?.ErrorCode ||
                        "4219"}
                    </Typography>
                  </Flex>
                </Alert>
              )}
            </Flex>
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default PaymentResult;
