/** @format */

const cn = require("@@/locale/productSort/cn.json");
const de = require("@@/locale/productSort/de.json");
const en = require("@@/locale/productSort/en.json");
const es = require("@@/locale/productSort/es.json");
const fr = require("@@/locale/productSort/fr.json");
const hk = require("@@/locale/productSort/hk.json");
const it = require("@@/locale/productSort/it.json");
const ja = require("@@/locale/productSort/ja.json");
const ko = require("@@/locale/productSort/ko.json");
const ru = require("@@/locale/productSort/ru.json");

const productSortList = {
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

/**
 * 过滤商品分类数据
 */
const filterGoodSort = function ({ localeGoodSort, area }) {
  const data = localeGoodSort.map(({ goodList, ...goodSort }) => {
    // 遍历商品
    goodList = goodList.map(({ comboList, ...good }) => {
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
      return {
        comboList,
        ...good,
      };
    });
    return {
      goodList,
      ...goodSort,
    };
  });
  return data;
};

export default async function getGoodSortList({ locale, configList, area }) {
  if (!configList.includes("goodSort")) return null;
  const localeGoodSort = productSortList[locale];
  return filterGoodSort({ localeGoodSort, area });
}
