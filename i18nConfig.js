import globalConfig from "./fetch-data/globalConfig/index.json";
const languageList = globalConfig["setting.language"];

const defaultLocale =
  languageList.find((item) => item.primary)?.iso_code ||
  languageList[0].iso_code;

const locales = languageList
  .map((item) => String(item.iso_code).toLowerCase())
  .filter(Boolean);

console.log(locales);

export default {
  locales,
  defaultLocale,
  localeDetector: (request) => {
    const { locale } = request;
    return locale;
  }
};
