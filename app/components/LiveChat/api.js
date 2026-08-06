import Api from "@/request";

/** 内存缓存 TTL：避免 openPanel 重复打 /chat/config */
const CONFIG_TTL_MS = 5 * 60 * 1000;
/** 保活间隔：略小于 nginx keepalive 常见 60s，防止 idle 后 stale connection */
const KEEPALIVE_MS = 45 * 1000;

let cachedConfig = null;
let cachedAt = 0;
let inflightConfig = null;
let keepaliveTimer = null;
let keepaliveVisibleHandler = null;

/**
 * 拉取客服渠道配置（带内存缓存 + 并发去重）。
 * @param {{ force?: boolean, locale?: string, area?: string }} options
 *   force=true 跳过缓存强制请求；locale/area 用于后端按访客语言/地区解析营业时段与离线文案（Task B）。
 */
export function fetchChatConfig(options = {}) {
  const { force = false, locale, area } = options;
  const now = Date.now();

  if (!force && cachedConfig && now - cachedAt < CONFIG_TTL_MS) {
    return Promise.resolve({ code: 0, data: cachedConfig });
  }

  if (!force && inflightConfig) {
    return inflightConfig;
  }

  const params = {};
  if (locale) params.locale = locale;
  if (area) params.area = area;

  inflightConfig = Api.get("/chat/config", { params })
    .then((res) => {
      if (res?.code === 0 && res.data) {
        cachedConfig = res.data;
        cachedAt = Date.now();
      }
      return res;
    })
    .finally(() => {
      inflightConfig = null;
    });

  return inflightConfig;
}

/** 同步读取有效缓存（openPanel 热路径用，避免重复网络请求） */
export function peekChatConfig() {
  if (cachedConfig && Date.now() - cachedAt < CONFIG_TTL_MS) {
    return cachedConfig;
  }
  return null;
}

/** @deprecated 请用 fetchChatConfig */
export function getChatConfig() {
  return fetchChatConfig();
}

/**
 * 页面可见时定期 ping /chat/config，保持与 service 域名的 HTTP/2 连接活跃，
 * 避免长时间 idle 后浏览器复用 dead socket 导致 Stalled 10~20s。
 */
export function startChatApiKeepalive(opts = {}) {
  if (typeof window === "undefined" || keepaliveTimer) return;
  const { locale, area } = opts;

  const tick = () => {
    if (document.visibilityState !== "visible") return;
    fetchChatConfig({ force: true, locale, area }).catch(() => {});
  };

  keepaliveTimer = setInterval(tick, KEEPALIVE_MS);
  keepaliveVisibleHandler = () => {
    if (document.visibilityState === "visible") {
      fetchChatConfig({ force: true, locale, area }).catch(() => {});
    }
  };
  document.addEventListener("visibilitychange", keepaliveVisibleHandler);
}

export function stopChatApiKeepalive() {
  if (keepaliveTimer) {
    clearInterval(keepaliveTimer);
    keepaliveTimer = null;
  }
  if (keepaliveVisibleHandler) {
    document.removeEventListener("visibilitychange", keepaliveVisibleHandler);
    keepaliveVisibleHandler = null;
  }
}

export function getChatFaq(locale) {
  return Api.get("/chat/faq", { params: { locale } });
}

// config 用于透传 Turnstile token 请求头（turnstileHeaders(token)）。
// 后端 /chat/session 与 /chat/offline-session 都挂了 TurnstileGuard("livechat")。
export function createChatSession(body, config) {
  return Api.post("/chat/session", body, config);
}

export function getChatMessages(params) {
  return Api.get("/chat/messages", { params });
}

export function sendChatMessage(body) {
  return Api.post("/chat/message", body);
}

// Phase 2 订单分享：登录用户「我的订单」列表，复用 be-order-service 现有接口（零后端改动），
// 仅登录态（token cookie）可调，未登录后端按游客返回失败。
export function getMyOrders() {
  return Api.post("/pay/getOrderList");
}

// 上传图片/文件到 OSS，返回 { url, name, type, size }；浏览器对 FormData 自动设置 multipart
export function uploadChatFile(file) {
  const form = new FormData();
  form.append("file", file);
  return Api.post("/chat/upload", form);
}

// 离线留言表单是客服入口之一（直接带 email/phone/content），同样需要 Turnstile token。
export function sendOfflineMessage(body, config) {
  return Api.post("/chat/offline-message", body, config);
}

export function refreshWsToken(body) {
  return Api.post("/chat/ws-token", body);
}

// 切片3 满意度评价：提交评分（rating 1~5，feedback 可选）
export function evaluateChat(body) {
  return Api.post("/chat/evaluate", body);
}

// 切片3 满意度评价：查询会话是否已评价，返回 { code, data: { rated, rating, feedback } }
export function getChatEvaluation(params) {
  return Api.get("/chat/evaluation", { params });
}
