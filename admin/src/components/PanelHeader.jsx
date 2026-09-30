import { Box, Typography } from "@strapi/design-system";

/** Title + subtitle at the top of each tab panel. */
export const PanelHeader = ({ title, subtitle, boxStyle, subtitleStyle, titleProps = {}, subtitleProps = {} }) => (
  <Box style={boxStyle}>
    <Typography variant="beta" as="h2" style={{ fontSize: "20px", marginBottom: "4px" }} {...titleProps}>
      {title}
    </Typography>
    <Typography variant="pi" textColor="neutral600" style={{ fontSize: "14px", ...subtitleStyle }} {...subtitleProps}>
      {subtitle}
    </Typography>
  </Box>
);
