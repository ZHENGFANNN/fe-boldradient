"use server";

import { getProductPricing } from "@/utils/getConfigData/getProductPricing";

/** 客户端切换 area 时走服务端 use cache 缓存的定价数据。 */
export async function loadProductPricing({
  sortKey,
  productKey,
  area,
  language,
}) {
  return getProductPricing({ sortKey, productKey, area, language });
}
