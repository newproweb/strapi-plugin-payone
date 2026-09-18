/**
 * Plugin translations. Uses react-intl from Strapi admin (do NOT install react-intl).
 */
import { useIntl } from 'react-intl';
import pluginId from '../../pluginId';

export function usePluginTranslations() {
  const { formatMessage } = useIntl();
  const t = (id, defaultMessage = '') =>
    formatMessage({ id: `${pluginId}.${id}`, defaultMessage });
  return { t, formatMessage };
}
