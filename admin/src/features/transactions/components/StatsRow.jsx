import { Box, Grid, Typography } from "@strapi/design-system";
import { usePluginTranslations } from "../../../hooks/usePluginTranslations";

const STAT_CARDS = [
  { key: "total", labelKey: "stats.total", label: "Transactions", color: "neutral800" },
  { key: "approved", labelKey: "stats.approved", label: "Approved", color: "success600" },
  { key: "error", labelKey: "stats.error", label: "Errors", color: "danger600" },
  { key: "redirect", labelKey: "stats.redirect", label: "Awaiting redirect", color: "warning600" },
];

/** Totals per status for the active filters (the status filter itself is not applied). */
export const StatsRow = ({ stats, isLoading }) => {
  const { t } = usePluginTranslations();

  return (
    <Grid.Root gap={4} aria-busy={isLoading}>
      {STAT_CARDS.map((card) => (
        <Grid.Item key={card.key} col={3} s={6} xs={12} direction="column" alignItems="stretch">
          <Box background="neutral0" hasRadius shadow="tableShadow" padding={5}>
            <Typography variant="pi" textColor="neutral600" tag="p">
              {t(card.labelKey, card.label)}
            </Typography>
            <Typography variant="alpha" textColor={card.color} tag="p">
              {isLoading ? "–" : stats[card.key].toLocaleString()}
            </Typography>
          </Box>
        </Grid.Item>
      ))}
    </Grid.Root>
  );
};
