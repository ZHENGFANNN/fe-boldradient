/** @format */

import { cacheLife, cacheTag } from "next/cache";
import getConfigList from "./getConfigList";
import getLanguageList from "./getLanguageList";
import getGoodDiscountList from "./getGoodDiscountList";
import getProductData from "./getProductData";
import getBlogData from "./getBlogData";

export default async function getConfigData({
  locale,
  area,
  configList = [],
  configNameSpace = [],
  languageNameSpace = [],
  blogNameSpace = [],
  productNameSpace = [],
}) {
  "use cache";
  cacheTag(`config:${locale}:${area || "us"}`);
  cacheLife("max");

  const [CONFIG, LANG, GOODDISCOUNTFESTIVAL, BLOG, PRODUCT] = await Promise.all(
    [
      getConfigList({ locale, configList, configNameSpace }),
      getLanguageList({ locale, configList, languageNameSpace }),
      getGoodDiscountList({ locale, area, configList }),
      getBlogData({ locale, configList, blogNameSpace }),
      getProductData({ locale, configList, productNameSpace }),
    ]
  );
  return {
    CONFIG,
    LANG,
    GOODDISCOUNTFESTIVAL,
    BLOG,
    PRODUCT,
  };
}
