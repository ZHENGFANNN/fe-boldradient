/**
 * SEO 运营配置读盘层（构建期从 fetch-data/seo/index.json 读一次；运行时只读内存快照）。
 *
 * 数据来源：`yarn fetch-prod` → `script/fetch-seo.js` 从 user-service `/config/getSeoConfig`
 * 拉取并落盘。接口不存在 / 抖动时，脚本已写入空骨架（`{meta:[],sitemap:{adds:[],excludes:[]},robots:[]}`）。
 *
 * 消费方：
 *   - generateMetadata（各页）→ getMetaOverride(pathname) 按 pathname 完全匹配覆盖 title/description/keywords
 *   - app/sitemap.ts → getSitemapExtras() 追加 adds、剔除 excludes
 *   - app/robots.ts  → getRobotsExtras() 追加运营配置的 disallow/allow
 *
 * 匹配规则：pathname 归一化后精确 equal（小写 + 剥 trailing slash，`/` 保留）。
 * 不做通配 / 前缀匹配 —— 后端契约即精确匹配。
 */

interface SeoMeta {
  pathname: string;
  title?: string;
  description?: string;
  keywords?: string;
}

interface SeoSitemapAdd {
  url: string;
  change_freq?: string;
  priority?: number;
}

interface SeoRobotsRule {
  user_agent: string;
  rule_type: "disallow" | "allow";
  path: string;
}

interface SeoConfig {
  meta: SeoMeta[];
  sitemap: { adds: SeoSitemapAdd[]; excludes: string[] };
  robots: SeoRobotsRule[];
}

const EMPTY: SeoConfig = {
  meta: [],
  sitemap: { adds: [], excludes: [] },
  robots: [],
};

/**
 * 读盘并归一化。文件不存在 / JSON 损坏 / 结构不完整 → 一律回退空骨架，绝不 throw。
 * 用字面量 require（对齐 languageSettings.ts 注释）：webpack 需静态内联该 JSON，
 * 变量路径会被打包成 require-context，server bundle 里查不到文件。
 */
const loadSeoConfig = (): SeoConfig => {
  try {
    const raw = require("../../fetch-data/seo/index.json");
    const meta = Array.isArray(raw?.meta) ? (raw.meta as SeoMeta[]) : [];
    const adds = Array.isArray(raw?.sitemap?.adds)
      ? (raw.sitemap.adds as SeoSitemapAdd[])
      : [];
    const excludes = Array.isArray(raw?.sitemap?.excludes)
      ? (raw.sitemap.excludes as string[])
      : [];
    const robots = Array.isArray(raw?.robots)
      ? (raw.robots as SeoRobotsRule[])
      : [];
    return { meta, sitemap: { adds, excludes }, robots };
  } catch {
    return EMPTY;
  }
};

const cfg = loadSeoConfig();

/**
 * pathname 归一化：小写、剥 trailing slash（保留 `/`）、空值兜底为 `/`。
 * 写入 map 和查询时都过一遍，避免 `/blog` vs `/blog/` vs `/BLOG` 三者不匹配。
 */
export function normalizePathname(p: string): string {
  if (!p) return "/";
  const s = String(p).trim().toLowerCase();
  if (s === "/") return "/";
  return s.replace(/\/+$/, "");
}

const metaMap: Map<string, SeoMeta> = new Map(
  cfg.meta
    .filter((m) => m && typeof m.pathname === "string")
    .map((m) => [normalizePathname(m.pathname), m])
);

/** 按归一化 pathname 精确匹配 meta 覆盖项；未命中返回 undefined */
export function getMetaOverride(pathname: string): SeoMeta | undefined {
  return metaMap.get(normalizePathname(pathname));
}

/** sitemap 追加/剔除清单（excludes 已归一化） */
export function getSitemapExtras(): {
  adds: SeoSitemapAdd[];
  excludes: Set<string>;
} {
  const excludes = new Set(
    cfg.sitemap.excludes
      .filter((s) => typeof s === "string")
      .map((s) => normalizePathname(s))
  );
  return { adds: cfg.sitemap.adds, excludes };
}

/** robots 追加规则原样返回（分组由 app/robots.ts 组装） */
export function getRobotsExtras(): SeoRobotsRule[] {
  return cfg.robots.filter(
    (r) =>
      r &&
      typeof r.path === "string" &&
      typeof r.user_agent === "string" &&
      (r.rule_type === "disallow" || r.rule_type === "allow")
  );
}

export type { SeoMeta, SeoSitemapAdd, SeoRobotsRule, SeoConfig };
