import "@/styles/globals.css";
import "@/styles/reset.css";
import "@/styles/common.scss"

import Layout from "@/components/Layout";
import Navbar from "@/components/Layout/NavBar";
import Footer from "@/components/Layout/Footer";
import { AnalyticsNoScript, getAnalyticsIds } from "@/components/Head/Analytics";
import TrackingRoot from "@/components/TrackingRoot";

import Head from "@/components/Head";
import ChunkErrorReloader from "@/components/ChunkErrorReloader";
import { AuthGateProvider } from "@/components/Auth/AuthGateContext";
import AuthBoundary from "@/components/Auth/AuthBoundary";

import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import getRemoteConfig from "@/config/Api/getRemoteConfig";
import getSiteStatus from "@/config/Api/getSiteStatus";
import languageSettings from "@/config/languageSettings";
import SiteDisabled from "@/components/SiteDisabled";

// [locale] 段在构建期可枚举，配合 generateStaticParams 完全预渲染
export function generateStaticParams() {
  return languageSettings.locales.map((locale) => ({ locale }));
}

// Meta - viewport
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: "no",
  appleMobileWebAppCapable: "yes"
};

// 布局多语言/页面配置命名空间（各接口独立拉取，互不耦合）。
const LANG_NAMESPACE = [
  "common.nav",
  "common.cart",
  "common.footer",
  "common.other",
  "common.contact",
  "common.cookie",
  // 在线客服（LiveChat）UI 文案：面板/表单/评分/订单商品分享等，统一走公共多语言
  "common.chat",
  // 页脚政策链接（PolicyModule）：隐私条款 / 用户协议。取自 user.login 命名空间，
  // 只取这两条叶子 key，避免为两条文案拉整个 login 命名空间（否则非英文站回退英文）。
  "user.login.privacy_policy",
  "user.login.user_service"
];

const CONFIG_NAMESPACE = [
  "common.base",
  "common.social",
  "common.top_bar",
  "common.top_nav",
  "common.footer_nav"
];

/**
 * 获取布局数据。传统 ISR：不再用 'use cache'，
 * 缓存语义下沉到各 fetch 的 next:{tags,revalidate}。
 *
 * 导航全面配置化：导航栏读 CONFIG["common.top_nav"]、页脚读 CONFIG["common.footer_nav"]，
 * 不再依赖商品/博客分类聚合数据（旧 NAVFUNC + PRODUCT/BLOG layout 已下线）。
 * 购物车改 /api/cart 实时取价；博客 banner 由 blog 首页独立调用。
 *   - LANG / CONFIG：getRemoteLanguage / getRemoteConfig（按 nameSpace + locale）
 */
async function getData({ locale }) {
  const [LANG, CONFIG] = await Promise.all([
    getRemoteLanguage({ locale, nameSpace: LANG_NAMESPACE }),
    getRemoteConfig({ locale, nameSpace: CONFIG_NAMESPACE })
  ]);
  return { LANG, CONFIG };
}

export default async function RootLayout(props) {
  const { children, params } = props;
  const { locale } = await params;

  // 商户停用/过期拦截：实时查站点状态（no-store），非 active 时整页渲染提示页，
  // 不加载正常商城内容。fail-open：查不到状态按可用处理。
  const siteStatus = await getSiteStatus();
  if (!siteStatus.active) {
    return (
      <html lang={locale}>
        <body>
          <SiteDisabled locale={locale} />
        </body>
      </html>
    );
  }

  const { CONFIG, LANG } = await getData({ locale });

  return (
    <html lang={locale}>
      <Head logoLink={CONFIG["common.base"]?.logo} favicon={CONFIG["common.base"]?.favicon} theme={CONFIG["common.base"]?.theme} />
      <body>
        <ChunkErrorReloader />
        <AnalyticsNoScript />
        <TrackingRoot />
        <AuthGateProvider>
          <Layout
            locale={locale}
            LANG={LANG}
            CONFIG={CONFIG}
            analytics={getAnalyticsIds()}
          >
            <Navbar />
            <div id="app-content">
              <AuthBoundary LANG={LANG}>{children}</AuthBoundary>
            </div>
            <Footer />
          </Layout>
        </AuthGateProvider>
      </body>
    </html>
  );
}
