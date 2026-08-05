/**
 * 统一埋点上报入口 —— 同时向 GA4、Facebook Pixel、GTM dataLayer 发送事件。
 *
 * 三家消费者的接入位置：
 *   - GA4:      app/components/Head/Analytics/index.js 加载 gtag.js 并初始化 window.gtag
 *   - FB Pixel: 同上，初始化 window.fbq
 *   - dataLayer: 由 GA4 初始化脚本创建 window.dataLayer；即使未来重接 GTM 亦可直接消费
 *
 * 事件名策略（两家名字不同，分发时各自映射）：
 *   - 内部统一用 FB Pixel PascalCase 标准名书写（Purchase/AddToCart/InitiateCheckout…）
 *   - ViewProduct → ViewContent 别名映射（FB 标准事件，享受 Meta 转化优化）
 *   - FB 侧：命中标准白名单走 fbq('track', ...)，否则 fbq('trackCustom', ...)
 *   - GA4 侧：PascalCase 标准名再映射成 GA4 推荐 snake_case 名（purchase/add_to_cart/
 *     begin_checkout/view_item/page_view…），否则事件会被 GA4 当自定义事件、进不了内置电商报表；
 *     同时把 FB 形状的 contents(orderList) 整形成 GA4 的 items[] 电商参数
 *   - 其他自定义事件（IndexBannerItem/ProductGuarantee-Email 等）两家均按原名透传
 *
 * XSS/健壮性：
 *   - 客户端存在性 guard（SSR 环境静默跳过）
 *   - gtag/fbq 未加载（埋点未配置或加载失败）时静默跳过，不阻断业务
 *   - 每家上报独立 try/catch，一家失败不影响另一家
 */

// FB Pixel 标准事件白名单，其余走 trackCustom。
// 参考 https://developers.facebook.com/docs/meta-pixel/reference#standard-events
const FB_STANDARD_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Search",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "Lead",
  "CompleteRegistration",
  "Contact",
  "CustomizeProduct",
  "Donate",
  "FindLocation",
  "Schedule",
  "StartTrial",
  "SubmitApplication",
  "Subscribe",
]);
// 事件名归一映射：把内部约定名对齐到 FB Pixel 标准事件（GA4 也接受同名）。
const EVENT_ALIAS = {
  ViewProduct: "ViewContent",
};

// GA4 事件名映射：FB PascalCase 标准名 → GA4 推荐 snake_case 事件名。
// GA4 事件名大小写敏感，直接发 PascalCase 会被当自定义事件、进不了内置电商报表。
// 参考 https://developers.google.com/analytics/devguides/collection/ga4/reference/events
const GA4_EVENT_NAME = {
  PageView: "page_view",
  ViewContent: "view_item",
  Search: "search",
  AddToCart: "add_to_cart",
  RemoveFromCart: "remove_from_cart",
  InitiateCheckout: "begin_checkout",
  AddPaymentInfo: "add_payment_info",
  Purchase: "purchase",
  // 获客 / 留资类：FB PascalCase → GA4 推荐名
  CompleteRegistration: "sign_up",
  Login: "login",
  Lead: "generate_lead",
  Subscribe: "subscribe",
  RestockNotify: "restock_notify",
};

/** contents(orderList 行) → GA4 items[]。字段名尽量对齐 GA4 电商 schema，缺失静默跳过。 */
function toGa4Items(contents) {
  if (!Array.isArray(contents)) return null;
  const items = [];
  for (const row of contents) {
    if (!row || typeof row !== "object") continue;
    const item = {};
    const itemId = row.productKey || row.comboKey || row.id;
    if (itemId != null) item.item_id = String(itemId);
    if (row.name != null) item.item_name = String(row.name);
    if (row.comboName != null) item.item_variant = String(row.comboName);
    const price = Number(row.productPrice);
    if (Number.isFinite(price)) item.price = price;
    const qty = Number(row.productNum);
    item.quantity = Number.isFinite(qty) && qty > 0 ? qty : 1;
    if (Object.keys(item).length) items.push(item);
  }
  return items.length ? items : null;
}

/**
 * FB 形状参数 → GA4 电商参数。
 * value/currency 直接沿用（GA4 电商同名），contents → items[]，丢弃 FB 专有的 contents/type。
 */
function toGa4Payload(ga4Name, params) {
  const { contents, ...rest } = params;
  const out = { ...rest };
  const items = toGa4Items(contents);
  // 仅电商类事件需要 items；其余事件（如自定义）不强加 items 字段。
  const ECOMMERCE = new Set([
    "view_item",
    "add_to_cart",
    "remove_from_cart",
    "begin_checkout",
    "add_payment_info",
    "purchase",
  ]);
  if (items && ECOMMERCE.has(ga4Name)) out.items = items;
  return out;
}

/** 清理 undefined 字段，避免 gtag/fbq 收到无效 payload */
function pruneParams(params) {
  const out = {};
  if (!params || typeof params !== "object") return out;
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) out[k] = v;
  }
  return out;
}

/**
 * 上报事件到 GA4 + FB Pixel + dataLayer。
 * @param {string} eventName 事件名（自定义或 FB 标准名）
 * @param {object} [params] 事件参数，snake_case 或 camelCase 均可
 */
export function track(eventName, params) {
  if (typeof window === "undefined" || !eventName) return;

  const name = EVENT_ALIAS[eventName] || eventName;
  const payload = pruneParams(params);

  // 1) GA4（事件名 + 参数都映射成 GA4 推荐形状；未命中标准名则按原名透传自定义事件）
  if (typeof window.gtag === "function") {
    try {
      const ga4Name = GA4_EVENT_NAME[name] || name;
      const ga4Payload = GA4_EVENT_NAME[name]
        ? toGa4Payload(ga4Name, payload)
        : payload;
      window.gtag("event", ga4Name, ga4Payload);
    } catch (e) {
      // 静默
    }
  }

  // 2) FB Pixel（标准事件走 track，自定义走 trackCustom）
  if (typeof window.fbq === "function") {
    try {
      const method = FB_STANDARD_EVENTS.has(name) ? "track" : "trackCustom";
      window.fbq(method, name, payload);
    } catch (e) {
      // 静默
    }
  }

  // 3) GTM dataLayer 兼容层：便于未来重接 GTM 容器或已有 dataLayer 消费者
  if (Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({ event: name, ...payload });
    } catch (e) {
      // 静默
    }
  }
}

/**
 * 页面浏览事件的语义快捷方式；等价于 track('PageView', params)。
 * FB Pixel 在初始化脚本里已发送一次 PageView，此函数用于 SPA 路由切换后再次上报。
 */
export function trackPageView(params) {
  track("PageView", params);
}
