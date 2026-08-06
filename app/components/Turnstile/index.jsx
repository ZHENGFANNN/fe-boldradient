"use client";

/**
 * Turnstile —— Cloudflare 人机验证的通用组件。
 *
 * 设计目标（一次写好、各业务复用）：
 *   1. **业务只传一个 code**：`<Turnstile action="register" />`。这个 code 就是 Turnstile 原生的
 *      action 字段，会随 token 回传给后端；后端中间件 TurnstileGuard("register") 校验二者一致。
 *      不校验 action 的话，攻击者能在防护弱的表单拿到合法 token 挪用到注册接口。
 *   2. **全平台通用、新站零配置**：siteKey 不写死也不走构建变量，而是运行时从
 *      /config/getSecuritySettings 取（所有站点打同一后端）。新开的站点自动生效，
 *      密钥轮换也不用重新构建任何站点。
 *   3. **未配置即透明降级**：后端没配 secret 时该接口返回 enabled=false，
 *      本组件不渲染任何东西、getToken() 直接返回 ""，业务照常提交。
 *      与后端「secret 为空即放行」严格同步，不会出现前端拦了后端不认、或反之。
 *
 * 用法：
 *   const tsRef = useRef(null);
 *   const token = await tsRef.current?.getToken();      // 拿不到会等，超时返回 ""
 *   await Api.xxx(body, turnstileHeaders(token));
 *   tsRef.current?.reset();                             // 🔴 提交后必须重置：token 一次性
 *   <Turnstile ref={tsRef} action="register" />
 */

import React from "react";
import Api from "@/request";

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// 请求头名，与后端 middleware/turnstile.go 的 turnstileHeader 保持一致。
export const TURNSTILE_HEADER = "X-Turnstile-Token";

/** 把 token 包成 axios config；token 为空时返回空对象，调用方无需分支。 */
export function turnstileHeaders(token) {
  if (!token) return {};
  return { headers: { [TURNSTILE_HEADER]: token } };
}

// 站点安全配置只取一次，多个组件实例（注册页 + 客服浮窗）共享同一个 Promise，避免重复请求。
let securityConfigPromise = null;
function loadSecurityConfig() {
  if (!securityConfigPromise) {
    securityConfigPromise = Api.get("/config/getSecuritySettings")
      .then((res) => (res?.code === 0 ? res.data?.turnstile || null : null))
      // 配置拉不到就当未启用——降级放行，不能因为一个配置接口抖动把注册/客服入口锁死。
      .catch(() => null);
  }
  return securityConfigPromise;
}

// 脚本同样全局只插一次。
let scriptPromise = null;
function loadScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.turnstile) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) {
        existing.addEventListener("load", () => resolve(true));
        existing.addEventListener("error", () => resolve(false));
        return;
      }
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = SCRIPT_SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/** 等 token 出现；managed 模式下用户可能要点一下复选框，故给较长的等待上限。 */
const TOKEN_WAIT_MS = 30000;
const TOKEN_POLL_MS = 200;

function Turnstile({ action, theme = "auto", className }, ref) {
  const containerRef = React.useRef(null);
  const widgetIdRef = React.useRef(null);
  const tokenRef = React.useRef("");
  const [enabled, setEnabled] = React.useState(false);

  React.useImperativeHandle(ref, () => ({
    /**
     * 取 token。未启用直接返回 ""（业务照常提交，后端也不会校验）。
     * 已有 token 立即返回；否则轮询等待用户完成验证，超时返回 "" 由后端兜底。
     */
    async getToken() {
      if (!enabled) return "";
      if (tokenRef.current) return tokenRef.current;
      const deadline = Date.now() + TOKEN_WAIT_MS;
      while (Date.now() < deadline) {
        if (tokenRef.current) return tokenRef.current;
        await new Promise((r) => setTimeout(r, TOKEN_POLL_MS));
      }
      return "";
    },
    /** 🔴 提交后必须调用：Turnstile token 一次性，重复用会被判 timeout-or-duplicate。 */
    reset() {
      tokenRef.current = "";
      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          // widget 已被卸载等边界情况，忽略
        }
      }
    },
  }));

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const cfg = await loadSecurityConfig();
      if (cancelled || !cfg?.enabled || !cfg?.site_key) return;
      const ok = await loadScript();
      if (cancelled || !ok || !window.turnstile || !containerRef.current) return;

      setEnabled(true);
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: cfg.site_key,
          action, // 业务 code：后端按它校验 token 是否用在对的场景
          theme,
          callback: (token) => {
            tokenRef.current = token || "";
          },
          "expired-callback": () => {
            tokenRef.current = "";
          },
          "error-callback": () => {
            tokenRef.current = "";
          },
        });
      } catch {
        // 渲染失败（脚本被拦截 / 域名不在 widget 白名单）→ 保持未启用，业务不受阻
        setEnabled(false);
      }
    })();

    return () => {
      cancelled = true;
      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // 忽略
        }
      }
      widgetIdRef.current = null;
    };
  }, [action, theme]);

  // 未启用时不占位，避免表单里留一块空白
  return <div ref={containerRef} className={className} style={enabled ? undefined : { display: "none" }} />;
}

export default React.forwardRef(Turnstile);
