/** @format */

// ============================================================
// 远程数据 API · GET ${HOST}/config/getPageConfigByNamespace
// 运行时按 (locale, nameSpace) 独立拉取页面配置切片。
//
// 后端已完成 page+global 合并、JSON 解析、common.base 默认语言合并、en 兜底，
// 返回 { code: <已解析的值> }，前端直接消费（无需再 JSON.parse / 过滤）。
//
// 缓存：纯 SSG，fetch 构建期固化（force-cache），靠「发布」全站重建更新。
//
// ⚠️ 曾有进程级 memo Map 缓存，已删除：
//   memo 生命周期 = Node/Worker 进程，比 Next fetch 更早命中，
//   会造成"后端已改但 memo 未清 → 前台永远拿旧数据"的运维坑。
// ============================================================

const HOST = process.env.NEXT_PUBLIC_HOST;

export default async function getRemoteConfig({
  locale,
  nameSpace = [],
}: {
  locale: string;
  nameSpace?: string | string[];
}): Promise<Record<string, any>> {
  const list = Array.isArray(nameSpace) ? nameSpace : [nameSpace];
  if (!list.length) return {};
  if (!HOST) {
    console.error("getRemoteConfig: NEXT_PUBLIC_HOST 未配置");
    return {};
  }

  const ns = list.join(",");
  const url = `${HOST}/config/getPageConfigByNamespace?locale=${encodeURIComponent(
    locale
  )}&nameSpace=${encodeURIComponent(ns)}`;

  let res;
  try {
    res = await fetch(url, {
      cache: "force-cache"
    });
  } catch (err: any) {
    console.error("getRemoteConfig fetch 失败:", err?.message);
    return {};
  }
  if (!res.ok) {
    console.error("getRemoteConfig 异常状态:", res.status);
    return {};
  }
  const json = await res.json().catch(() => null);
  return json?.data || {};
}
