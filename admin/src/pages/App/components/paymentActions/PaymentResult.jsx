import React from "react";
import {
  Box,
  Card,
  CardBody,
  Divider,
  Flex,
  Stack,
  Typography,
  Alert
} from "@strapi/design-system";
import StatusBadge from "../StatusBadge";
import { formatTransactionData } from "../../../utils/formatTransactionData";

const PaymentResult = ({ paymentError, paymentResult }) => {
  if (!paymentError && !paymentResult) {
    return null;
  }

  const status = paymentResult?.status || paymentResult?.Status || "";
  const errorCode = paymentResult?.errorcode || paymentResult?.errorCode || paymentResult?.ErrorCode;
  const errorMessage = paymentResult?.errormessage || paymentResult?.errorMessage || paymentResult?.ErrorMessage;
  const customerMessage = paymentResult?.customermessage || paymentResult?.customerMessage || paymentResult?.CustomerMessage;
  const isError = status === "ERROR" || status === "INVALID" || errorCode;

  return (
    <>
      {paymentError && (
        <Alert
          variant="danger"
          title="Error"
          className="payment-alert"
        >
          {paymentError}
        </Alert>
      )}

      {paymentResult && (
        <Card className="payment-result-card">
          <CardBody>
            <Stack spacing={4}>
              <Flex justifyContent="space-between" alignItems="center">
                <Typography variant="delta" as="h3" className="payment-section-title">
                  Payment Result
                </Typography>
                {(status || paymentResult.Status) && (
                  <StatusBadge status={status || paymentResult.Status} />
                )}
              </Flex>

              <hr className="payment-divider" style={{ margin: '16px 0' }} />

              {/* Show error information prominently if error */}
              {isError && (
                <Alert variant="danger" title="Transaction Failed">
                  <Stack spacing={2}>
                    {errorCode && (
                      <Typography variant="pi">
                        <strong>Error Code:</strong> {errorCode}
                      </Typography>
                    )}
                    {errorMessage && (
                      <Typography variant="pi">
                        <strong>Error Message:</strong> {errorMessage}
                      </Typography>
                    )}
                    {customerMessage && (
                      <Typography variant="pi">
                        <strong>Customer Message:</strong> {customerMessage}
                      </Typography>
                    )}
                  </Stack>
                </Alert>
              )}

              <Box>
                <Typography variant="omega" fontWeight="semiBold" marginBottom={2}>
                  Full Response Details:
                </Typography>
                <Stack spacing={3}>
                  {formatTransactionData(paymentResult).map((item, index) => (
                    <Flex
                      key={index}
                      justifyContent="space-between"
                      alignItems="start"
                      style={{
                        padding: '8px 0',
                        borderBottom: index < formatTransactionData(paymentResult).length - 1 ? '1px solid #e8e8ea' : 'none'
                      }}
                    >
                      <Typography
                        variant="pi"
                        textColor="neutral600"
                        style={{ minWidth: "200px", fontWeight: '500' }}
                      >
                        {item.key}:
                      </Typography>
                      <Typography
                        variant="pi"
                        style={{
                          flex: 1,
                          textAlign: "right",
                          fontWeight: '400',
                          wordBreak: 'break-word',
                          fontFamily: item.key.toLowerCase().includes('raw') ? 'monospace' : 'inherit',
                          fontSize: item.key.toLowerCase().includes('raw') ? '11px' : 'inherit'
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Flex>
                  ))}
                </Stack>
              </Box>

              {/* 3DS Required Warning */}
              {paymentResult?.is3DSRequired && !paymentResult?.redirectUrl && (
                <Alert variant="warning" title="3D Secure Authentication Required">
                  <Stack spacing={2}>
                    <Typography variant="pi">
                      Payone requires 3D Secure authentication, but no redirect URL was provided in the response.
                    </Typography>
                    <Typography variant="pi" fontWeight="semiBold">
                      Possible solutions:
                    </Typography>
                    <Typography variant="pi" component="ul" style={{ marginLeft: '20px' }}>
                      <li>Check Payone portal configuration for 3DS settings</li>
                      <li>Verify that redirect URLs (successurl, errorurl, backurl) are properly configured</li>
                      <li>Ensure you're using test mode with proper test credentials</li>
                      <li>Check if 3dscheck request is needed before authorization</li>
                    </Typography>
                    <Typography variant="pi" textColor="neutral600" marginTop={2}>
                      <strong>Error Code:</strong> {paymentResult?.errorCode || paymentResult?.ErrorCode || "4219"}
                    </Typography>
                  </Stack>
                </Alert>
              )}

            </Stack>
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default PaymentResult;

