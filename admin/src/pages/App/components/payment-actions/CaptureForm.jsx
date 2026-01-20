import * as React from "react";
import { Box, Flex, Typography, Button } from "@strapi/design-system";
import { Play } from "@strapi/icons";
import RenderInput from "../RenderInput";
import { getCurrencyOptions } from "../../../utils/countryLanguageUtils";

const CaptureForm = ({ paymentActions }) => {
  const currencyOptions = getCurrencyOptions();
  return (
    <Flex direction="column" alignItems="stretch" gap={4}>
      <Flex direction="row" gap={2}>
        <Typography
          variant="omega"
          fontWeight="semiBold"
          textColor="neutral800"
          className="payment-form-title"
        >
          Capture
        </Typography>
        <Typography
          variant="pi"
          textColor="neutral600"
          className="payment-form-description"
        >
          Capture a previously authorized amount. Note: Reference parameter is
          not supported by Payone capture.
        </Typography>
      </Flex>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
        }}
      >
        <RenderInput
          name="captureTxid"
          label="Transaction ID *"
          value={paymentActions.paymentState.captureTxid || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("captureTxid", e.target.value)
          }
          inputType="textInput"
          placeholder="Enter TxId from preauthorization"
          required
          tooltipContent="Transaction ID from a previous preauthorization"
        />

        <RenderInput
          name="captureAmount"
          label="Amount *"
          value={paymentActions.paymentState.paymentAmount || ""}
          onChange={(e) =>
            paymentActions.handleFieldChange("paymentAmount", e.target.value)
          }
          inputType="textInput"
          placeholder="1000"
          required
          tooltipContent="Amount in cents to capture"
        />

        <RenderInput
          name="captureCurrency"
          label="Currency"
          value={paymentActions.paymentState.captureCurrency || "EUR"}
          onChange={(e) =>
            paymentActions.handleFieldChange("captureCurrency", e.target.value)
          }
          inputType="select"
          options={currencyOptions}
          placeholder="EUR"
          tooltipContent="Currency code (e.g., EUR, USD)"
        />

        <RenderInput
          name="captureSequenceNumber"
          label="Sequence Number"
          value={paymentActions.paymentState.captureSequenceNumber || "1"}
          onChange={(e) =>
            paymentActions.handleFieldChange(
              "captureSequenceNumber",
              e.target.value
            )
          }
          inputType="textInput"
          placeholder="1"
          tooltipContent="Sequence number for this capture (1-127), default is 1"
        />

        {["wlt", "gpp", "apl"].includes(
          paymentActions.paymentState.paymentMethod
        ) && (
          <RenderInput
            name="captureMode"
            label="Capture Mode"
            value={paymentActions.paymentState.captureMode || "full"}
            onChange={(e) =>
              paymentActions.handleFieldChange("captureMode", e.target.value)
            }
            inputType="select"
            options={[
              { value: "full", label: "Full" },
              { value: "partial", label: "Partial" },
            ]}
            tooltipContent="Capture mode for wallet payments: full or partial"
          />
        )}
      </Box>

      <Button
        variant="default"
        onClick={() => paymentActions.handleCapture()}
        loading={paymentActions.isProcessingPayment}
        startIcon={<Play />}
        style={{ maxWidth: "200px" }}
        disabled={
          !paymentActions.paymentState.captureTxid?.trim() ||
          !paymentActions.paymentState.paymentAmount?.trim()
        }
      >
        Process Capture
      </Button>
    </Flex>
  );
};

export default CaptureForm;
