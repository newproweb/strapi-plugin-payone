import { useIntl } from "react-intl";
import { pluginId } from "../pluginId";

/** `t(id, defaultMessage)` scoped to the plugin's translation keys (react-intl comes from the Strapi admin). */
export const usePluginTranslations = () => {
  const { formatMessage } = useIntl();
  const t = (id, defaultMessage = "") => formatMessage({ id: `${pluginId}.${id}`, defaultMessage });
  return { t };
};
