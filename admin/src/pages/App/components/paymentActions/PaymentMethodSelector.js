import React from "react";
import { Box, Flex, Select, Option } from "@strapi/design-system";
import {
  getPaymentMethodOptions,
  supportsCaptureMode,
  getCaptureModeOptions,
  getPaymentMethodDisplayName
} from "../../../utils/paymentUtils";

const PaymentMethodSelector = ({
  paymentMethod,
  setPaymentMethod,
  captureMode,
  setCaptureMode
}) => {
  return (
    <Box>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Select
          label="Select Payment Method"
          name="paymentMethod"
          value={paymentMethod}
          onChange={(value) => setPaymentMethod(value)}
          hint={`Current: ${getPaymentMethodDisplayName(paymentMethod)}`}
        >
          {getPaymentMethodOptions().map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
        {supportsCaptureMode(paymentMethod) && (
          <Select
            label="Capture Mode"
            name="captureMode"
            value={captureMode}
            onChange={(value) => setCaptureMode(value)}
            hint="Select capture mode for wallet payments"
          >
            {getCaptureModeOptions().map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        )}
      </Flex>
    </Box>
  );
};

export default PaymentMethodSelector;