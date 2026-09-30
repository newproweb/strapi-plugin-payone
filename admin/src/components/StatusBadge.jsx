import * as React from "react";
import { Badge, Box, Flex, Typography } from "@strapi/design-system";
import { STATUS_BADGE_COLORS } from "../constants/payment";
import { MarkCircle } from "./icons/MarkCircle";

const TOOLTIP_STYLE = {
  whiteSpace: "pre-line",
  minWidth: "200px",
  maxWidth: "300px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
};

/** Transaction status pill; ERROR rows show the Payone error code and the message on hover. */
export const StatusBadge = ({ status, transaction }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const payoneError = status === "ERROR" ? transaction?.raw_response?.Error : null;
  const errorCode = payoneError?.ErrorCode || null;
  const errorMessage = payoneError?.ErrorMessage || null;
  const displayText = errorCode ? `${status} - ${errorCode}` : status;
  const showExclamationIcon = status === "ERROR" && !errorCode && !errorMessage;

  return (
    <Box
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: "inline-block", cursor: status === "ERROR" ? "pointer" : "default" }}
    >
      <Flex gap={2} alignItems="center">
        <Badge backgroundColor={STATUS_BADGE_COLORS[status] || "warning100"}>{displayText}</Badge>
        {showExclamationIcon && <MarkCircle color="danger500" style={{ width: "16px", height: "16px" }} />}
      </Flex>
      {isHovered && errorMessage && (
        <Box
          position="absolute"
          zIndex={1000}
          bottom="100%"
          left="50%"
          transform="translateX(-50%)"
          marginBottom={2}
          padding={3}
          background="neutral900"
          hasRadius
          style={TOOLTIP_STYLE}
        >
          <Typography variant="pi" textColor="neutral0" style={{ fontSize: "12px" }}>
            Error: {errorMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
