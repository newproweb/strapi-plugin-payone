import * as React from "react";
import { Box, Flex, Typography, Accordion } from "@strapi/design-system";
import TableOfContents from "./docs/TableOfContents";
import BaseUrlSection from "./docs/BaseUrlSection";
import PaymentMethodsSection from "./docs/PaymentMethodsSection";
import CreditCardSection from "./docs/CreditCardSection";
import PayPalSection from "./docs/PayPalSection";
import GooglePaySection from "./docs/GooglePaySection";
import ApplePaySection from "./docs/ApplePaySection";
import ThreeDSecureSection from "./docs/ThreeDSecureSection";
import CaptureRefundSection from "./docs/CaptureRefundSection";
import TestCredentialsSection from "./docs/TestCredentialsSection";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";

const DocsPanel = ({ settings, paymentActions }) => {
  const { t } = usePluginTranslations();
  return (
    <Flex direction="column" alignItems="stretch" gap={6} padding={8}>
        <Box>
          <Typography variant="beta" as="h2" fontWeight="bold" className="payment-title" style={{ fontSize: "20px", marginBottom: "4px" }}>
            {t("docs.title", "Payone Provider Plugin - Frontend Integration Guide")}
          </Typography>
          <Typography variant="pi" textColor="neutral600" marginTop={2} className="payment-subtitle" style={{ fontSize: "14px" }}>
            {t("docs.subtitle", "Complete documentation for integrating Payone payment methods in your frontend application")}
          </Typography>
        </Box>

      <TableOfContents />

      <BaseUrlSection />

      <PaymentMethodsSection />

        <Accordion.Root>
        <CreditCardSection />
        <PayPalSection />
        <GooglePaySection />
        <ApplePaySection />
        <ThreeDSecureSection />
        <CaptureRefundSection />
        <TestCredentialsSection />
        </Accordion.Root>

        <Box paddingTop={4}>
          <Typography variant="sigma" textColor="neutral600">
            {t("docs.moreInfo", "For more information, visit the Payone documentation or contact your Payone account manager.")}
          </Typography>
        </Box>
      </Flex>
  );
};

export default DocsPanel;
