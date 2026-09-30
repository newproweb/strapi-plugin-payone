import { Box, Button } from "@strapi/design-system";
import { Play } from "@strapi/icons";

const FIELD_GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

/** Grid of form fields followed by the form's extra content (card input, wallet buttons, submit). */
export const ActionForm = ({ fields, children }) => (
  <Box>
    <Box style={FIELD_GRID_STYLE}>{fields}</Box>
    {children && <Box marginTop={5}>{children}</Box>}
  </Box>
);

export const SubmitButton = ({ onClick, loading, disabled, children }) => (
  <Button size="L" onClick={onClick} loading={loading} startIcon={<Play />} disabled={disabled}>
    {children}
  </Button>
);
