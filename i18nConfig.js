import languageSettings from "@/config/languageSettings.js";

const { locales, defaultLocale, resolveLocale } = languageSettings;

console.log("===> ", locales, defaultLocale);

const i18nConfig = {
  locales,
  defaultLocale,
  localeDetector: (request) => resolveLocale(request.locale)
};

export default i18nConfig;
