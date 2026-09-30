import { Flex, Loader } from "@strapi/design-system";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";
import { EnvironmentCard } from "./components/EnvironmentCard";
import { CredentialsCard } from "./components/CredentialsCard";
import { PaymentMethodsCard } from "./components/PaymentMethodsCard";
import { SaveBar } from "./components/SaveBar";

export const ConfigurationPanel = ({ settings, onNavigateToConfig }) => {
  const { t } = usePluginTranslations();

  if (settings.isLoading && !settings.isDirty) {
    return (
      <Flex justifyContent="center" padding={10}>
        <Loader>{t("settings.loading", "Loading settings…")}</Loader>
      </Flex>
    );
  }

  return (
    <Flex direction="column" alignItems="stretch" gap={6} paddingTop={6}>
      <EnvironmentCard settings={settings.settings} onInputChange={settings.handleInputChange} />
      <CredentialsCard settings={settings} />
      <PaymentMethodsCard settings={settings} onNavigateToConfig={onNavigateToConfig} />
      <SaveBar
        changeCount={settings.changedFields.length}
        isSaving={settings.isSaving}
        onDiscard={settings.handleDiscard}
        onSave={settings.handleSave}
      />
    </Flex>
  );
};
