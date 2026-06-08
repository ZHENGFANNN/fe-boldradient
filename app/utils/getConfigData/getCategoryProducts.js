/** @format */

// 产品分类页数据：按 locale + sortKey 从后端拉取该分类下的商品列表。
//
// 与 getProductData.js 的区别：那个文件读 area cookie → 强制动态渲染，
// 分类页要整页 SSG，所以这里**不读 cookie**，保留每个商品 comboList[].areaList
// 的完整地区价，由客户端按 area cookie 解析（与商品详情页 BaseLayout 思路一致）。
//
// 数据源与 getProductData 共用 /config/getProduct + tag('product:list')，
// 后台改商品调用 revalidateTag('product:list') 即可让分类页下次访问重建。

const HOST = process.env.NEXT_PUBLIC_HOST;
const REVALIDATE_FALLBACK = 86400; // 24h，兜底；实时性靠 on-demand revalidateTag

// ⚠️ 临时测试标签（mock）。
// 后端 erp_goods_tag / erp_goods_tag_relation 已存在，但商城接口 /config/getProduct
// 目前不返回商品标签（user-service ErpGoodsInfo 未关联 Tags）。为先把「按商品标签
// 筛选」跑通且可测试，这里按需给商品注入测试标签——数据不要求准确。
// 待后端让接口返回真实 item.tags / item.tagList 后，把下面 resolveTags 改成读真实字段即可。
const MOCK_TAG_POOL = [
  "New Arrival",
  "Best Seller",
  "Lab Grown",
  "Limited Edition",
  "On Sale",
  "Ethically Sourced",
];

// 用商品 key 做稳定哈希，保证 SSR 与客户端、每次构建给同一商品分到同一组标签
// （不能用随机数，否则 hydration 不一致）。每个商品分到 1~3 个标签。
function mockTagsForKey(key) {
  let h = 0;
  for (let i = 0; i < (key || "").length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  const count = (h % 3) + 1; // 1~3 个
  const tags = [];
  for (let i = 0; i < count; i++) {
    tags.push(MOCK_TAG_POOL[(h + i * 7) % MOCK_TAG_POOL.length]);
  }
  return Array.from(new Set(tags));
}

// 解析商品标签：优先用后端真实字段（未来），否则回退到 mock。返回字符串数组。
function resolveTags(item) {
  const real =
    item.tagList || item.tags || item.tag_list || item.labelList || null;
  if (Array.isArray(real) && real.length > 0) {
    // 真实字段可能是 [{name}] 或 ["xxx"]，统一成字符串
    return real
      .map((t) => (typeof t === "string" ? t : t?.name || t?.title))
      .filter(Boolean);
  }
  return mockTagsForKey(item.key);
}

// 商品卡片精简：算评分/评论数、取主图，保留 comboList(含 areaList) 供客户端选地区价，
// 附带 tags（商品标签）供客户端筛选。
function toSimpleProduct(item) {
  const { reviewsList, reviews_num, reviews_score, image_list } = item;
  const totalScore = reviewsList?.reduce((pre, cur) => pre + cur.score, 0);
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
    comboList: Array.isArray(item.comboList) ? item.comboList : [],
    tags: resolveTags(item),
  };
}

/**
 * @returns {Promise<{ category: object, goodList: object[] } | null>}
 *   category: { key, name, description, image_src, weight }，sortKey 无对应分类时为 null
 *   找不到该分类（无商品 / 接口失败）时整体返回 null，页面据此走 notFound。
 */
export default async function getCategoryProducts({ locale, sortKey }) {
  if (!HOST) {
    console.error("getCategoryProducts: NEXT_PUBLIC_HOST 未配置");
    return null;
  }

  let res;
  try {
    res = await fetch(`${HOST}/config/getProduct`, {
      next: { tags: ["product:list"], revalidate: REVALIDATE_FALLBACK },
    });
  } catch (err) {
    console.error("getCategoryProducts fetch 失败:", err?.message);
    return null;
  }
  if (!res.ok) {
    console.error("getCategoryProducts 异常状态:", res.status);
    return null;
  }

  const json = await res.json().catch(() => null);
  const list = json?.data?.list || [];

  // 按 locale 过滤（无该语言回退英文），再按 sortKey 收敛到当前分类。
  const byLang = {};
  list.forEach((item) => {
    (byLang[item.language] ||= []).push(item);
  });
  const localeList = byLang[locale] || byLang["en"] || [];

  let category = null;
  const goodList = [];
  localeList.forEach((item) => {
    if (item.sort_key !== sortKey) return;
    const sortInfo = item.goodSort?.[0];
    if (!sortInfo?.enabled) return; // 分类未启用 → 跳过
    if (!category) {
      category = {
        key: sortInfo.key,
        name: sortInfo.name,
        description: sortInfo.description,
        image_src: sortInfo.image_src,
        weight: sortInfo.weight,
      };
    }
    goodList.push(toSimpleProduct(item));
  });

  if (!category || goodList.length === 0) return null;

  goodList.sort((a, b) => (b.weight || 0) - (a.weight || 0));
  return { category, goodList };
}

// 供分类导航/面包屑用：返回全部启用分类（去重、按权重降序）。
export async function getAllCategories({ locale }) {
  if (!HOST) return [];
  let res;
  try {
    res = await fetch(`${HOST}/config/getProduct`, {
      next: { tags: ["product:list"], revalidate: REVALIDATE_FALLBACK },
    });
  } catch {
    return [];
  }
  if (!res.ok) return [];
  const json = await res.json().catch(() => null);
  const list = json?.data?.list || [];
  const byLang = {};
  list.forEach((item) => {
    (byLang[item.language] ||= []).push(item);
  });
  const localeList = byLang[locale] || byLang["en"] || [];

  const map = {};
  localeList.forEach((item) => {
    const s = item.goodSort?.[0];
    if (!s?.enabled || map[s.key]) return;
    map[s.key] = { key: s.key, name: s.name, weight: s.weight };
  });
  return Object.values(map).sort((a, b) => (b.weight || 0) - (a.weight || 0));
}
