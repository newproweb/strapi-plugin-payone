import * as React from "react";
import { Accordion, Box, Flex, Typography } from "@strapi/design-system";
import { PanelHeader } from "../../components/PanelHeader";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";
import { PaymentMethodSelector } from "./components/PaymentMethodSelector";
import { PaymentForm } from "./components/PaymentForm";
import { CaptureForm } from "./components/CaptureForm";
import { RefundForm } from "./components/RefundForm";
import { PaymentResult } from "./components/PaymentResult";
import { ApplePayPanel } from "./components/ApplePayPanel";

const SECTIONS = [
  { value: "preauthorization", titleKey: "preauth.title", title: "Preauthorization", lockedInLive: true },
  { value: "authorization", titleKey: "auth.title", title: "Authorization", lockedInLive: false },
  { value: "capture", titleKey: "capture.title", title: "Capture", lockedInLive: true },
  { value: "refund", titleKey: "refund.title", title: "Refund", lockedInLive: true },
];

const lockedStyle = (isLocked) => ({ opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? "none" : "auto" });

/** Payment actions tab: test preauthorization / authorization / capture / refund against Payone. */
export const PaymentActionsPanel = ({ onNavigateToConfig, settings, paymentActions }) => {
  const { t } = usePluginTranslations();
  const isLiveMode = (settings?.settings?.mode || "test").toLowerCase() === "live";
  const method = paymentActions.paymentState.paymentMethod;

  React.useEffect(() => {
    if (isLiveMode && method !== "apl") paymentActions.handleFieldChange("paymentMethod", "apl");
  }, [isLiveMode, method, paymentActions.handleFieldChange]);

  if (isLiveMode && method !== "apl") {
    return (
      <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "44px" }}>
        <Typography variant="pi" textColor="neutral600">
          {t("paymentActions.testModeOnly", "Test Payments are only works in test mode.")}
        </Typography>
        <Typography variant="pi" textColor="neutral600">
          {t("paymentActions.switchToTestMode", "Please switch to test mode in plugin settings to use test payments.")}
        </Typography>
      </Box>
    );
  }

  if (method === "apl") {
    return <ApplePayPanel onNavigateToConfig={onNavigateToConfig} isLiveMode={isLiveMode} paymentActions={paymentActions} settings={settings} />;
  }

  const renderSectionForm = (section) => {
    switch (section) {
      case "preauthorization":
      case "authorization":
        return <PaymentForm type={section} paymentActions={paymentActions} settings={settings} />;
      case "capture":
        return <CaptureForm paymentActions={paymentActions} />;
      default:
        return <RefundForm paymentActions={paymentActions} />;
    }
  };

  return (
    <Box className="payment-container" paddingTop={8} paddingBottom={8} paddingLeft={8} paddingRight={8}>
      <Flex direction="column" alignItems="stretch" gap={6}>
        <PanelHeader
          title={t("paymentActions.title", "Payment Actions")}
          subtitle={t("paymentActions.subtitle", "Perform preauthorization, capture, refund and other payment operations.")}
          boxStyle={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}
        />

        <PaymentMethodSelector paymentActions={paymentActions} onNavigateToConfig={onNavigateToConfig} isLiveMode={isLiveMode} />

        <Accordion.Root>
          {SECTIONS.map((section) => (
            <Accordion.Item key={section.value} value={section.value}>
              <Accordion.Header>
                <Accordion.Trigger>{t(section.titleKey, section.title)}</Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <Box className="payment-form-section" style={section.lockedInLive ? lockedStyle(isLiveMode) : undefined}>
                  {renderSectionForm(section.value)}
                </Box>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        <hr className="payment-divider" />

        <PaymentResult paymentError={paymentActions.paymentError} paymentResult={paymentActions.paymentResult} />

        <Box paddingTop={4}>
          <Typography variant="sigma" textColor="neutral600">
            {t(
              "paymentActions.note",
              "Note: These payment actions allow you to test the complete payment flow: Preauthorization → Capture → Refund. Make sure to use valid Transaction IDs for capture and refund operations."
            )}
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};
