/** @format */
import { ssrFetch } from "@/config/Api/ssrFetch";

// ============================================================
// 远程数据 API · GET ${HOST}/config/getProductPage
// app/config/Api 远程数据接口层：运行时从后端拉取数据。
//
// 只负责拉商品本身（productInfo）。多语言/页面配置由各调用方
// 按命名空间独立走 getRemoteLanguage / getRemoteConfig，各接口互不耦合。
// ============================================================

const HOST = process.env.NEXT_PUBLIC_HOST;

/**
 * 商品详情数据（不含地区价格、不含多语言/配置）。
 * 纯 SSG：fetch 构建期固化（force-cache），内容更新靠「发布」全站重建。
 *
 * customizeFields：商品定制字段配置（仅 enabled，后端按 weight 升序），
 * 与 product 平级返回；定制字段下沉 user-service 后随详情一并下发，
 * 前端不再单独调用 order-service /pay/getCustomizeFields。
 */
export async function getProductPage({
  locale,
  sortKey,
  productKey,
}: {
  locale: string;
  sortKey: string;
  productKey: string;
}): Promise<{ productInfo: any; customizeFields: any[] }> {
  if (!HOST) {
    console.error("getProductPage: NEXT_PUBLIC_HOST 未配置");
    return { productInfo: null, customizeFields: [] };
  }

  const url =
    `${HOST}/config/getProductPage` +
    `?sortKey=${encodeURIComponent(sortKey)}` +
    `&productKey=${encodeURIComponent(productKey)}` +
    `&language=${encodeURIComponent(locale)}`;

  let productInfo = null;
  let customizeFields: any[] = [];

  try {
    const res = await ssrFetch(url, {
      signal: AbortSignal.timeout(15000),
      cache: "force-cache",
    });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      productInfo = json?.data?.product ?? null;
      if (productInfo && !productInfo.key) {
        productInfo = null;
      }
      // 定制字段与 product 平级；商品无效时不下发字段。
      if (productInfo) {
        const fields = json?.data?.customizeFields;
        customizeFields = Array.isArray(fields) ? fields : [];
      }
    } else if (res.status === 404) {
      productInfo = null;
    } else {
      throw new Error(
        `getProductPage HTTP ${res.status}: ${sortKey}/${productKey}`
      );
    }
  } catch (err: any) {
    console.error(`getProductPage fetch 失败:`, err?.message);
    // 网络/超时错误不吞掉，避免 use cache 把 null 缓存成「永久 404」
    throw err;
  }

  // 兜底清洗 image_list：ERP 图片列表表单可能存下末尾空占位（{} 或 {src:""}），
  // 直接渲染会出一个空图位，且 layout 的 new URL(image_list[0].src) 会抛错。
  // 在数据源头统一过滤掉无 src 的条目，所有消费方（metadata/openGraph/展示组件）随之干净。
  if (productInfo && Array.isArray(productInfo.image_list)) {
    productInfo.image_list = productInfo.image_list.filter(
      (it: any) => it && typeof it.src === "string" && it.src.trim() !== ""
    );
  }

  return { productInfo, customizeFields };
}
