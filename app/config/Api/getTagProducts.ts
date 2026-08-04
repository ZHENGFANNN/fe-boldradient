/** @format */
import { ssrFetch } from "@/config/Api/ssrFetch";

// ============================================================
// 远程数据 API · GET ${HOST}/config/getProduct（复用分类页同一数据源）
// 商品标签页数据：按 locale + tagKey 从全量商品里筛出「标签 tagList 含该 key」的商品。
// 不新增后端接口——/config/getProduct 已返回每个商品的 tagList([{key,name,language}])。
// 纯 SSG，构建期固化，靠「发布」重建。
// ============================================================

const HOST = process.env.NEXT_PUBLIC_HOST;

import type { SimpleProduct } from "./types";

interface TagProductsResult {
  tag: {
    key: string;
    name: string;
    description?: string;
  };
  goodList: SimpleProduct[];
}

// 商品卡片精简（与 getCategoryProducts.toSimpleProduct 同款口径）：
// comboList 只保留 (key, associate_country_key) 供客户端按 area 批量取价。
function toSimpleProduct(item: any): SimpleProduct {
  const { reviewsList, reviews_num, reviews_score, image_list } = item;
  const totalScore = reviewsList?.reduce(
    (pre: number, cur: any) => pre + cur.score,
    0
  );
  return {
    key: item.key,
    sort_key: item.sort_key,
    name: item.name,
    description: item.description,
    image: image_list?.[0]?.src,
    image_scenes: item.image_scenes,
    image_list: image_list,
    reviewScore: totalScore / reviewsList?.length || reviews_score,
    reviewsNum: reviewsList?.length || reviews_num,
    reviews_score,
    reviews_num,
    weight: item.weight,
    comboList: Array.isArray(item.comboList)
      ? item.comboList.map((c: any) => ({
          key: c?.key,
          associate_country_key: c?.associate_country_key,
        }))
      : [],
  };
}

// 取商品 tagList 里匹配 tagKey 的项（返回该 tag 的 {key,name,description}），不匹配返回 null。
function matchTag(
  item: any,
  tagKey: string
): { key: string; name: string; description: string } | null {
  const list = Array.isArray(item?.tagList) ? item.tagList : [];
  for (const t of list) {
    if (t?.key === tagKey) {
      return {
        key: t.key,
        name: t.name || t.key,
        description: t.description || "",
      };
    }
  }
  return null;
}

/**
 * @returns tag: { key, name }；goodList: 该标签下商品（按 weight 降序）。
 *   标签不存在 / 该标签下无商品 / 接口失败 → 整体返回 null（页面据此走 notFound）。
 */
export default async function getTagProducts({
  locale,
  tagKey,
}: {
  locale: string;
  tagKey: string;
}): Promise<TagProductsResult | null> {
  if (!HOST) {
    console.error("getTagProducts: NEXT_PUBLIC_HOST 未配置");
    return null;
  }

  let res;
  try {
    res = await ssrFetch(`${HOST}/config/getProduct`, { cache: "force-cache" });
  } catch (err: any) {
    console.error("getTagProducts fetch 失败:", err?.message);
    return null;
  }
  if (!res.ok) {
    console.error("getTagProducts 异常状态:", res.status);
    return null;
  }

  const json = await res.json().catch(() => null);
  const list = json?.data?.list || [];

  // 按 locale 过滤（无该语言回退英文）。
  const byLang: Record<string, any[]> = {};
  list.forEach((item: any) => {
    (byLang[item.language] ||= []).push(item);
  });
  const localeList = byLang[locale] || byLang["en"] || [];

  let tag: TagProductsResult["tag"] | null = null;
  const goodList: SimpleProduct[] = [];
  localeList.forEach((item: any) => {
    const hit = matchTag(item, tagKey);
    if (!hit) return;
    // 分类启用校验：商品所属分类未启用则不展示（与分类页口径一致）。
    const sortInfo = item.goodSort?.[0];
    if (sortInfo && sortInfo.enabled === false) return;
    if (!tag) tag = hit;
    goodList.push(toSimpleProduct(item));
  });

  if (!tag || goodList.length === 0) return null;

  goodList.sort((a, b) => (b.weight || 0) - (a.weight || 0));
  return { tag, goodList };
}

// 供 generateStaticParams / sitemap 用：聚合全部 (locale, tagKey)（去重）。
export async function getAllTagPaths(): Promise<
  { locale: string; tagKey: string }[]
> {
  if (!HOST) return [];
  let res;
  try {
    res = await ssrFetch(`${HOST}/config/getProduct`, { cache: "force-cache" });
  } catch {
    return [];
  }
  if (!res.ok) return [];
  const json = await res.json().catch(() => null);
  const list = json?.data?.list || [];

  const seen = new Set<string>();
  const out: { locale: string; tagKey: string }[] = [];
  list.forEach((item: any) => {
    const locale = item.language;
    const sortInfo = item.goodSort?.[0];
    if (sortInfo && sortInfo.enabled === false) return;
    const tags = Array.isArray(item?.tagList) ? item.tagList : [];
    tags.forEach((t: any) => {
      if (!t?.key || !locale) return;
      const k = `${locale}:${t.key}`;
      if (seen.has(k)) return;
      seen.add(k);
      out.push({ locale, tagKey: t.key });
    });
  });
  return out;
}
