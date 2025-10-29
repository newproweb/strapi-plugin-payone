import React from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Stack,
  Typography,
  TextInput,
  Select,
  Option,
  Alert
} from "@strapi/design-system";
import { Play } from "@strapi/icons";

const ConfigurationPanel = ({
  settings,
  isSaving,
  isTesting,
  testResult,
  onSave,
  onTestConnection,
  onInputChange
}) => {
  return (
    <Box
      hasRadius
      shadow="filterShadow"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
      style={{
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid #f6f6f9"
      }}
    >
      <Flex direction="column" alignItems="stretch" gap={8}>
        <Box>
          <Typography variant="beta" as="h2" fontWeight="bold">
            Payone API Configuration
          </Typography>
          <Typography variant="pi" marginTop={2}>
            Configure your Payone payment gateway settings
          </Typography>
        </Box>

        <Box>
          <Card style={{ borderRadius: "8px", border: "1px solid #e4e2e7" }}>
            <CardBody padding={6}>
              <Stack spacing={6}>
                <Flex gap={4} wrap="wrap">
                  <TextInput
                    label="Account ID (aid)"
                    name="aid"
                    value={settings.aid || ""}
                    onChange={(e) => onInputChange("aid", e.target.value)}
                    required
                    hint="Your Payone account ID"
                    style={{ flex: 1, minWidth: "300px" }}
                  />

                  <TextInput
                    label="Portal ID"
                    name="portalid"
                    value={settings.portalid || ""}
                    onChange={(e) => onInputChange("portalid", e.target.value)}
                    required
                    hint="Your Payone portal ID"
                    style={{ flex: 1, minWidth: "300px" }}
                  />
                </Flex>

                <Flex gap={4} wrap="wrap">
                  <TextInput
                    label="Merchant ID (mid)"
                    name="mid"
                    value={settings.mid || ""}
                    onChange={(e) => onInputChange("mid", e.target.value)}
                    required
                    hint="Your Payone merchant ID"
                    style={{ flex: 1, minWidth: "300px" }}
                  />

                  <TextInput
                    label="Portal Key"
                    name="key"
                    type="password"
                    value={settings.key || ""}
                    onChange={(e) => onInputChange("key", e.target.value)}
                    required
                    hint="Your Payone portal key (will be encrypted)"
                    style={{ flex: 1, minWidth: "300px" }}
                  />
                </Flex>

                <Flex gap={4} wrap="wrap">
                  <Select
                    label="Mode"
                    name="mode"
                    value={settings.mode || "test"}
                    onChange={(value) => onInputChange("mode", value)}
                    hint="Select the API mode"
                    style={{ flex: 1, minWidth: "300px" }}
                  >
                    <Option value="test">Test Environment</Option>
                    <Option value="live">Live Environment</Option>
                  </Select>

                  <TextInput
                    label="API Version"
                    name="api_version"
                    value={settings.api_version || "3.10"}
                    onChange={(e) =>
                      onInputChange("api_version", e.target.value)
                    }
                    hint="Payone API version"
                    style={{ flex: 1, minWidth: "300px" }}
                  />
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        </Box>

        <Box paddingTop={6}>
          <Card style={{ borderRadius: "8px", border: "1px solid #e4e2e7" }}>
            <CardBody padding={6}>
              <Stack spacing={6}>
                <Box>
                  <Typography
                    variant="delta"
                    as="h3"
                    fontWeight="bold"
                    marginBottom={2}
                  >
                    Test Connection
                  </Typography>
                  <Typography variant="pi" textColor="neutral600">
                    Verify your Payone configuration by testing the API
                    connection
                  </Typography>
                </Box>

                <Button
                  variant="default"
                  onClick={onTestConnection}
                  loading={isTesting}
                  startIcon={<Play />}
                  style={{
                    background: "#28a745",
                    border: "none",
                    color: "white",
                    fontWeight: "600",
                    borderRadius: "8px"
                  }}
                >
                  {isTesting ? "Testing Connection..." : "Test Connection"}
                </Button>

                {testResult && (
                  <Alert
                    variant={Boolean(testResult.success) ? "success" : "danger"}
                    title={
                      Boolean(testResult.success)
                        ? "Connection Successful"
                        : "Connection Failed"
                    }
                    style={{
                      borderRadius: "8px",
                      border: Boolean(testResult.success)
                        ? "1px solid #d4edda"
                        : "1px solid #f8d7da"
                    }}
                  >
                    <Typography
                      variant="pi"
                      fontWeight="medium"
                      marginBottom={2}
                    >
                      {testResult.message}
                    </Typography>
                    {testResult.details && (
                      <Box paddingTop={3}>
                        {Boolean(testResult.success) ? (
                          <Card
                            style={{
                              border: "1px solid #e9ecef"
                            }}
                          >
                            <CardBody padding={4}>
                              <Typography variant="pi">
                                <strong>Mode:</strong> {testResult.details.mode}{" "}
                                |<strong> AID:</strong> {testResult.details.aid}{" "}
                                |<strong> Portal ID:</strong>{" "}
                                {testResult.details.portalid} |
                                <strong> Merchant ID:</strong>{" "}
                                {testResult.details.mid || ""}
                              </Typography>
                            </CardBody>
                          </Card>
                        ) : (
                          <Card
                            style={{
                              background: "#fff5f5",
                              border: "1px solid #fed7d7"
                            }}
                          >
                            <CardBody padding={4}>
                              <Stack spacing={2}>
                                {testResult.errorcode && (
                                  <Typography
                                    variant="pi"
                                    textColor="neutral600"
                                  >
                                    <strong>Error Code:</strong>{" "}
                                    {testResult.errorcode}
                                  </Typography>
                                )}
                                {testResult.details.errorCode && (
                                  <Typography
                                    variant="pi"
                                    textColor="neutral600"
                                  >
                                    <strong>Error Code:</strong>{" "}
                                    {testResult.details.errorCode}
                                  </Typography>
                                )}
                                {testResult.details &&
                                  testResult.details.rawResponse && (
                                    <Typography
                                      variant="pi"
                                      textColor="neutral600"
                                    >
                                      <strong>Debug Info:</strong>{" "}
                                      {testResult.details.rawResponse}
                                    </Typography>
                                  )}
                              </Stack>
                            </CardBody>
                          </Card>
                        )}
                      </Box>
                    )}
                  </Alert>
                )}
              </Stack>
            </CardBody>
          </Card>
        </Box>

        <Box paddingTop={4}>
          <Typography variant="sigma" textColor="neutral600">
            Note: These settings are used for all Payone API requests. Make sure
            to use the correct credentials for your selected mode.
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

export default ConfigurationPanel;
