/** @format */

import { cacheLife, cacheTag } from "next/cache";

const HOST = process.env.NEXT_PUBLIC_HOST;

/**
 * 商品地区价格（ISR Cache Components）。
 * tag: product:pricing:{sortKey}:{productKey}:{area} + product:pricing:{sortKey}:{productKey}
 */
export async function getProductPricing({
  sortKey,
  productKey,
  area = "us",
  language = "en",
}) {
  "use cache";
  cacheTag(`product:pricing:${sortKey}:${productKey}:${area}`);
  cacheTag(`product:pricing:${sortKey}:${productKey}`);
  cacheLife("max");

  if (!HOST) {
    console.error("getProductPricing: NEXT_PUBLIC_HOST 未配置");
    return null;
  }

  const url =
    `${HOST}/config/getProductPricing` +
    `?sortKey=${encodeURIComponent(sortKey)}` +
    `&productKey=${encodeURIComponent(productKey)}` +
    `&area=${encodeURIComponent(area)}` +
    `&language=${encodeURIComponent(language)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status !== 404) {
        console.error(
          `getProductPricing HTTP ${res.status}: ${sortKey}/${productKey}/${area}`
        );
      }
      return null;
    }
    const json = await res.json().catch(() => null);
    if (json?.code !== 0) {
      return null;
    }
    return json.data ?? null;
  } catch (err) {
    console.error(`getProductPricing fetch 失败:`, err?.message);
    return null;
  }
}

export default getProductPricing;
