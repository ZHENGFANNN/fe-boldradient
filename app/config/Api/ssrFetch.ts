/** @format */

// ============================================================
// SSR/SSG 数据拉取统一 fetch 包装：自动注入 X-Site-Domain。
//
// 共享后端按域名切库，但构建期 Node fetch 无 Origin 头，必须显式带上本站域名。
// 用法：把 `await fetch(url, opts)` 换成 `await ssrFetch(url, opts)` 即可，
// opts 原样透传，仅在其 headers 上合并 X-Site-Domain（不覆盖调用方已有头）。
// ============================================================

import { siteHeaders } from "@/config/siteDomain";

export function ssrFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const merged: RequestInit = { ...(init || {}) };
  // 合并 header：站点头在前，调用方原有头在后（原有头优先，不被覆盖）。
  merged.headers = { ...siteHeaders(), ...((init && init.headers) || {}) };
  return fetch(input, merged);
}
