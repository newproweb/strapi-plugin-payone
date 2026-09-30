import { Box, Flex, Typography } from "@strapi/design-system";

/** White card with a title, an optional description and an optional action on the right. */
export const SectionCard = ({ title, description, action, children }) => (
  <Box background="neutral0" hasRadius shadow="tableShadow" padding={6}>
    <Flex justifyContent="space-between" alignItems="flex-start" gap={4} marginBottom={children ? 5 : 0}>
      <Flex direction="column" alignItems="flex-start" gap={1}>
        <Typography variant="delta" tag="h2">
          {title}
        </Typography>
        {description && (
          <Typography variant="pi" textColor="neutral600">
            {description}
          </Typography>
        )}
      </Flex>
      {action}
    </Flex>
    {children}
  </Box>
);
