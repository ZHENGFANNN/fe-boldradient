export default {
  locales: ["en", "cn", "de", "es", "fr", "hk", "it", "ko", "ja", "ru"],
  defaultLocale: "en",
  localeDetector: (request) => {
    const { locale } = request;
    return locale;
  },
};
