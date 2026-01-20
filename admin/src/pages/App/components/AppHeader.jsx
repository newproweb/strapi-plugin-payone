import * as React from '@strapi/strapi/admin';
import { Button } from "@strapi/design-system";
import { Layouts } from "@strapi/strapi/admin";
import { Check, ArrowLeft } from "@strapi/icons";

const AppHeader = ({ activeTab, isSaving, onSave, title, onBack }) => {
  const isConfigPage = title && title !== "Payone Provider";

  return (
    <Layouts.Header
      title={title || "Payone Provider"}
      subtitle={
        title === "Apple Pay Configuration"
          ? "Configure Apple Pay settings for your payment gateway"
          : title === "Google Pay Configuration"
            ? "Configure Google Pay settings for your payment gateway"
            : "Configure your Payone integration and manage payment transactions"
      }
      primaryAction={
        isConfigPage ? (
          <Button
            onClick={onBack}
            startIcon={<ArrowLeft />}
            size="L"
            variant="secondary"
          >
            Back to Main
          </Button>
        ) : activeTab === 1 ? (
          <Button
            loading={isSaving}
            onClick={onSave}
            startIcon={<Check />}
            size="M"
            variant="default"
            className="payment-button payment-button-success"
          >
            Save Configuration
          </Button>
        ) : null
      }
    />
  );
};

export default AppHeader;
