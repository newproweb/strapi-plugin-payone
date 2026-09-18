import * as React from "react";
import { Accordion, Flex, Typography, Link } from "@strapi/design-system";

const TableOfContents = () => {
  return (
    <Accordion.Root>
      <Accordion.Item value="toc">
        <Accordion.Header>
          <Accordion.Trigger>Table of Contents</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <Flex direction="column" alignItems={"stretch"} gap={2} padding={4}>
            <Typography variant="pi">
              1. <Link href="#base-url">Base URL & Authentication</Link>
            </Typography>
            <Typography variant="pi">
              2. <Link href="#payment-methods">Supported Payment Methods</Link>
            </Typography>
            <Typography variant="pi">
              3. <Link href="#credit-card">Credit Card Integration</Link>
            </Typography>
            <Typography variant="pi">
              4. <Link href="#paypal">PayPal Integration</Link>
            </Typography>
            <Typography variant="pi">
              5. <Link href="#google-pay">Google Pay Integration</Link>
            </Typography>
            <Typography variant="pi">
              6. <Link href="#apple-pay">Apple Pay Integration</Link>
            </Typography>
            <Typography variant="pi">
              7. <Link href="#3d-secure">3D Secure Authentication</Link>
            </Typography>
            <Typography variant="pi">
              8. <Link href="#capture-refund">Capture & Refund Operations</Link>
            </Typography>
            <Typography variant="pi">
              9. <Link href="#test-credentials">Test Credentials</Link>
            </Typography>
          </Flex>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};

export default TableOfContents;
