import * as React from "react";
import { Box, Card, CardBody, Flex, Typography } from "@strapi/design-system";

const PaymentMethodsSection = () => {
  return (
    <Card className="payment-card" id="payment-methods">
      <CardBody padding={6}>
        <Flex direction="column" alignItems="stretch" gap={4} width={"100%"}>
          <Typography variant="delta" as="h3" fontWeight="bold">
            Supported Payment Methods
          </Typography>

          <Flex direction="column" gap={2} alignItems="stretch" marginTop={4}>
            <Typography variant="pi">
              • <strong>cc</strong> - Credit Card (Visa, Mastercard, Amex)
            </Typography>
            <Typography variant="pi">
              • <strong>wlt</strong> - PayPal
            </Typography>
            <Typography variant="pi">
              • <strong>gpp</strong> - Google Pay
            </Typography>
            <Typography variant="pi">
              • <strong>apl</strong> - Apple Pay
            </Typography>
            <Typography variant="pi">
              • <strong>sb</strong> - Sofort Banking
            </Typography>
            <Typography variant="pi">
              • <strong>elv</strong> - SEPA Direct Debit
            </Typography>
          </Flex>

          <Typography variant="delta" as="h3" fontWeight="bold">
            Available Card Types (for Credit Card):
          </Typography>

          <Flex direction="column" gap={2} alignItems="stretch" marginTop={4}>
            <Typography variant="pi">
              • <strong>V</strong> - Visa
            </Typography>
            <Typography variant="pi">
              • <strong>M</strong> - Mastercard
            </Typography>
            <Typography variant="pi">
              • <strong>A</strong> - American Express (Amex)
            </Typography>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default PaymentMethodsSection;
