/** @format */
import { ssrFetch } from "@/config/Api/ssrFetch";
import { isFrameworkBailout } from "@/config/Api/bailout";

// ============================================================
// 远程数据 API · GET ${HOST}/config/getProductsPricing
// 批量按 area 取多个商品的地区价格（首页/分类页客户端按 area cookie 一次取齐用）。
// 与单商品版本 getProductPricing.ts 对称：纯 SSG，构建期固化（force-cache），靠「发布」重建。
//   运行时聚合路由 /api/products-offer 复用本函数，价格随部署刷新，折扣走 no-store 实时取。
//
// ----- 返回数据结构（后端 → 前端透传，未做整形）-----
// {
//   code: 0,                              // 0 成功；-1 失败 / 参数错误（错误码 10058）
//   message: "",
//   data: {
//     area: "cn",                         // 实际生效的地区码（缺省 us）
//     list: [
//       {
//         sortKey: "engagement-ring",
//         productKey: "1-52ct-...",
//         combos: [
//           {
//             comboKey: "...",
//             associate_country_key: "...",
//             areaInfo: ErpCountriesConfig | null   // 该 area 的价格条；查不到为 null
//           }, ...
//         ],
//         associateProducts: [
//           { productKey: "...", areaInfo: ErpCountriesConfig | null }, ...
//         ]
//       }, ...
//     ]
//   }
// }
//
// ErpCountriesConfig（对应 sslfly.erp_countries_config 表，
// 来源 be-user-service/internal/app/models/catalog.go:151）：
//   {
//     id, country, country_code,
//     currency, currency_symbol, currency_unit,    // 金额 = raw / currency_unit（通常 100）
//     product_price,                               // 「分」级整数，需除 currency_unit
//     stock,                                       // 库存
//     good_sort_key, good_key, combo_key, associate_country_key,
//     created_time, updated_time
//   }
//
// 客户端用法：拿到 data.list 后建 pricingMap[`${sortKey}:${productKey}`]，渲染时
// 用 pickAreaInfo（取首个 combos[i].areaInfo 非空）作为该卡片的展示价；
// areaInfo == null 时走「缺货」分支。
// ============================================================

const HOST = process.env.NEXT_PUBLIC_HOST;

export interface ProductsPricingItem {
  sortKey: string;
  productKey: string;
  combos: Array<{
    comboKey: string;
    associate_country_key: string;
    areaInfo: any | null;
  }>;
  associateProducts: Array<{
    productKey: string;
    areaInfo: any | null;
  }>;
}

export interface ProductsPricingResult {
  area: string;
  list: ProductsPricingItem[];
}

/**
 * 批量按 area 取多个商品的定价。
 * @param keys [{sortKey, productKey}]，将转成 `sort1:p1,sort2:p2,...` query。
 * 失败/无数据返回 null（调用方退回 us 兜底或显示骨架）。
 */
export async function getProductsPricing({
  area,
  locale,
  keys,
}: {
  area: string;
  locale: string;
  keys: Array<{ sortKey: string; productKey: string }>;
}): Promise<ProductsPricingResult | null> {
  if (!HOST) {
    console.error("getProductsPricing: NEXT_PUBLIC_HOST 未配置");
    return null;
  }
  if (!keys || keys.length === 0) {
    return { area: area || "us", list: [] };
  }

  // 排序后再拼接，保证缓存 key 稳定（同一组商品打到同一缓存槽）。
  const keysParam = keys
    .map((k) => `${k.sortKey}:${k.productKey}`)
    .filter(Boolean)
    .sort()
    .join(",");

  const url =
    `${HOST}/config/getProductsPricing` +
    `?area=${encodeURIComponent(area || "us")}` +
    `&language=${encodeURIComponent(locale || "en")}` +
    `&keys=${encodeURIComponent(keysParam)}`;

  try {
    const res = await ssrFetch(url, {
      cache: "force-cache",
    });
    if (!res.ok) {
      console.error(`getProductsPricing HTTP ${res.status}`);
      return null;
    }
    const json = await res.json().catch(() => null);
    if (json?.code !== 0) {
      return null;
    }
    return (json.data ?? null) as ProductsPricingResult | null;
  } catch (err: any) {
    if (isFrameworkBailout(err)) throw err;
    console.error("getProductsPricing fetch 失败:", err?.message);
    return null;
  }
}

export default getProductsPricing;
