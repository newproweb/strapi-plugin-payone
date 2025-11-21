import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
import Initializer from "./components/Initializer";
import PluginIcon from "./components/PluginIcon";
import { injectGooglePayScript } from "./pages/utils/injectGooglePayScript";

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: "Payone Provider"
      },
      Component: async () => {
        const component = await import("./pages/App");
        return component;
      },
      permissions: []
    });

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name
    });
  },

  bootstrap(app) {
    injectGooglePayScript();
  },

  async registerTrads() {
    return Promise.resolve([]);
  }
};
