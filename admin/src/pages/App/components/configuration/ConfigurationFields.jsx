import * as React from "react";
import {
  Button,
  Card,
  CardBody,
  Flex,
  Typography,
  Accordion
} from "@strapi/design-system";
import { Cog } from "@strapi/icons";
import RenderInput from "../RenderInput";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const ConfigurationFields = ({
  settings,
  onInputChange,
  onPaymentMethodToggle,
  onNavigateToConfig,
}) => {
  const { t } = usePluginTranslations();
  const handleNavigateToApplePayConfig = () => {
    if (onNavigateToConfig) {
      onNavigateToConfig("apple-pay-config");
    }
  };

  const handleNavigateToGooglePayConfig = () => {
    if (onNavigateToConfig) {
      onNavigateToConfig("google-pay-config");
    }
  };

  return (
    <Card padding={8}>
      <CardBody
        style={{
          display: "grid",
          gap: "16px",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        }}
      >
        <Flex direction="column" alignItems={"stretch"} gap={6}>
                  <Flex direction="row" gap={2}>
                    <RenderInput
                      label={t("config.fields.aid", "Account ID (aid)")}
                      name="aid"
                      value={settings.aid}
                      onChange={(e) => onInputChange("aid", e.target.value)}
                      required
                      inputType="textInput"
                      tooltipContent={t("config.fields.aidTooltip", "Your Payone account ID")}
                    />
                    <RenderInput
                      label={t("config.fields.portalid", "Portal ID")}
                      name="portalid"
                      value={settings.portalid}
                      onChange={(e) => onInputChange("portalid", e.target.value)}
                      required
                      inputType="textInput"
                      tooltipContent={t("config.fields.portalidTooltip", "Your Payone portal ID")}
                    />
                  </Flex>
                  <Flex direction="row" gap={2}>
                    <RenderInput
                      label={t("config.fields.mid", "Merchant ID (mid)")}
                      name="mid"
                      value={settings.mid}
                      onChange={(e) => onInputChange("mid", e.target.value)}
                      required
                      inputType="textInput"
                      tooltipContent={t("config.fields.midTooltip", "Your Payone merchant ID")}
                    />
                    <RenderInput
                      label={t("config.fields.key", "Portal Key")}
                      name="key"
                      type="password"
                      value={settings.key}
                      onChange={(e) => onInputChange("key", e.target.value)}
                      required
                      inputType="textInput"
                      tooltipContent={t("config.fields.keyTooltip", "Your Payone portal key (will be encrypted)")}
                    />
                  </Flex>
                  <Flex direction="row" gap={2}>
                    <RenderInput
                      label={t("config.fields.domainName", "Domain Name")}
                      name="domainName"
                      value={settings.domainName}
                      onChange={(e) => onInputChange("domainName", e.target.value)}
                      inputType="textInput"
                      tooltipContent={t("config.fields.domainNameTooltip", "Your Payone domain name")}
                    />
                    <RenderInput
                      label={t("config.fields.displayName", "Display Name")}
                      name="displayName"
                      value={settings.displayName}
                      onChange={(e) => onInputChange("displayName", e.target.value)}
                      inputType="textInput"
                      tooltipContent={t("config.fields.displayNameTooltip", "Display name for payment methods (optional)")}
                    />
                  </Flex>
                  <Flex direction="row" gap={2}>
                    <RenderInput
                      label={t("config.fields.mode", "Mode")}
                      name="mode"
                      value={settings.mode || "test"}
                      onChange={(e) => onInputChange("mode", e.target.value)}
                      required
                      inputType="select"
                      tooltipContent={t("config.fields.modeTooltip", "Select the API mode")}
                      options={[
                        { value: "test", label: t("config.fields.modeTest", "Test") },
                        { value: "live", label: t("config.fields.modeLive", "Live") },
                      ]}
                    />
                    <RenderInput
                      label={t("config.fields.enable3DSecure", "Enable 3D Secure")}
                      name="enable3DSecure"
                      value={settings.enable3DSecure ? "yes" : "no"}
                      onChange={(e) =>
                        onInputChange("enable3DSecure", e.target.value === "yes")
                      }
                      required
                      inputType="select"
                      tooltipContent={t("config.fields.enable3DSecureTooltip", "Enable 3D Secure authentication for credit card payments")}
                      options={[
                        { value: "yes", label: t("config.fields.enabled", "Enabled") },
                        { value: "no", label: t("config.fields.disabled", "Disabled") },
                      ]}
                    />
                  </Flex>
                  <Flex direction="row">
                    <RenderInput
                      label={t("config.fields.apiVersion", "API Version")}
                      name="api_version"
                      value={settings.api_version || "3.10"}
                      onChange={(e) => onInputChange("api_version", e.target.value)}
                      required
                      inputType="textInput"
                      tooltipContent={t("config.fields.apiVersionTooltip", "Payone API version")}
                    />
                  </Flex>
        </Flex>

        <Flex direction="column" alignItems="stretch" height={"100%"} gap={4} marginTop={6}> 
          <Typography variant="pi" textColor="neutral600" marginBottom={8}>
            {t("config.paymentMethods.title", "Enable or disable payment methods for your Payone integration")}
          </Typography>

          <RenderInput
            label={t("config.paymentMethods.creditCard", "Credit Card (Visa, Mastercard)")}
            name="enableCreditCard"
            value={settings.enableCreditCard === true}
            onChange={(selected) =>
              onPaymentMethodToggle("enableCreditCard", selected)
            }
            inputType="switch"
            labelDirection="row"
            labelStyle={{ fontSize: "16px" }}
            tooltipContent={t("config.paymentMethods.creditCardTooltip", "Enable or disable credit card payments")}
          />
          <RenderInput
            label={t("config.paymentMethods.paypal", "PayPal")}
            name="enablePayPal"
            value={settings.enablePayPal === true}
            onChange={(selected) =>
              onPaymentMethodToggle("enablePayPal", selected)
            }
            inputType="switch"
            labelDirection="row"
            labelStyle={{ fontSize: "16px" }}
            tooltipContent={t("config.paymentMethods.paypalTooltip", "Enable or disable PayPal payments")}
          />
          <RenderInput
            label={t("config.paymentMethods.googlePay", "Google Pay")}
            name="enableGooglePay"
            value={settings.enableGooglePay === true}
            onChange={(selected) =>
              onPaymentMethodToggle("enableGooglePay", selected)
            }
            inputType="switch"
            labelDirection="row"
            labelStyle={{ fontSize: "16px" }}
            tooltipContent={t("config.paymentMethods.googlePayTooltip", "Enable or disable Google Pay payments")}
          />
          <RenderInput
            label={t("config.paymentMethods.applePay", "Apple Pay")}
            name="enableApplePay"
            value={settings.enableApplePay === true}
            onChange={(selected) =>
              onPaymentMethodToggle("enableApplePay", selected)
            }
            inputType="switch"
            labelDirection="row"
            labelStyle={{ fontSize: "16px" }}
            tooltipContent={t("config.paymentMethods.applePayTooltip", "Enable or disable Apple Pay payments")}
          />
          {/* <RenderInput
            label={t("config.paymentMethods.sofort", "Sofort Banking")}
            name="enableSofort"
            value={settings.enableSofort === true}
            onChange={(selected) =>
              onPaymentMethodToggle("enableSofort", selected)
            }
            inputType="switch"
            labelDirection="row"
            labelStyle={{ fontSize: "16px" }}
            tooltipContent={t("config.paymentMethods.sofortTooltip", "Enable or disable Sofort Banking payments")}
          /> */}
          <RenderInput
            label={t("config.paymentMethods.sepa", "SEPA Direct Debit")}
            name="enableSepaDirectDebit"
            value={settings.enableSepaDirectDebit === true}
            onChange={(selected) =>
              onPaymentMethodToggle("enableSepaDirectDebit", selected)
            }
            inputType="switch"
            labelDirection="row"
            labelStyle={{ fontSize: "16px" }}
            tooltipContent={t("config.paymentMethods.sepaTooltip", "Enable or disable SEPA Direct Debit payments")}
          />

          <Flex direction="row" gap={2} style={{marginTop: "8rem"}}>
            <Button
              variant="secondary"
              startIcon={<Cog />}
              onClick={handleNavigateToApplePayConfig}
              className="payment-button"
            >
              {t("config.buttons.applePayConfig", "Apple Pay Config")}
            </Button>
            <Button
              variant="secondary"
              startIcon={<Cog />}
              onClick={handleNavigateToGooglePayConfig}
              className="payment-button"
            >
              {t("config.buttons.googlePayConfig", "Google Pay Config")}
            </Button>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default ConfigurationFields;

