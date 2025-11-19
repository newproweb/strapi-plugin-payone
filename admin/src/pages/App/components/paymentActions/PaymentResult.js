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
        <Alert variant="danger" title="Error">
          {paymentError}
        </Alert>
      )}

      {paymentResult && (
        <Card>
          <CardBody>
            <Stack spacing={4}>
              <Flex justifyContent="space-between" alignItems="center">
                <Typography variant="delta" as="h3">
                  Payment Result
                </Typography>
                {paymentResult.Status && (
                  <StatusBadge status={paymentResult.Status} />
                )}
              </Flex>

              <Divider />

              <Box>
                <Stack spacing={3}>
                  {formatTransactionData(paymentResult).map((item, index) => (
                    <Flex
                      key={index}
                      justifyContent="space-between"
                      alignItems="start"
                    >
                      <Typography
                        variant="pi"
                        textColor="neutral600"
                        style={{ minWidth: "200px" }}
                      >
                        {item.key}:
                      </Typography>
                      <Typography
                        variant="pi"
                        style={{ flex: 1, textAlign: "right" }}
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

