/** @format */

// ============================================================
// 营销邮件退订落地页：/[locale]/unsubscribe?token=xxx
//
// token 来自事务邮件里的退订链接。为避免邮件客户端预取链接（link prefetch）
// 误触发退订，本页不自动提交，改由用户显式点击「Confirm unsubscribe」后
// 才调 POST /user/unsubscribe。交互全在客户端子组件 UnsubscribeClient 完成。
//
// 文案走公共多语言 common.unsubscribe.*（服务端拉 LANG 传入），各语言兜底英文。
// ============================================================

import getRemoteConfig from "@/config/Api/getRemoteConfig";
import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import { buildAlternates } from "@/config/seo";
import UnsubscribeClient from "./components/UnsubscribeClient";

async function getData({ locale }) {
  const [CONFIG, LANG] = await Promise.all([
    getRemoteConfig({ locale, nameSpace: ["common.base"] }),
    getRemoteLanguage({
      locale,
      nameSpace: [
        "common.unsubscribe.loading",
        "common.unsubscribe.invalid_title",
        "common.unsubscribe.invalid_desc",
        "common.unsubscribe.success_title",
        "common.unsubscribe.success_desc_suffix",
        "common.unsubscribe.failed_title",
        "common.unsubscribe.confirm_title",
        "common.unsubscribe.confirm_desc",
        "common.unsubscribe.confirm_btn",
        "common.unsubscribe.submitting",
        "common.unsubscribe.error_generic",
      ],
    }),
  ]);
  return { CONFIG, LANG };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { CONFIG } = await getData({ locale });
  const company = CONFIG["common.base"]?.company_name || "";
  return {
    title: `${company} - Unsubscribe`,
    description: "Unsubscribe from marketing emails.",
    robots: { index: false, follow: false },
    alternates: buildAlternates("/unsubscribe", locale),
  };
}

export default async function UnsubscribePage({ params }) {
  const { locale } = await params;
  const { LANG } = await getData({ locale });
  return <UnsubscribeClient LANG={LANG} />;
}
