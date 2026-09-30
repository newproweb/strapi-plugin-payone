import { Box, Button, Card, CardBody, Flex, Typography } from "@strapi/design-system";
import { Play } from "@strapi/icons";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const SUCCESS_DETAILS = [
  { key: "mode", labelKey: "testConnection.mode", label: "Mode" },
  { key: "aid", labelKey: "testConnection.aid", label: "AID" },
  { key: "portalid", labelKey: "testConnection.portalid", label: "Portal ID" },
];

const ERROR_DETAILS = [
  { key: "ErrorCode", labelKey: "testConnection.errorCode", label: "Error Code" },
  { key: "ErrorMessage", labelKey: "testConnection.errorMessage", label: "Error Message" },
  { key: "CustomerMessage", labelKey: "testConnection.customerMessage", label: "Customer Message" },
];

export const TestConnection = ({ settings, isTesting, testResult, onTestConnection }) => {
  const { t } = usePluginTranslations();
  const isLiveMode = (settings?.mode || "test").toLowerCase() === "live";

  const renderDetails = (rows, values) => (
    <Card>
      <CardBody padding={4}>
        <Flex direction="column" alignItems="stretch" gap={2}>
          {rows
            .filter((row) => values?.[row.key])
            .map((row) => (
              <Typography key={row.key} variant="pi" textColor="neutral600">
                <strong>{t(row.labelKey, row.label)}:</strong> {values[row.key]}
              </Typography>
            ))}
        </Flex>
      </CardBody>
    </Card>
  );

  const renderResult = () => {
    if (!testResult) return null;
    const succeeded = testResult.details && Boolean(testResult.success);
    return (
      <Flex direction="column" alignItems="stretch" gap={2}>
        <Typography variant="pi" fontWeight="medium" style={{ marginBottom: "16px" }}>
          {testResult.message}
        </Typography>
        {succeeded ? <Box paddingTop={3}>{renderDetails(SUCCESS_DETAILS, testResult.details)}</Box> : renderDetails(ERROR_DETAILS, testResult.error)}
      </Flex>
    );
  };

  return (
    <Card padding={8}>
      <CardBody>
        <Flex direction="column" alignItems="stretch" gap={6} paddingTop={6}>
          <Box>
            <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: "16px" }}>
              {t("testConnection.title", "Test Connection")}
            </Typography>
            {isLiveMode ? (
              <Typography variant="pi" textColor="neutral600" style={{ marginTop: "8px" }}>
                {t("testConnection.disabledInLive", "Test Connection is disabled in live mode.")}
              </Typography>
            ) : (
              <Typography variant="pi" textColor="neutral600">
                {t("testConnection.description", "Verify your Payone configuration by testing the API connection")}
              </Typography>
            )}
          </Box>

          <Button
            variant="default"
            onClick={onTestConnection}
            loading={isTesting}
            startIcon={<Play />}
            disabled={isLiveMode}
            style={{ maxWidth: "200px" }}
          >
            {isTesting ? t("testConnection.testing", "Testing Connection...") : t("testConnection.button", "Test Connection")}
          </Button>

          {renderResult()}
        </Flex>
      </CardBody>
    </Card>
  );
};
