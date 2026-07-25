/** @format */

// ============================================================
// 站点域名标识（多站点后端按域名切库）
//
// 共享后端(service.boldsaasify.com)只看到网关域名,无法判定站点,
// 因此前台每个请求都要显式带上「自身域名」,后端据此匹配 boldsaasify.site
// 表 → 对应业务库。SSR/SSG 构建期无 Origin 头,只能靠此显式注入。
//
// 取值优先级：NEXT_PUBLIC_SITE_DOMAIN（显式配置，per-site 部署时指定）
//   → 从 NEXT_PUBLIC_DOMAIN 解析出 host（如 https://www.boldradiant.com → www.boldradiant.com）。
// 后端会做 eTLD+1 归一化，带不带 www./scheme 都能匹配。
// ============================================================

function deriveSiteDomain(): string {
  const explicit = (process.env.NEXT_PUBLIC_SITE_DOMAIN || "").trim();
  if (explicit) return explicit;
  const domain = (process.env.NEXT_PUBLIC_DOMAIN || "").trim();
  if (!domain) return "";
  try {
    return new URL(domain).host;
  } catch {
    // 非完整 URL（可能已是裸域名），原样返回。
    return domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}

export const SITE_DOMAIN = deriveSiteDomain();

// siteHeaders 返回带 X-Site-Domain 的 header 对象，供 SSR fetch 展开使用：
//   fetch(url, { headers: { ...siteHeaders() } })
// SITE_DOMAIN 为空时返回空对象（本地无配置时不注入，后端 dev 回退默认站）。
export function siteHeaders(): Record<string, string> {
  return SITE_DOMAIN ? { "X-Site-Domain": SITE_DOMAIN } : {};
}
