import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import getRemoteConfig from "@/config/Api/getRemoteConfig";
import getRemoteProductList from "@/config/Api/getRemoteProductList";

import IndexProductList from "./components/IndexProductList";
import IndexProductLdJson from "./components/IndexProductLdJson";
import IndexBanner from "./components/IndexBanner";
import IndexContext from "./components/IndexContext";
import IndexSale from "./components/IndexSale";
import FeatureShowcase from "./components/FeatureShowcase";

import { buildAlternates } from "@/config/seo";
import { mergeMeta } from "@/config/mergeMeta";

// 多语言/页面配置/产品列表各走独立远程接口（后端整形 + TTL，前端开箱即用）：
//   - LANG    ← /config/getLanguageByNamespace
//   - CONFIG  ← /config/getPageConfigByNamespace（home.banner / common.base）
//   - 产品列表 ← getRemoteProductList（comboList 仅含 key + associate_country_key，
//               价格与折扣由客户端 IndexProductList 按 area cookie 调 /api/products-offer 批量取齐）
// 不读 area cookie → 首页整页可静态化（SSG）；JSON-LD 走 IndexProductLdJson server 子组件以 us 兜底。
async function getData({ locale }) {
  const [LANG, CONFIG, goodsSortList] = await Promise.all([
    getRemoteLanguage({
      locale,
      nameSpace: [
        "home",
        "common.advantage",
        "home.title",
        "home.description",
        "home.keywords"
      ]
    }),
    getRemoteConfig({ locale, nameSpace: ["home.banner", "common.base"] }),
    getRemoteProductList({ locale })
  ]);

  return { LANG, CONFIG, goodsSortList };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { LANG, CONFIG } = await getData({ locale });
  return mergeMeta(
    {
      title: `${CONFIG["common.base"]?.company_name} - ${LANG["home.title"]}`,
      description: LANG["home.description"],
      keywords: LANG["home.keywords"],
      alternates: buildAlternates("/", locale)
    },
    "/"
  );
}

export default async function Home({ params }) {
  const { locale } = await params;
  const { CONFIG, LANG, goodsSortList } = await getData({ locale });

  return (
    <main>
      <IndexContext
        CONFIG={CONFIG}
        LANG={LANG}
        goodsSortList={goodsSortList}
        locale={locale}
      >
        <IndexBanner />
        {/* Sale 模块：自动展示当前价格有折扣的商品（数据驱动，无折扣商品时整块隐藏） */}
        <IndexSale limit={8} />
        <IndexProductList />
        {/* 图文交替展示（示例数据，左图右文/右文左图交替，PC 两列、移动单列） */}
        {/* <FeatureShowcase
          list={[
            {
              eyebrow: "Everyday Carry",
              title: "Built for Your Day",
              desc: "Structured leather totes roomy enough for a 16-inch laptop, refined enough for dinner. One bag, from desk to weekend.",
              image:
                "https://asset.shefreely.com/public/tote-bags/everyday-zip-tote/1.jpg",
              cta_text: "Shop Totes",
              cta_href: "/product/tote-bags"
            },
            {
              eyebrow: "Hands-Free",
              title: "Move Lightly",
              desc: "Crossbody silhouettes that keep essentials close and hands free — for markets, travel, and slow weekend mornings.",
              image:
                "https://asset.shefreely.com/public/crossbody-bags/half-moon-crossbody/1.jpg",
              cta_text: "Shop Crossbody",
              cta_href: "/product/crossbody-bags"
            },
            {
              eyebrow: "Quiet Luxury",
              title: "Soft, Slouchy, Timeless",
              desc: "Supple shoulder bags in considered leather — the kind of piece that only looks better with the years.",
              image:
                "https://asset.shefreely.com/public/shoulder-bags/slouch-hobo-shoulder-bag/1.jpg",
              cta_text: "Shop Shoulder Bags",
              cta_href: "/product/shoulder-bags"
            }
          ]}
        /> */}
      </IndexContext>
      {/* JSON-LD 走 server 子组件（爬虫不执行 JS），SSG 阶段以默认 us 价兜底。 */}
      <IndexProductLdJson
        goodsSortList={goodsSortList}
        locale={locale}
        companyName={CONFIG["common.base"]?.company_name}
      />
    </main>
  );
}
