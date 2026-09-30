export const prefixPluginTranslations = (translations, pluginId) => {
  if (!pluginId) throw new TypeError("pluginId can't be empty");
  return Object.fromEntries(Object.entries(translations).map(([key, value]) => [`${pluginId}.${key}`, value]));
};
