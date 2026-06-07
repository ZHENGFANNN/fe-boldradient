/** @format */

const globalConfig = require("@@/fetch-data/globalConfig/index.json");

const pageConfigDataList = {
  cn: require("@@/fetch-data/pageConfig/cn.json"),
  de: require("@@/fetch-data/pageConfig/de.json"),
  en: require("@@/fetch-data/pageConfig/en.json"),
  es: require("@@/fetch-data/pageConfig/es.json"),
  fr: require("@@/fetch-data/pageConfig/fr.json"),
  hk: require("@@/fetch-data/pageConfig/hk.json"),
  it: require("@@/fetch-data/pageConfig/it.json"),
  ja: require("@@/fetch-data/pageConfig/ja.json"),
  ko: require("@@/fetch-data/pageConfig/ko.json"),
  ru: require("@@/fetch-data/pageConfig/ru.json"),
};

const filterConfig = ({ merged, configNameSpace }) => {
  const configObj = {};
  configNameSpace.forEach((nameSpace) => {
    Object.keys(merged).forEach((key) => {
      if (key === nameSpace || key.startsWith(`${nameSpace}.`)) {
        configObj[key] = merged[key];
      }
    });
  });
  return configObj;
};

export default async function getConfigList({
  locale,
  configList,
  configNameSpace,
}) {
  if (!configList.includes("config")) return null;
  const pageConfig = pageConfigDataList[locale] || pageConfigDataList.en;
  const merged = { ...pageConfig, ...globalConfig };
  return filterConfig({ merged, configNameSpace });
}
