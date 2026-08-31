/** @format */

// ============================================================
// 框架控制流信号识别
//
// Next 用「抛异常」表达一些控制流意图，而非故障：
//   - DynamicServerUsage：本路由用了 no-store fetch / cookies() / headers()，必须动态渲染
//   - notFound() / redirect()：digest 为 NEXT_NOT_FOUND / NEXT_REDIRECT
//   - BailoutToCSR：需退化为客户端渲染
// 这些异常必须**原样冒泡**给框架。数据层的 try/catch 若把它们当网络错误吞掉，
// 框架收不到信号 → 以为仍在静态渲染 → 收尾时发现路由已变动态 →
// 抛 app-static-to-dynamic-error → 整页 500（2026-08-31 product/blog 全线 500 事故根因）。
//
// 用法：Api 层每个 catch 的第一行写
//   if (isFrameworkBailout(err)) throw err;
// 之后再按业务做 fail-open 兜底。
// ============================================================

export function isFrameworkBailout(err: any): boolean {
  const digest = err?.digest;
  return (
    typeof digest === "string" &&
    (digest === "DYNAMIC_SERVER_USAGE" ||
      digest === "BAILOUT_TO_CLIENT_SIDE_RENDERING" ||
      digest.startsWith("NEXT_"))
  );
}

export default isFrameworkBailout;
