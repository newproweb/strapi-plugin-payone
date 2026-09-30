import { Button } from "@strapi/design-system";
import { Layouts } from "@strapi/strapi/admin";
import { ArrowLeft, Check } from "@strapi/icons";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";

/** Page header: a back button on the wallet config pages, a save button on the configuration tab. */
export const AppHeader = ({ title, subtitle, showSave, isSaving, onSave, onBack }) => {
  const { t } = usePluginTranslations();

  const renderAction = () => {
    if (onBack) {
      return (
        <Button onClick={onBack} startIcon={<ArrowLeft />} size="L" variant="secondary">
          {t("header.backToMain", "Back to Main")}
        </Button>
      );
    }
    if (!showSave) return null;
    return (
      <Button loading={isSaving} onClick={onSave} startIcon={<Check />} size="M" variant="default">
        {t("header.saveConfiguration", "Save Configuration")}
      </Button>
    );
  };

  return (
    <Layouts.Header
      title={title || t("plugin.name", "Payone Provider")}
      subtitle={subtitle || t("header.subtitle", "Configure your Payone integration and manage payment transactions")}
      primaryAction={renderAction()}
    />
  );
};
