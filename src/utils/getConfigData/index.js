/** @format */

import getGoodList from "@/utils/getConfigData/getGoodList";
import getConfigList from "@/utils/getConfigData/getConfigList";
import getLanguageList from "@/utils/getConfigData/getLanguageList";
import getGoodSortList from "@/utils/getConfigData/getGoodSortList";
import getGoodDiscountList from "@/utils/getConfigData/getGoodDiscountList";
import getBlogData from "@/utils/getConfigData/getBlogData";

export default async function getConfigData({
  locale,
  area,
  configList = [],
  languageNameSpace = [],
  configNameSpace = [],
  blogNameSpace = [],
}) {
  const startTIme = Date.now();
  const [CONFIG, LANG, GOODSORTLIST, GOODLIST, GOODDISCOUNTFESTIVAL, BLOG] =
    await Promise.all([
      getConfigList({ locale, configList, configNameSpace }),
      getLanguageList({ locale, configList, languageNameSpace }),
      getGoodSortList({ locale, configList, area }),
      getGoodList({ locale, configList, area }),
      getGoodDiscountList({ locale, configList }),
      getBlogData({ locale, configList, blogNameSpace }),
    ]);
  console.log(`---获取CONFIG时间: ${Date.now() - startTIme}---`);
  return {
    CONFIG,
    LANG,
    GOODSORTLIST,
    GOODLIST,
    GOODDISCOUNTFESTIVAL,
    BLOG,
  };
}
