/** @format */
import { ssrFetch } from "@/config/Api/ssrFetch";
import { isFrameworkBailout } from "@/config/Api/bailout";

// ============================================================
// 站点可用状态 · GET ${HOST}/config/getSiteStatus
//
// 商户被停用(site.enabled=0)或已过期(site.end_time 过) → { active:false, reason }。
// 前台根 layout 据此渲染「商户已到期」提示页，不再渲染正常商城内容。
//
// 🔴 缓存：revalidate 60，**不能用 no-store**。本接口在根 layout 里调用，覆盖全站路由；
// no-store 会让 Next 对每个 SSG 路由(product/blog/tag 等带 generateStaticParams 的)
// 抛 DynamicServerError 强制降级为动态渲染，而按需 ISR 渲染时这个降级会变成
// 「Page changed from static to dynamic at runtime」→ 整页 500(2026-08-31 线上事故)。
// 站点启用/过期是运维即时开关，60s 内生效已足够，且后端本就有 60s 进程内缓存。
//
// fail-open：拉取失败/无 HOST 一律视为 active，绝不因后端抖动误伤正常站前台。
// ============================================================

const HOST = process.env.NEXT_PUBLIC_HOST;

export interface SiteStatus {
  active: boolean;
  reason: string; // "" | "disabled" | "expired"
}

const FALLBACK: SiteStatus = { active: true, reason: "" };

export default async function getSiteStatus(): Promise<SiteStatus> {
  if (!HOST) return FALLBACK;
  try {
    const res = await ssrFetch(`${HOST}/config/getSiteStatus`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return FALLBACK;
    const json = await res.json().catch(() => null);
    const data = json?.data;
    if (data && typeof data.active === "boolean") {
      return { active: data.active, reason: data.reason || "" };
    }
    return FALLBACK;
  } catch (err: any) {
    if (isFrameworkBailout(err)) throw err;
    console.error("getSiteStatus fetch 失败:", err?.message);
    return FALLBACK;
  }
}
