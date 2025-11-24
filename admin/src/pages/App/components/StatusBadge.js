import React from "react";
import { Badge } from "@strapi/design-system";

const StatusBadge = ({ status }) => {
  const statusColors = {
    APPROVED: "success",
    PENDING: "warning",
    ERROR: "danger",
    FAILED: "danger",
    INVALID: "danger",
    REDIRECT: "secondary"
  };

  return (
    <Badge
      textColor="neutral0"
      backgroundColor={statusColors[status] || "default"}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;
