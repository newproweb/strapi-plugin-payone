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
  Switch,
} from "@strapi/design-system";
import { Cog } from "@strapi/icons";
import { useHistory } from "react-router-dom";
import pluginId from "../../../../pluginId";
import InfoTooltip from "../common/InfoTooltip";

const ConfigurationFields = ({
  settings,
  onInputChange,
  onPaymentMethodToggle,
}) => {
  const history = useHistory();

  const handleNavigateToApplePayConfig = () => {
    history.push(`/plugins/${pluginId}/apple-pay-config`);
  };

  const handleNavigateToGooglePayConfig = () => {
    history.push(`/plugins/${pluginId}/google-pay-config`);
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <Card className="payment-card" id="config-card-1">
        <CardBody padding={6}>
          <Stack spacing={6} id="config-stack-1">
            <Flex gap={4} wrap="wrap">
              <TextInput
                label="Account ID (aid)"
                name="aid"
                value={settings.aid || ""}
                onChange={(e) => onInputChange("aid", e.target.value)}
                required
                className="payment-input"
                style={{ flex: 1, minWidth: "300px" }}
                endAction={
                  <InfoTooltip
                    label="Account ID"
                    description="Your Payone account ID (aid). Found in your Payone merchant portal."
                    id="aid-tooltip"
                  />
                }
              />

              <TextInput
                label="Portal ID"
                name="portalid"
                value={settings.portalid || ""}
                onChange={(e) => onInputChange("portalid", e.target.value)}
                required
                className="payment-input"
                style={{ flex: 1, minWidth: "300px" }}
                endAction={
                  <InfoTooltip
                    label="Portal ID"
                    description="Your Payone portal ID. Found in your Payone merchant portal."
                    id="portalid-tooltip"
                  />
                }
              />
            </Flex>

            <Flex gap={4} wrap="wrap">
              <TextInput
                label="Merchant ID (mid)"
                name="mid"
                value={settings.mid || ""}
                onChange={(e) => onInputChange("mid", e.target.value)}
                required
                className="payment-input"
                style={{ flex: 1, minWidth: "300px" }}
                endAction={
                  <InfoTooltip
                    label="Merchant ID"
                    description="Your Payone merchant ID (mid). Found in your Payone merchant portal."
                    id="mid-tooltip"
                  />
                }
              />

              <TextInput
                label="Portal Key"
                name="key"
                type="password"
                value={settings.key || ""}
                onChange={(e) => onInputChange("key", e.target.value)}
                required
                className="payment-input"
                style={{ flex: 1, minWidth: "300px" }}
                endAction={
                  <InfoTooltip
                    label="Portal Key"
                    description="Your Payone portal key (will be encrypted for security). Found in your Payone merchant portal."
                    id="key-tooltip"
                  />
                }
              />
            </Flex>

            <Flex gap={4} wrap="wrap">
              <TextInput
                label="Domain Name"
                name="domainName"
                value={settings.domainName || ""}
                onChange={(e) => onInputChange("domainName", e.target.value)}
                className="payment-input"
                style={{ flex: 1, minWidth: "300px" }}
                endAction={
                  <InfoTooltip
                    label="Domain Name"
                    description="Your domain name (optional). Used for payment method configuration."
                    id="domainName-tooltip"
                  />
                }
              />

              <TextInput
                label="Display Name"
                name="displayName"
                value={settings.displayName || ""}
                onChange={(e) => onInputChange("displayName", e.target.value)}
                className="payment-input"
                style={{ flex: 1, minWidth: "300px" }}
                endAction={
                  <InfoTooltip
                    label="Display Name"
                    description="Display name for payment methods (optional). Shown to customers during checkout."
                    id="displayName-tooltip"
                  />
                }
              />
            </Flex>

            <Flex gap={4} wrap="wrap">
              <Select
                label="Mode"
                name="mode"
                value={settings.mode || "test"}
                onChange={(value) => onInputChange("mode", value)}
                className="payment-input"
                style={{ flex: 1, minWidth: "300px" }}
                labelAction={
                  <InfoTooltip
                    label="Mode"
                    description="Select the API mode: Test for development/testing, Live for production"
                    id="mode-tooltip"
                  />
                }
              >
                <Option value="test" multi={false}>
                  Test
                </Option>
                <Option value="live" multi={false}>
                  Live
                </Option>
              </Select>

              <TextInput
                label="API Version"
                name="api_version"
                value={settings.api_version || "3.10"}
                onChange={(e) => onInputChange("api_version", e.target.value)}
                className="payment-input"
                style={{ flex: 1, minWidth: "300px" }}
                endAction={
                  <InfoTooltip
                    label="API Version"
                    description="Payone API version (e.g., 3.10). Check Payone documentation for latest version."
                    id="api_version-tooltip"
                  />
                }
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
                className="payment-input"
                labelAction={
                  <InfoTooltip
                    label="Enable 3D Secure"
                    description="Enable 3D Secure authentication for credit card payments. Required for SCA compliance in Europe."
                    id="enable3DSecure-tooltip"
                  />
                }
              >
                <Option value="yes" multi={false}>
                  Enabled
                </Option>
                <Option value="no" multi={false}>
                  Disabled
                </Option>
              </Select>
              <Typography variant="pi" textColor="neutral600" marginTop={1}>
                When enabled, credit card payments will require 3D Secure
                authentication (SCA compliance)
              </Typography>
            </Flex>
          </Stack>
        </CardBody>
      </Card>

      <Card className="payment-card" id="config-card-2">
        <CardBody padding={6}>
          <Stack spacing={6} id="config-stack-2">
            <Box>
              <Typography
                variant="delta"
                as="h3"
                fontWeight="bold"
                marginBottom={4}
              >
                Payment Methods
              </Typography>
              <Typography variant="pi" textColor="neutral600" marginBottom={4}>
                Enable or disable payment methods for your Payone integration
              </Typography>
            </Box>

            <Stack spacing={4} id="config-stack-3">
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
    </Box>
  );
};

export default ConfigurationFields;
