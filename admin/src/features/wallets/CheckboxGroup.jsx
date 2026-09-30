import { Box, Checkbox, Flex, Typography } from "@strapi/design-system";

export const toggleItem = (list, item) => {
  const current = list || [];
  return current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item];
};

/**
 * A titled list of checkboxes over `items` (`{ code, … }`), with a warning when nothing is selected.
 * `renderLabel(item)` builds each label; `isDisabled(item)` greys out an item.
 */
export const CheckboxGroup = ({
  title,
  hint,
  items,
  selected,
  namePrefix,
  onToggle,
  renderLabel,
  isDisabled = () => false,
  emptyMessage,
  headerStyle,
  listProps = {},
  itemStyle,
}) => (
  <>
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <Typography variant="pi" fontWeight="semiBold" style={headerStyle}>
        {title}
      </Typography>
      <Typography variant="pi" textColor="neutral600" style={headerStyle}>
        {hint}
      </Typography>
    </div>
    <Flex wrap="wrap" gap={4} {...listProps}>
      {items.map((item) => (
        <Box key={item.code} style={itemStyle}>
          <Checkbox
            name={`${namePrefix}-${item.code}`}
            checked={selected?.includes(item.code)}
            onCheckedChange={() => onToggle(item.code)}
            disabled={isDisabled(item)}
          >
            {renderLabel(item)}
          </Checkbox>
        </Box>
      ))}
    </Flex>
    {selected?.length === 0 && (
      <Typography variant="pi" textColor="danger600" style={{ marginTop: "8px" }}>
        {emptyMessage}
      </Typography>
    )}
  </>
);
