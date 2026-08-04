/** @format */

import { notFound } from "next/navigation";

import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import getRemoteConfig from "@/config/Api/getRemoteConfig";
import getTagProducts, { getAllTagPaths } from "@/config/Api/getTagProducts";

import TagList from "./components/TagList";
import CategoryListLdJson from "../../product/[sortKey]/components/CategoryListLdJson";
import { buildAlternates } from "@/config/seo";
import { mergeMeta } from "@/config/mergeMeta";

// 构建期枚举所有 (locale, tagKey)，预生成标签页。数据源 getAllTagPaths（复用 /config/getProduct，
// 内部容错失败返回 []）。后端抖动 → 空数组 → 标签页按需生成（dynamicParams 默认 true）。
export async function generateStaticParams() {
  const seen = new Set();
  const params = [];
  for (const { locale, tagKey } of await getAllTagPaths()) {
    const k = `${locale}:${tagKey}`;
    if (seen.has(k)) continue;
    seen.add(k);
    params.push({ locale, key: tagKey });
  }
  return params;
}

async function getData({ locale, key }) {
  const [LANG, CONFIG, tagData] = await Promise.all([
    getRemoteLanguage({
      locale,
      nameSpace: ["home", "common.nav", "product.category"],
    }),
    getRemoteConfig({ locale, nameSpace: ["common.base"] }),
    getTagProducts({ locale, tagKey: key }),
  ]);
  return { CONFIG, LANG, tagData };
}

export async function generateMetadata({ params }) {
  const { locale, key } = await params;
  const { CONFIG, tagData } = await getData({ locale, key });
  const company = CONFIG?.["common.base"]?.company_name;
  const pathname = `/tag/${key}`;
  if (!tagData) {
    return mergeMeta({ title: company }, pathname);
  }
  const title = `${tagData.tag.name}${company ? ` - ${company}` : ""}`;
  const description = `Shop our ${tagData.tag.name} products at ${
    company || "our store"
  }.`;
  return mergeMeta(
    {
      title,
      description,
      keywords: tagData.tag.name,
      alternates: buildAlternates(pathname, locale),
      openGraph: {
        title,
        description,
        images: tagData.goodList
          .slice(0, 4)
          .map((p) => ({ url: p.image }))
          .filter((i) => i.url),
      },
    },
    pathname
  );
}

export default async function TagPage({ params }) {
  const { locale, key } = await params;
  const { CONFIG, LANG, tagData } = await getData({ locale, key });

  // 标签不存在 / 该标签下无商品 → 404
  if (!tagData) {
    notFound();
  }

  return (
    <>
      <TagList
        tag={tagData.tag}
        goodList={tagData.goodList}
        locale={locale}
        LANG={LANG}
      />
      {/* JSON-LD 走 server 子组件（爬虫不执行 JS），SSG 阶段以默认 us 价兜底。 */}
      <CategoryListLdJson
        goodList={tagData.goodList}
        locale={locale}
        companyName={CONFIG?.["common.base"]?.company_name}
      />
    </>
  );
}
