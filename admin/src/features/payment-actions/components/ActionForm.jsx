import { Box, Button, Flex, Typography } from "@strapi/design-system";
import { Play } from "@strapi/icons";

const FIELD_GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "16px",
};

/** Shared layout of the payment action forms: heading, a grid of fields, then extra content. */
export const ActionForm = ({ title, description, fields, children }) => (
  <Flex direction="column" alignItems="stretch" gap={4}>
    <Flex direction="row" gap={2}>
      <Typography variant="omega" fontWeight="semiBold" textColor="neutral800" className="payment-form-title">
        {title}
      </Typography>
      <Typography variant="pi" textColor="neutral600" className="payment-form-description">
        {description}
      </Typography>
    </Flex>
    <Box style={FIELD_GRID_STYLE}>{fields}</Box>
    {children}
  </Flex>
);

export const SubmitButton = ({ onClick, loading, disabled, children }) => (
  <Button variant="default" onClick={onClick} loading={loading} startIcon={<Play />} style={{ maxWidth: "200px" }} disabled={disabled}>
    {children}
  </Button>
);
