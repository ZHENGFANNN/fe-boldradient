/** @format */

const toLocale = (isoCode) => String(isoCode || "").toLowerCase();

// globalConfig 由构建期 `yarn fetch-prod`（script/fetch-config.js）生成。
// 该文件在首次构建时尚不存在，这里用 try/catch 容错返回空配置，
// 避免「模块加载即崩溃」——失败的 require 不会被 Node 缓存，
// fetch-config 写盘后通过 reload() 即可读到最新数据。
const loadGlobalConfig = () => {
  try {
    return require("../../fetch-data/globalConfig/index.json");
  } catch {
    return {};
  }
};

const buildLanguageSettings = (globalConfig) => {
  const settingLanguages = (globalConfig["setting.language"] ?? []).filter(
    (item) => item.enabled
  );

  const languageList = settingLanguages.map((item) => {
    const value = toLocale(item.iso_code);
    return {
      value,
      label: item.endonym_name || item.name || value,
      iso_code: item.iso_code,
      root_url: item.root_url,
      primary: Boolean(item.primary)
    };
  });

  const languageMap = {};
  languageList.forEach((item) => {
    languageMap[item.value] = item;
  });

  const locales = languageList.map((item) => item.value);
  const primaryItem =
    settingLanguages.find((item) => item.primary) || settingLanguages[0];
  const defaultLocale = primaryItem
    ? toLocale(primaryItem.iso_code)
    : locales[0] || "en";

  return {
    settingLanguages,
    languageList,
    languageMap,
    locales: locales.length ? locales : ["en"],
    defaultLocale
  };
};

let current = buildLanguageSettings(loadGlobalConfig());

const getSettingLanguages = () => current.settingLanguages;

const resolveLocale = (locale) => {
  const normalized = toLocale(locale);
  return current.locales.includes(normalized)
    ? normalized
    : current.defaultLocale;
};

const exported = {
  languageList: current.languageList,
  languageMap: current.languageMap,
  locales: current.locales,
  defaultLocale: current.defaultLocale,
  getSettingLanguages,
  toLocale,
  resolveLocale
};

// 构建期：fetch-config 写入 globalConfig 后调用，刷新内存中的语言配置快照。
// 运行时不会调用（json 在模块加载时已存在），故运行时消费方读到的始终是静态值。
const reload = () => {
  try {
    if (typeof require !== "undefined" && require.cache) {
      delete require.cache[
        require.resolve("../../fetch-data/globalConfig/index.json")
      ];
    }
  } catch {
    // ignore：构建期路径解析失败时退回容错空配置
  }
  current = buildLanguageSettings(loadGlobalConfig());
  exported.languageList = current.languageList;
  exported.languageMap = current.languageMap;
  exported.locales = current.locales;
  exported.defaultLocale = current.defaultLocale;
  return current;
};

exported.reload = reload;

module.exports = exported;
