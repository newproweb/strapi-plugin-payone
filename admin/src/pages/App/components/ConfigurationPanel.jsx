import React, { useEffect } from "react";
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
  Alert,
  Switch,
} from "@strapi/design-system";
import { Play, Cog } from "@strapi/icons";
import { useHistory } from "react-router-dom";
import pluginId from "../../../pluginId";

const ConfigurationPanel = ({
  settings,
  isTesting,
  testResult,
  onTestConnection,
  onInputChange,
  onPaymentMethodToggle,
}) => {
  const history = useHistory();
  const mode = (settings?.mode || "test").toLowerCase();

  const handleNavigateToApplePayConfig = () => {
    history.push(`/plugins/${pluginId}/apple-pay-config`);
  };

  const handleNavigateToGooglePayConfig = () => {
    history.push(`/plugins/${pluginId}/google-pay-config`);
  };

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
          <Typography
            variant="beta"
            as="h2"
            fontWeight="bold"
            className="payment-title"
            style={{ fontSize: "20px", marginBottom: "4px" }}
          >
            Payone API Configuration
          </Typography>
          <Typography
            variant="pi"
            textColor="neutral600"
            marginTop={2}
            className="payment-subtitle"
            style={{ fontSize: "14px" }}
          >
            Configure your Payone payment gateway settings
          </Typography>
        </Box>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
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
                  <TextInput
                    label="Domain Name"
                    name="domainName"
                    value={settings.domainName || ""}
                    onChange={(e) =>
                      onInputChange("domainName", e.target.value)
                    }
                    hint="Your domain name (optional)"
                    className="payment-input"
                    style={{ flex: 1, minWidth: "300px" }}
                  />

                  <TextInput
                    label="Display Name"
                    name="displayName"
                    value={settings.displayName || ""}
                    onChange={(e) =>
                      onInputChange("displayName", e.target.value)
                    }
                    hint="Display name for payment methods (optional)"
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
                    <Option value="test">Test</Option>
                    <Option value="live">Live</Option>
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

                <Flex
                  direction="column"
                  wrap="wrap"
                  gap={1}
                  alignItems="flex-start"
                >
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
                    When enabled, credit card payments will require 3D Secure
                    authentication (SCA compliance)
                  </Typography>
                </Flex>

                <Flex
                  direction="row"
                  gap={2}
                  wrap="wrap"
                  alignItems="flex-start"
                  marginTop={2}
                >
                  <Button
                    variant="secondary"
                    startIcon={<Cog />}
                    onClick={handleNavigateToApplePayConfig}
                    className="payment-button"
                  >
                    Apple Pay Config
                  </Button>
                  <Button
                    variant="secondary"
                    startIcon={<Cog />}
                    onClick={handleNavigateToGooglePayConfig}
                    className="payment-button"
                  >
                    Google Pay Config
                  </Button>
                </Flex>
              </Stack>
            </CardBody>
          </Card>

          <Card className="payment-card">
            <CardBody padding={6}>
              <Stack spacing={6}>
                <Box>
                  <Typography
                    variant="delta"
                    as="h3"
                    fontWeight="bold"
                    marginBottom={4}
                  >
                    Payment Methods
                  </Typography>
                  <Typography
                    variant="pi"
                    textColor="neutral600"
                    marginBottom={4}
                  >
                    Enable or disable payment methods for your Payone
                    integration
                  </Typography>
                </Box>

                <Stack spacing={4}>
                  <Flex
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={4}
                  >
                    <Typography variant="omega" fontWeight="semiBold">
                      Credit Card (Visa, Mastercard)
                    </Typography>
                    <Switch
                      label="Credit Card"
                      selected={settings.enableCreditCard !== false}
                      onChange={() =>
                        onPaymentMethodToggle(
                          "enableCreditCard",
                          !settings.enableCreditCard
                        )
                      }
                    />
                  </Flex>

                  <Flex
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={4}
                  >
                    <Typography variant="omega" fontWeight="semiBold">
                      PayPal
                    </Typography>
                    <Switch
                      label="PayPal"
                      selected={settings.enablePayPal !== false}
                      onChange={() =>
                        onPaymentMethodToggle(
                          "enablePayPal",
                          !settings.enablePayPal
                        )
                      }
                    />
                  </Flex>

                  <Flex
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={4}
                  >
                    <Typography variant="omega" fontWeight="semiBold">
                      Google Pay
                    </Typography>
                    <Switch
                      label="Google Pay"
                      selected={settings.enableGooglePay !== false}
                      onChange={() =>
                        onPaymentMethodToggle(
                          "enableGooglePay",
                          !settings.enableGooglePay
                        )
                      }
                    />
                  </Flex>

                  <Flex
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={4}
                  >
                    <Typography variant="omega" fontWeight="semiBold">
                      Apple Pay
                    </Typography>
                    <Switch
                      label="Apple Pay"
                      selected={settings.enableApplePay !== false}
                      onChange={() =>
                        onPaymentMethodToggle(
                          "enableApplePay",
                          !settings.enableApplePay
                        )
                      }
                    />
                  </Flex>

                  <Flex
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={4}
                  >
                    <Typography variant="omega" fontWeight="semiBold">
                      Sofort Banking
                    </Typography>
                    <Switch
                      label="Sofort Banking"
                      selected={settings.enableSofort !== false}
                      onChange={() =>
                        onPaymentMethodToggle(
                          "enableSofort",
                          !settings.enableSofort
                        )
                      }
                    />
                  </Flex>

                  <Flex
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={4}
                  >
                    <Typography variant="omega" fontWeight="semiBold">
                      SEPA Direct Debit
                    </Typography>
                    <Switch
                      label="SEPA Direct Debit"
                      selected={settings.enableSepaDirectDebit !== false}
                      onChange={() =>
                        onPaymentMethodToggle(
                          "enableSepaDirectDebit",
                          !settings.enableSepaDirectDebit
                        )
                      }
                    />
                  </Flex>
                </Stack>
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
                  disabled={mode === "live"}
                >
                  {isTesting ? "Testing Connection..." : "Test Connection"}
                </Button>
                {mode === "live" && (
                  <Typography
                    variant="pi"
                    textColor="neutral600"
                    style={{ marginTop: "8px" }}
                  >
                    Test Connection is disabled in live mode for security
                    reasons.
                  </Typography>
                )}

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
                          <Card
                            className="payment-card"
                            style={{ background: "#fff5f5" }}
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
