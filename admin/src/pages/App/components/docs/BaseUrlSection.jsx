import * as React from "react";
import { Box, Card, CardBody, Flex, Typography } from "@strapi/design-system";
import CodeBlock from "./CodeBlock";

const BaseUrlSection = () => {
  return (
    <Card id="base-url">
      <CardBody padding={6}>
        <Flex direction="column" alignItems="stretch" gap={4}>
          <Typography
            variant="delta"
            as="h3"
            fontWeight="bold"
            style={{ marginBottom: "12px" }}
          >
            Base URL & Authentication
          </Typography>
          <Box>
            <Typography
              variant="pi"
              fontWeight="bold"
              style={{ marginBottom: "16px" }}
            >
              Content API (Frontend):
            </Typography>
            <CodeBlock>/api/strapi-plugin-payone-provider</CodeBlock>
          </Box>
          <Box>
            <Typography
              variant="pi"
              fontWeight="bold"
              style={{ marginBottom: "16px" }}
            >
              Required Headers:
            </Typography>
            <CodeBlock>{`{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_AUTH_TOKEN"
}`}</CodeBlock>
          </Box>
          <Typography variant="pi" textColor="neutral600">
            <strong>Note:</strong> <code>YOUR_AUTH_TOKEN</code> is your Strapi
            authentication token (JWT), not a Payone token. You can get this
            token by logging into Strapi admin panel or using Strapi's
            authentication API.
          </Typography>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default BaseUrlSection;
