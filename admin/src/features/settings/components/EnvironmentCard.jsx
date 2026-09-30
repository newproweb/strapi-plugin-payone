import * as React from "react";
import { Button, Dialog, Flex, Radio, Switch, Typography } from "@strapi/design-system";
import { WarningCircle } from "@strapi/icons";
import { SectionCard } from "../../../components/SectionCard";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

/** Test/live switch (going live asks for confirmation) and the 3-D Secure toggle. */
export const EnvironmentCard = ({ settings, onInputChange }) => {
  const { t } = usePluginTranslations();
  const [isConfirmingLive, setIsConfirmingLive] = React.useState(false);
  const mode = (settings.mode || "test").toLowerCase();

  const handleModeChange = (value) => {
    if (value === "live") {
      setIsConfirmingLive(true);
      return;
    }
    onInputChange("mode", value);
  };

  const handleConfirmLive = () => {
    onInputChange("mode", "live");
    setIsConfirmingLive(false);
  };

  return (
    <SectionCard
      title={t("settings.environment.title", "Environment")}
      description={t("settings.environment.description", "Live mode charges real cards.")}
    >
      <Flex direction="column" alignItems="stretch" gap={5}>
        <Radio.Group value={mode} onValueChange={handleModeChange} aria-label={t("config.fields.mode", "Mode")}>
          <Flex gap={6}>
            <Radio.Item value="test">{t("config.fields.modeTest", "Test")}</Radio.Item>
            <Radio.Item value="live">{t("config.fields.modeLive", "Live")}</Radio.Item>
          </Flex>
        </Radio.Group>

        <Flex justifyContent="space-between" alignItems="center" gap={4}>
          <Flex direction="column" alignItems="flex-start" gap={1}>
            <Typography variant="omega" fontWeight="semiBold">
              {t("config.fields.enable3DSecure", "Enable 3D Secure")}
            </Typography>
            <Typography variant="pi" textColor="neutral600">
              {t("config.fields.enable3DSecureTooltip", "Enable 3D Secure authentication for credit card payments")}
            </Typography>
          </Flex>
          <Switch
            aria-label={t("config.fields.enable3DSecure", "Enable 3D Secure")}
            checked={settings.enable3DSecure === true}
            onCheckedChange={(checked) => onInputChange("enable3DSecure", checked)}
          />
        </Flex>
      </Flex>

      <Dialog.Root open={isConfirmingLive} onOpenChange={setIsConfirmingLive}>
        <Dialog.Content>
          <Dialog.Header>{t("settings.environment.confirmTitle", "Switch to live mode?")}</Dialog.Header>
          <Dialog.Body icon={<WarningCircle fill="danger600" />}>
            {t("settings.environment.confirmBody", "Payments will be sent to Payone's live system and real cards will be charged. The change is applied when you save.")}
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Cancel>
              <Button fullWidth variant="tertiary">
                {t("common.cancel", "Cancel")}
              </Button>
            </Dialog.Cancel>
            <Dialog.Action>
              <Button fullWidth variant="danger-light" onClick={handleConfirmLive}>
                {t("settings.environment.confirmAction", "Use live mode")}
              </Button>
            </Dialog.Action>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </SectionCard>
  );
};
