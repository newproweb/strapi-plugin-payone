import { Button, Flex, LinkButton, Status, Typography } from "@strapi/design-system";
import { Layouts } from "@strapi/strapi/admin";
import { ArrowLeft, ExternalLink } from "@strapi/icons";
import { usePluginTranslations } from "../../hooks/usePluginTranslations";

const INTEGRATION_GUIDE_URL = "https://www.npmjs.com/package/strapi-plugin-payone-provider";

const hasCredentials = (settings) => !!(settings?.aid && settings?.portalid && settings?.key);

const EnvironmentStatus = ({ settings }) => {
  const { t } = usePluginTranslations();
  const isLive = (settings?.mode || "test").toLowerCase() === "live";

  return (
    <Flex gap={2}>
      <Status variant={isLive ? "success" : "warning"} size="S">
        <Typography fontWeight="bold" textColor={isLive ? "success700" : "warning700"}>
          {isLive ? t("header.liveMode", "Live mode") : t("header.testMode", "Test mode")}
        </Typography>
      </Status>
      {!hasCredentials(settings) && (
        <Status variant="danger" size="S">
          <Typography fontWeight="bold" textColor="danger700">
            {t("header.credentialsMissing", "Credentials missing")}
          </Typography>
        </Status>
      )}
    </Flex>
  );
};

/** Page header: environment status, a link to the integration guide, and a back button on sub-pages. */
export const AppHeader = ({ title, subtitle, settings, onBack }) => {
  const { t } = usePluginTranslations();

  return (
    <Layouts.Header
      title={title || t("plugin.name", "Payone Provider")}
      subtitle={subtitle}
      navigationAction={
        onBack ? (
          <Button onClick={onBack} startIcon={<ArrowLeft />} variant="tertiary">
            {t("header.backToMain", "Back to Main")}
          </Button>
        ) : undefined
      }
      secondaryAction={<EnvironmentStatus settings={settings} />}
      primaryAction={
        <LinkButton href={INTEGRATION_GUIDE_URL} target="_blank" rel="noopener noreferrer" variant="tertiary" endIcon={<ExternalLink />}>
          {t("header.integrationGuide", "Integration guide")}
        </LinkButton>
      }
    />
  );
};
