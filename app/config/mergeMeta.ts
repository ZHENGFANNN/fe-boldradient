/**
 * generateMetadata 的 SEO 覆盖合并 helper。
 *
 * 用法：各页 generateMetadata 末尾把默认 metadata 与当前无 locale 前缀的 pathname 传入，
 * 若运营在后台配置了同 pathname 的覆盖项，则整个替换 title/description/keywords 三个字段；
 * 未命中则原样返回 defaults。
 *
 *   return mergeMeta({
 *     title, description, keywords,
 *     alternates, openGraph, twitter, // 这些不动
 *   }, "/blog");
 *
 * 只覆盖三个字段——openGraph / alternates / twitter / metadataBase 保留由页面自己派生的值。
 * title 覆盖时按字符串整体替换（不会与 Metadata 的 title.template / title.default 结构做深合并）。
 */
import { getMetaOverride } from "./seoOverrides";

export function mergeMeta<
  T extends {
    title?: unknown;
    description?: unknown;
    keywords?: unknown;
  }
>(defaults: T, pathname: string): T {
  const o = getMetaOverride(pathname);
  if (!o) return defaults;
  const patch: Partial<T> = {};
  if (o.title) (patch as { title: string }).title = o.title;
  if (o.description)
    (patch as { description: string }).description = o.description;
  if (o.keywords) (patch as { keywords: string }).keywords = o.keywords;
  return { ...defaults, ...patch };
}
