import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
import Initializer from "./components/Initializer/index.jsx";
import PluginIcon from "./components/PluginIcon/index.jsx";
import { injectGooglePayScript } from "./pages/utils/injectGooglePayScript";
import { injectApplePayScript } from "./pages/utils/injectApplePayScript";

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
        const component = await import("./pages/App/index.jsx");
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
    injectApplePayScript();
  },

  async registerTrads() {
    return Promise.resolve([]);
  }
};
