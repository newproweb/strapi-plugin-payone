import { useState } from "react";
import { Badge, Box, Typography, Flex } from "@strapi/design-system";
import { ExclamationMarkCircle } from "@strapi/icons";

const StatusBadge = ({ status, transaction }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const statusColors = {
    APPROVED: "success200",
    PENDING: "warning200",
    ERROR: "danger200",
    CANCELLED: "warning100",
    REDIRECTED: "success100",
    CREATED: "success100"
  };

  const getDisplayText = () => {
    if (status === "ERROR" && transaction?.raw_response?.Error?.ErrorCode) {
      return `${status} - ${transaction.raw_response.Error.ErrorCode}`;
    }
    return status;
  };

  const displayText = getDisplayText();
  const errorMessage = status === "ERROR" && transaction?.raw_response?.Error?.ErrorMessage 
    ? transaction.raw_response.Error.ErrorMessage 
    : null;
  
  const errorCode = status === "ERROR" && transaction?.raw_response?.Error?.ErrorCode
    ? transaction.raw_response.Error.ErrorCode
    : null;
  
  const showExclamationIcon = status === "ERROR" && !errorCode && !errorMessage;

  return (
    <Box
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ display: "inline-block", cursor: status === "ERROR" ? "pointer" : "default" }}
    >
      <Flex gap={2} alignItems="center">
        <Badge backgroundColor={statusColors[status] || "warning100"}>
          {displayText}
        </Badge>
        {showExclamationIcon && (
          <ExclamationMarkCircle color="danger500"
            style={{
              width: "16px",
              height: "16px"
            }} 
          />
        )}
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
          style={{
            whiteSpace: "pre-line",
            minWidth: "200px",
            maxWidth: "300px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Typography variant="pi" textColor="neutral0" style={{ fontSize: "12px" }}>
            Error: {errorMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StatusBadge;
