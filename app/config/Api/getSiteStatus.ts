/** @format */
import { ssrFetch } from "@/config/Api/ssrFetch";

// ============================================================
// 站点可用状态 · GET ${HOST}/config/getSiteStatus
//
// 商户被停用(site.enabled=0)或已过期(site.end_time 过) → { active:false, reason }。
// 前台根 layout 据此渲染「商户已到期」提示页，不再渲染正常商城内容。
//
// 🔴 缓存：no-store（实时）。站点启用/过期状态属运维即时开关，不能被 SSG 固化，
// 否则停用后仍要等全站重建才生效。后端已有 60s 进程内缓存兜底 QPS。
// fail-open：拉取失败/无 HOST 一律视为 active，绝不因后端抖动误伤正常站前台。
// ============================================================

const HOST = process.env.NEXT_PUBLIC_HOST;

export interface SiteStatus {
  active: boolean;
  reason: string; // "" | "disabled" | "expired"
}

export default async function getSiteStatus(): Promise<SiteStatus> {
  if (!HOST) return { active: true, reason: "" };
  try {
    const res = await ssrFetch(`${HOST}/config/getSiteStatus`, {
      cache: "no-store"
    });
    if (!res.ok) return { active: true, reason: "" };
    const json = await res.json().catch(() => null);
    const data = json?.data;
    if (data && typeof data.active === "boolean") {
      return { active: data.active, reason: data.reason || "" };
    }
    return { active: true, reason: "" };
  } catch (err: any) {
    console.error("getSiteStatus fetch 失败:", err?.message);
    return { active: true, reason: "" };
  }
}
