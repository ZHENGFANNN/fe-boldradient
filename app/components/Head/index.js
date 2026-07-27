import ThemeStyle from "./ThemeStyle";

/**
 * 站点 <head>：主题变量 + 网站图标 + API 预连接。
 *
 * 网站图标（favicon）：优先用 ERP 基本信息里生成的整套标准尺寸 `common.base.favicon`
 *   （对象 { ico, png16, png32, png48, png96, apple180, android192, android512 }，
 *    各尺寸由后台前端 canvas 生成后上传）。未配置整套时回退到 logo（旧行为）。
 */
export default function Head({ logoLink, favicon, theme }) {
  const apiOrigin = process.env.NEXT_PUBLIC_HOST?.replace(/\/$/, "");
  const fav = favicon && typeof favicon === "object" ? favicon : null;

  return (
    <head>
      {/* 薄主题层 :root CSS 变量 — 由 common.base.theme 运行期下发，缺失则组件 var() 回退默认 */}
      <ThemeStyle theme={theme} />
      {/* 网站图标：有整套标准尺寸则按 sizes 全量下发，前台/浏览器/PWA 各自适配 */}
      {fav ? (
        <>
          {fav.ico ? <link rel="icon" href={fav.ico} /> : null}
          {fav.png16 ? (
            <link rel="icon" type="image/png" sizes="16x16" href={fav.png16} />
          ) : null}
          {fav.png32 ? (
            <link rel="icon" type="image/png" sizes="32x32" href={fav.png32} />
          ) : null}
          {fav.png48 ? (
            <link rel="icon" type="image/png" sizes="48x48" href={fav.png48} />
          ) : null}
          {fav.png96 ? (
            <link rel="icon" type="image/png" sizes="96x96" href={fav.png96} />
          ) : null}
          {fav.apple180 ? (
            <link rel="apple-touch-icon" sizes="180x180" href={fav.apple180} />
          ) : null}
          {fav.android192 ? (
            <link rel="icon" type="image/png" sizes="192x192" href={fav.android192} />
          ) : null}
          {fav.android512 ? (
            <link rel="icon" type="image/png" sizes="512x512" href={fav.android512} />
          ) : null}
        </>
      ) : (
        /* 未配置整套图标：沿用 logo 作 favicon（旧行为） */
        <link rel="icon" href={logoLink} />
      )}
      {/* 提前与 API 域名建连，缩短 LiveChat 首次/idle 后请求的 Stalled */}
      {apiOrigin ? (
        <>
          <link rel="dns-prefetch" href={apiOrigin} />
          <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
        </>
      ) : null}
      {/* GA4 / Facebook Pixel 脚本改由 body 内 AnalyticsGate 按 Cookie 同意加载（见 Layout） */}
    </head>
  );
}
