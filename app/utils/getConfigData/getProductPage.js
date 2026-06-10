/** @format */

import getConfigData from "./index";

const HOST = process.env.NEXT_PUBLIC_HOST;
const REVALIDATE_FALLBACK = 86400;

/**
 * 商品详情页聚合数据（不含地区价格）。
 * ISR：fetch + tag(product:page:sortKey:productKey)，on-demand revalidateTag 失效。
 */
export async function getProductPage({ locale, sortKey, productKey }) {
  if (!HOST) {
    console.error("getProductPage: NEXT_PUBLIC_HOST 未配置");
    return { productInfo: null, LANG: null, CONFIG: null };
  }

  const tag = `product:page:${sortKey}:${productKey}`;
  const url =
    `${HOST}/config/getProductPage` +
    `?sortKey=${encodeURIComponent(sortKey)}` +
    `&productKey=${encodeURIComponent(productKey)}` +
    `&language=${encodeURIComponent(locale)}`;

  let productInfo = null;
  try {
    const res = await fetch(url, {
      next: { tags: [tag], revalidate: REVALIDATE_FALLBACK },
    });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      productInfo = json?.data?.product ?? null;
      if (productInfo && !productInfo.key) {
        productInfo = null;
      }
    } else if (res.status !== 404) {
      console.error(`getProductPage 异常状态 ${tag}: ${res.status}`);
    }
  } catch (err) {
    console.error(`getProductPage fetch 失败 ${tag}:`, err?.message);
  }

  const { LANG, CONFIG } = await getConfigData({
    locale,
    configList: ["config", "language"],
    languageNameSpace: [
      "store.product",
      "common.pay",
      "common.footer.sales_policy",
    ],
    configNameSpace: ["common.base", "setting.pay"],
  });

  return { productInfo, LANG, CONFIG };
}

export default getProductPage;
