import { Button, Card, CardBody, Flex, Typography } from "@strapi/design-system";
import { Check } from "@strapi/icons";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";

/** Shared page shell for the Apple Pay / Google Pay configuration forms. */
export const WalletConfigPanel = ({ view, settings }) => {
  const { t } = usePluginTranslations();
  const { ConfigForm, configKey } = view;
  const config = settings.settings?.[configKey] || {};

  const handleConfigChange = (nextConfig) => settings.handleInputChange(configKey, nextConfig);

  return (
    <Flex direction="column" alignItems="stretch" gap={8} padding={8}>
      <Card>
        <CardBody padding={6}>
          <ConfigForm config={config} onConfigChange={handleConfigChange} />
        </CardBody>
      </Card>

      <Flex direction="column" gap={4} alignItems="stretch" paddingTop={4}>
        <Typography variant="sigma" textColor="neutral600">
          {t(view.noteKey, view.note)}
        </Typography>
        <Button loading={settings.isSaving} onClick={settings.handleSave} startIcon={<Check />} size="L" variant="default" maxWidth="220px">
          {t(view.saveKey, "Save Configuration")}
        </Button>
      </Flex>
    </Flex>
  );
};
