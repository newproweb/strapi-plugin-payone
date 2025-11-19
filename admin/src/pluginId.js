import pluginPkg from "../../package.json";

const pluginId = pluginPkg.name.replace(/^(@[^-,.][\w,-]+\/|strapi-)plugin-/i, '');

export default `strapi-plugin-${pluginId.replace(/-provider$/, '')}`;
