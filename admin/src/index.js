import pluginPkg from "../../package.json";
import { pluginId } from "./pluginId";
import { Initializer } from "./components/Initializer";
import { PluginIcon } from "./components/PluginIcon";
import { loadGooglePayScript } from "./utils/google-pay-script";
import { prefixPluginTranslations } from "./utils/translations";

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: "Payone Provider",
      },
      Component: () => import("./pages/App"),
      permissions: [],
    });

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name: pluginPkg.strapi.name,
    });
  },

  bootstrap() {
    loadGooglePayScript();
  },

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map((locale) =>
        import(`./translations/${locale}.json`)
          .then(({ default: data }) => ({ data: prefixPluginTranslations(data, pluginId), locale }))
          .catch(() => ({ data: {}, locale }))
      )
    );
  },
};
