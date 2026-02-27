import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Typography,
} from "@strapi/design-system";
import { Play } from "@strapi/icons";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const TestConnection = ({
  settings,
  isTesting,
  testResult,
  onTestConnection,
}) => {
  const { t } = usePluginTranslations();
  const mode = (settings?.mode || "test").toLowerCase();

  return (
    <Card padding={8}>
      <CardBody>
        <Flex direction="column" alignItems="stretch" gap={6} paddingTop={6}>
          <Box>
            <Typography variant="delta" as="h3" fontWeight="bold" style={{ marginBottom: "16px" }}>
              {t("testConnection.title", "Test Connection")}
            </Typography>
            {mode === "test" ? (
              <Typography variant="pi" textColor="neutral600">
                {t("testConnection.description", "Verify your Payone configuration by testing the API connection")}
              </Typography>
            ) : (
              <Typography variant="pi" textColor="neutral600" style={{ marginTop: "8px" }}>
                {t("testConnection.disabledInLive", "Test Connection is disabled in live mode.")}
              </Typography>
            )}
          </Box>

          <Button
            variant="default"
            onClick={onTestConnection}
            loading={isTesting}
            startIcon={<Play />}
            className="payment-button payment-button-success"
            disabled={mode === "live"}
            style={{ maxWidth: "200px" }}
          >
            {isTesting ? t("testConnection.testing", "Testing Connection...") : t("testConnection.button", "Test Connection")}
          </Button>

          {testResult && (
            <Flex direction="column" alignItems="stretch" gap={2}>
              <Typography variant="pi" fontWeight="medium" style={{ marginBottom: "16px" }}>
                {testResult.message}
              </Typography>
              {testResult.details && Boolean(testResult.success) ? (
                <Box paddingTop={3}>
                  <Card>
                    <CardBody padding={4}>
                      <Flex direction="column" alignItems="stretch" gap={2}>
                        {testResult.details.mode && (
                          <Typography variant="pi" textColor="neutral600">
                            <strong>{t("testConnection.mode", "Mode")}:</strong> {testResult.details.mode}
                          </Typography>
                        )}
                        {testResult.details.aid && (
                          <Typography variant="pi" textColor="neutral600">
                            <strong>{t("testConnection.aid", "AID")}:</strong> {testResult.details.aid}
                          </Typography>
                        )}
                        {testResult.details.portalid && (
                          <Typography variant="pi" textColor="neutral600">
                            <strong>{t("testConnection.portalid", "Portal ID")}:</strong> {testResult.details.portalid}
                          </Typography>
                        )}
                      </Flex>
                    </CardBody>
                  </Card>
                </Box>
              ) : (
                <Card>
                  <CardBody padding={4}>
                    <Flex direction="column" alignItems="stretch" gap={2}>
                      {testResult.error?.ErrorCode && (
                        <Typography variant="pi" textColor="neutral600">
                          <strong>{t("testConnection.errorCode", "Error Code")}:</strong> {testResult.error.ErrorCode}
                        </Typography>
                      )}
                      {testResult.error?.ErrorMessage && (
                        <Typography variant="pi" textColor="neutral600">
                          <strong>{t("testConnection.errorMessage", "Error Message")}:</strong> {testResult.error.ErrorMessage}
                        </Typography>
                      )}
                      {testResult.error?.CustomerMessage && (
                        <Typography variant="pi" textColor="neutral600">
                          <strong>{t("testConnection.customerMessage", "Customer Message")}:</strong> {testResult.error.CustomerMessage}
                        </Typography>
                      )}
                    </Flex>
                  </CardBody>
                </Card>
              )}
            </Flex>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};

export default TestConnection;
