import { Box, Button, Flex, Status, Typography } from "@strapi/design-system";
import { Play } from "@strapi/icons";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const RESULT_FIELDS = [
  { key: "ErrorCode", labelKey: "testConnection.errorCode", label: "Error Code" },
  { key: "ErrorMessage", labelKey: "testConnection.errorMessage", label: "Error Message" },
  { key: "CustomerMessage", labelKey: "testConnection.customerMessage", label: "Customer Message" },
];

/** Runs a test authorization with the saved credentials and shows the outcome inline. */
export const TestConnection = ({ settings, isDirty, isTesting, testResult, onTestConnection }) => {
  const { t } = usePluginTranslations();
  const isLiveMode = (settings?.mode || "test").toLowerCase() === "live";

  const renderHint = () => {
    if (isLiveMode) return t("testConnection.disabledInLive", "Test Connection is disabled in live mode.");
    if (isDirty) return t("testConnection.usesSaved", "Uses the saved credentials. Save your changes first to test them.");
    return t("testConnection.description", "Verify your Payone configuration by testing the API connection");
  };

  const renderResult = () => {
    if (!testResult) return null;
    const errorDetails = RESULT_FIELDS.filter((field) => testResult.error?.[field.key]);
    return (
      <Box marginTop={3} padding={3} hasRadius background={testResult.success ? "success100" : "danger100"}>
        <Typography variant="pi" fontWeight="semiBold" textColor={testResult.success ? "success700" : "danger700"}>
          {testResult.message}
        </Typography>
        {errorDetails.map((field) => (
          <Typography key={field.key} variant="pi" textColor="danger700" tag="p">
            {t(field.labelKey, field.label)}: {testResult.error[field.key]}
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" gap={4} wrap="wrap">
        <Flex direction="column" alignItems="flex-start" gap={1}>
          <Flex gap={2}>
            <Typography variant="omega" fontWeight="semiBold">
              {t("testConnection.title", "Test Connection")}
            </Typography>
            {testResult && (
              <Status variant={testResult.success ? "success" : "danger"} size="S">
                <Typography fontWeight="bold" textColor={testResult.success ? "success700" : "danger700"}>
                  {testResult.success ? t("testConnection.passed", "Passed") : t("testConnection.failed", "Failed")}
                </Typography>
              </Status>
            )}
          </Flex>
          <Typography variant="pi" textColor="neutral600">
            {renderHint()}
          </Typography>
        </Flex>
        <Button variant="secondary" onClick={onTestConnection} loading={isTesting} startIcon={<Play />} disabled={isLiveMode}>
          {t("testConnection.button", "Test Connection")}
        </Button>
      </Flex>
      {renderResult()}
    </Box>
  );
};
