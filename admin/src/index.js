
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
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
        defaultMessage: 'Payone Provider',
      },
      Component: async () => {
        const App = await import('./pages/App');
        return App;
      },
      permissions: [],
    });

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },

  bootstrap(app) {
    injectGooglePayScript();
    injectApplePayScript();
  },

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(
            /* webpackChunkName: "[pluginId]-[request]" */ `./translations/${locale}.json`
          );

          return {
            data,
            locale,
          };
        } catch (error) {
          return {
            data: {},
            locale,
          };
        }
      })
    );

    return Promise.resolve(importedTrads);
  },
};