import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import getRemoteConfig from "@/config/Api/getRemoteConfig";
import getRemoteProductList from "@/config/Api/getRemoteProductList";

import IndexContext from "./components/IndexContext";
import IndexBanner from "./components/IndexBanner";
import CategoryModule from "./components/CategoryModule";
import IndexDiamondShapes from "./components/IndexDiamondShapes";
import IndexProductList from "./components/IndexProductList";
import IndexProductLdJson from "./components/IndexProductLdJson";

import { buildAlternates } from "@/config/seo";
import { mergeMeta } from "@/config/mergeMeta";

// 首页数据层（后端整形 + TTL，前端开箱即用），构建期一次 Promise.all 取全 —— 纯 SSG：
//   - LANG      ← /config/getLanguageByNamespace（home + home.category 文案命名空间）
//   - CONFIG    ← /config/getPageConfigByNamespace（home.banner / common.base）
//   - 产品列表  ← getRemoteProductList（comboList 仅含 key + associate_country_key，
//                价格/折扣由客户端 IndexProductList 按 area cookie 调 /api/products-offer 批量取齐）
// 不读 area cookie → 首页整页可 SSG；JSON-LD 走 IndexProductLdJson server 子组件以 us 兜底。
async function getData({ locale }) {
  const [LANG, CONFIG, goodsSortList] = await Promise.all([
    getRemoteLanguage({
      locale,
      nameSpace: [
        "home",
        "common.advantage",
        "home.title",
        "home.description",
        "home.keywords",
        "home.category"
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
        {/* 首屏 KV 轮播（banner 为空时组件内部渲染空轨道，不报错） */}
        <IndexBanner />
        {/* Shop Jewelry by Category：横向滑动分类卡（参考 brilliantearth 版式，空店走 8 分类兜底） */}
        <CategoryModule />
        {/* 按形状选购钻石（旗舰站特色，纯 SSG） */}
        <IndexDiamondShapes />
        {/* 精选商品分类网格（复用现有卡片 + 客户端取价）：0 商品时各类 goodList 为空、不渲染 */}
        <IndexProductList />
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
