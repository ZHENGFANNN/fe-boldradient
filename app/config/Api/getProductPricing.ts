/** @format */
import { ssrFetch } from "@/config/Api/ssrFetch";
import { isFrameworkBailout } from "@/config/Api/bailout";

// ============================================================
// 远程数据 API · GET ${HOST}/config/getProductPricing
// app/config/Api 远程数据接口层：运行时从后端拉取数据。
// ============================================================

const HOST = process.env.NEXT_PUBLIC_HOST;

/**
 * 商品地区价格（纯 SSG：构建期固化 force-cache，靠「发布」全站重建更新）。
 */
export async function getProductPricing({
  sortKey,
  productKey,
  area,
  locale,
}: {
  sortKey: string;
  productKey: string;
  area: string;
  locale: string;
}): Promise<any | null> {
  if (!HOST) {
    console.error("getProductPricing: NEXT_PUBLIC_HOST 未配置");
    return null;
  }

  const url =
    `${HOST}/config/getProductPricing` +
    `?sortKey=${encodeURIComponent(sortKey)}` +
    `&productKey=${encodeURIComponent(productKey)}` +
    `&area=${encodeURIComponent(area)}` +
    `&language=${encodeURIComponent(locale)}`;

  try {
    const res = await ssrFetch(url, {
      cache: "force-cache",
    });
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
  } catch (err: any) {
    if (isFrameworkBailout(err)) throw err;
    console.error(`getProductPricing fetch 失败:`, err?.message);
    return null;
  }
}
