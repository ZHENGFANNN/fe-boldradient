/** @format */

const cn = require("@@/locale/productList/cn.json");
const de = require("@@/locale/productList/de.json");
const en = require("@@/locale/productList/en.json");
const es = require("@@/locale/productList/es.json");
const fr = require("@@/locale/productList/fr.json");
const hk = require("@@/locale/productList/hk.json");
const it = require("@@/locale/productList/it.json");
const ja = require("@@/locale/productList/ja.json");
const ko = require("@@/locale/productList/ko.json");
const ru = require("@@/locale/productList/ru.json");

const productInfoList = {
  cn,
  de,
  en,
  es,
  fr,
  hk,
  it,
  ja,
  ko,
  ru,
};

// 过滤商品数据
const filterGood = function ({ localeProduct, area }) {
  return localeProduct.map(({ comboList, ...good }) => {
    // 遍历商品套餐
    comboList = comboList.map(({ areaList, ...combo }) => {
      // 遍历商品套餐区域, 找到对应的国家列表
      let areaInfo = null;
      areaList.forEach((areaItem) => {
        if (areaItem.country_code === area) {
          areaInfo = areaItem;
        }
      });
      return {
        areaInfo,
        ...combo,
      };
    });
    return { comboList, ...good };
  });
};

export default async function getGoodList({ locale, configList, area }) {
  if (!configList.includes("good")) return null;
  const localeProduct = productInfoList[locale];
  return filterGood({ area, localeProduct });
}
