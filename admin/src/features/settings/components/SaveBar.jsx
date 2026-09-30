import { Box, Button, Flex, Typography } from "@strapi/design-system";
import { Check } from "@strapi/icons";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

/** Sticky bar shown while the settings draft differs from what is stored. */
export const SaveBar = ({ changeCount, isSaving, onDiscard, onSave }) => {
  const { t } = usePluginTranslations();
  if (changeCount === 0) return null;

  return (
    <Box position="sticky" bottom={0} zIndex={2} paddingTop={4} paddingBottom={4}>
      <Box background="neutral0" hasRadius shadow="popupShadow" paddingTop={3} paddingBottom={3} paddingLeft={5} paddingRight={5}>
        <Flex justifyContent="space-between" alignItems="center" gap={4}>
          <Typography variant="omega" textColor="neutral700" role="status">
            {changeCount === 1
              ? t("settings.saveBar.oneChange", "1 unsaved change")
              : `${changeCount} ${t("settings.saveBar.changes", "unsaved changes")}`}
          </Typography>
          <Flex gap={2}>
            <Button variant="tertiary" onClick={onDiscard} disabled={isSaving}>
              {t("settings.saveBar.discard", "Discard")}
            </Button>
            <Button onClick={onSave} loading={isSaving} startIcon={<Check />}>
              {t("header.saveConfiguration", "Save Configuration")}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
