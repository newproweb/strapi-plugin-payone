import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
import Initializer from "./components/Initializer";
import PluginIcon from "./components/PluginIcon";

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

  bootstrap(app) {},

  async registerTrads() {
    return Promise.resolve([]);
  }
};
