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
      className="payment-container"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
    >
      <Flex direction="column" alignItems="stretch" gap={8}>
        <Box>
          <Typography variant="beta" as="h2" fontWeight="bold" className="payment-title" style={{ fontSize: '20px', marginBottom: '4px' }}>
            Payone API Configuration
          </Typography>
          <Typography variant="pi" textColor="neutral600" marginTop={2} className="payment-subtitle" style={{ fontSize: '14px' }}>
            Configure your Payone payment gateway settings
          </Typography>
        </Box>

        <Box>
          <Card className="payment-card">
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
                    className="payment-input"
                    style={{ flex: 1, minWidth: "300px" }}
                  />

                  <TextInput
                    label="Portal ID"
                    name="portalid"
                    value={settings.portalid || ""}
                    onChange={(e) => onInputChange("portalid", e.target.value)}
                    required
                    hint="Your Payone portal ID"
                    className="payment-input"
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
                    className="payment-input"
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
                    className="payment-input"
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
                    className="payment-input"
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
                    className="payment-input"
                    style={{ flex: 1, minWidth: "300px" }}
                  />
                </Flex>

                <Flex direction="column" wrap="wrap" gap={1} alignItems="flex-start">
                  <Select
                    label="Enable 3D Secure"
                    name="enable3DSecure"
                    value={settings.enable3DSecure ? "yes" : "no"}
                    onChange={(value) =>
                      onInputChange("enable3DSecure", value === "yes")
                    }
                    hint="Enable 3D Secure authentication for credit card payments"
                    className="payment-input"
                  >
                    <Option value="yes">Enabled</Option>
                    <Option value="no">Disabled</Option>
                  </Select>
                  <Typography variant="pi" textColor="neutral600" marginTop={1}>
                    When enabled, credit card payments will require 3D Secure authentication (SCA compliance)
                  </Typography>
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        </Box>

        <Box paddingTop={6}>
          <Card className="payment-card">
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
                  className="payment-button payment-button-success"
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
                    className="payment-alert"
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
                          <Card className="payment-card">
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
                          <Card className="payment-card" style={{ background: "#fff5f5" }}>
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
