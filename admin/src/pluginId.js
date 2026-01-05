import pluginPkg from "../../package.json";

// Extract plugin ID from package name
// Package name: 'strapi-plugin-payone-provider'
// Plugin ID should be: 'strapi-plugin-payone-provider' (matches package name)
const pluginId = pluginPkg.name.replace(/^(@[^-,.][\w,-]+\/|strapi-)plugin-/i, '');

// Keep the full name including -provider suffix
export default `strapi-plugin-${pluginId}`;
