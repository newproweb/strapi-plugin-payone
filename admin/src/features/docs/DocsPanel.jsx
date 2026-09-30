import { Accordion, Box, Flex, Typography } from "@strapi/design-system";
import { PanelHeader } from "../../components/PanelHeader";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";
import { TableOfContents } from "./sections/TableOfContents";
import { BaseUrlSection } from "./sections/BaseUrlSection";
import { PaymentMethodsSection } from "./sections/PaymentMethodsSection";
import { CreditCardSection } from "./sections/CreditCardSection";
import { PayPalSection } from "./sections/PayPalSection";
import { GooglePaySection } from "./sections/GooglePaySection";
import { ApplePaySection } from "./sections/ApplePaySection";
import { ThreeDSecureSection } from "./sections/ThreeDSecureSection";
import { CaptureRefundSection } from "./sections/CaptureRefundSection";
import { TestCredentialsSection } from "./sections/TestCredentialsSection";

/** Documentation tab: frontend integration guide for the plugin's API. */
export const DocsPanel = () => {
  const { t } = usePluginTranslations();
  return (
    <Flex direction="column" alignItems="stretch" gap={6} padding={8}>
      <PanelHeader
        title={t("docs.title", "Payone Provider Plugin - Frontend Integration Guide")}
        subtitle={t("docs.subtitle", "Complete documentation for integrating Payone payment methods in your frontend application")}
        titleProps={{ fontWeight: "bold" }}
        subtitleProps={{ marginTop: 2 }}
      />

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
