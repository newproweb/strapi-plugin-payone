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
                {paymentResult.Status && (
                  <StatusBadge status={paymentResult.Status} />
                )}
              </Flex>

              <hr className="payment-divider" style={{ margin: '16px 0' }} />

              <Box>
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
                        style={{ flex: 1, textAlign: "right", fontWeight: '400' }}
                      >
                        {item.value}
                      </Typography>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default PaymentResult;

