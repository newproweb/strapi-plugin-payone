import * as React from '@strapi/strapi/admin';
import { Button } from "@strapi/design-system";
import { Layouts } from "@strapi/strapi/admin";
import { Check, ArrowLeft } from "@strapi/icons";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";

const AppHeader = ({ activeTab, isSaving, onSave, title, onBack }) => {
  const { t } = usePluginTranslations();
  const pluginName = t("plugin.name", "Payone Provider");
  const isConfigPage = title && title !== pluginName;

  const subtitle =
    title === "Apple Pay Configuration"
      ? t("header.subtitleApplePay", "Configure Apple Pay settings for your payment gateway")
      : title === "Google Pay Configuration"
        ? t("header.subtitleGooglePay", "Configure Google Pay settings for your payment gateway")
        : t("header.subtitle", "Configure your Payone integration and manage payment transactions");

  return (
    <Layouts.Header
      title={title || pluginName}
      subtitle={subtitle}
      primaryAction={
        isConfigPage ? (
          <Button onClick={onBack} startIcon={<ArrowLeft />} size="L" variant="secondary">
            {t("header.backToMain", "Back to Main")}
          </Button>
        ) : activeTab === 2 ? (
          <Button
            loading={isSaving}
            onClick={onSave}
            startIcon={<Check />}
            size="M"
            variant="default"
            className="payment-button payment-button-success"
          >
            {t("header.saveConfiguration", "Save Configuration")}
          </Button>
        ) : null
      }
    />
  );
};

export default AppHeader;
