/** @format */
// 商户停用/过期提示页：站点 site.enabled=0 或 end_time 过期时，
// 前台根 layout 用本组件整页替换正常商城内容（不渲染导航/商品）。
// 自包含、零外部数据依赖：过期站点可能连配置都拉不到，故文案内置、样式内联。

const COPY = {
  en: {
    title: "This store is currently unavailable",
    desc: "This store has expired or been suspended. Please contact BoldSaasify support for assistance.",
    contact: "Contact: support@boldsaasify.com"
  },
  "zh-cn": {
    title: "该商户已到期",
    desc: "该商户已到期或已停用，请联系 BoldSaasify 客服处理。",
    contact: "客服邮箱：support@boldsaasify.com"
  }
};

export default function SiteDisabled({ locale }: { locale?: string }) {
  const key = locale && locale.toLowerCase().startsWith("zh") ? "zh-cn" : "en";
  const t = COPY[key as "en" | "zh-cn"];
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        background: "#fff",
        color: "#1a1a1a",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 24 }}>🚫</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 12px" }}>
          {t.title}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#666", margin: "0 0 20px" }}>
          {t.desc}
        </p>
        <a
          href="mailto:support@boldsaasify.com"
          style={{ fontSize: 14, color: "#1a1a1a", textDecoration: "underline" }}
        >
          {t.contact}
        </a>
      </div>
    </div>
  );
}
