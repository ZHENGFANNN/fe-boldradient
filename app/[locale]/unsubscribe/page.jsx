/** @format */

// ============================================================
// 营销邮件退订落地页：/[locale]/unsubscribe?token=xxx
//
// token 来自事务邮件里的退订链接。为避免邮件客户端预取链接（link prefetch）
// 误触发退订，本页不自动提交，改由用户显式点击「Confirm unsubscribe」后
// 才调 POST /user/unsubscribe。交互全在客户端子组件 UnsubscribeClient 完成。
//
// 无 unsubscribe 多语言命名空间，文案硬编码英文（对齐 auth/google/finish 页）。
// ============================================================

import getRemoteConfig from "@/config/Api/getRemoteConfig";
import { buildAlternates } from "@/config/seo";
import UnsubscribeClient from "./components/UnsubscribeClient";

async function getData({ locale }) {
  const CONFIG = await getRemoteConfig({
    locale,
    nameSpace: ["common.base"],
  });
  return { CONFIG };
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

export default function UnsubscribePage() {
  return <UnsubscribeClient />;
}
