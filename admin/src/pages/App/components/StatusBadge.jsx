import * as React from "@strapi/strapi/admin";
import {
  Badge,
  DesignSystemProvider,
  darkTheme,
  lightTheme,
} from "@strapi/design-system";
import { useSystemTheme } from "../../hooks/use-system-theme";

const StatusBadge = ({ status, size = "S" }) => {
  const statusColors = {
    APPROVED: "success200",
    PENDING: "warning200",
    ERROR: "danger200",
    FAILED: "danger200",
    INVALID: "danger200",
    REDIRECT: "success100",
  };
  const systemTheme = useSystemTheme();
  const theme = systemTheme === "dark" ? darkTheme : lightTheme;
  return (
    <DesignSystemProvider theme={theme}>
      <Badge
        borderColor={statusColors[status]}
        background={"transparent"}
        textColor={statusColors[status]}
        size={size}
      >
        {status || "UNKNOWN"}
      </Badge>
    </DesignSystemProvider>
  );
};

export default StatusBadge;
