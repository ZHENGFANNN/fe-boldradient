"use client";

/**
 * VerifyCode —— 邮箱验证码输入框 + 内嵌「发送验证码」按钮，各业务复用。
 *
 * 业务方只传一个 businessType，组件据此匹配对应的发码端点与 Turnstile action：
 *   register  → POST /user/sendRegisterCode   （注册）
 *   livechat  → POST /chat/send-code          （进入人工客服）
 *
 * 为什么把 Turnstile 收进本组件：人机验证只服务于「发码」这一个动作——发码是会真发邮件、
 * 可被拿来轰炸任意地址的一步，也是各业务唯一需要它的地方。放在外面每个调用方都要重复
 * 一遍「取 token / consume / 冷却结束再 reset」这套易错逻辑；收进来后调用方只管拿到的码。
 *
 * 冷却与重新武装的口径（两处业务一致，别改）：
 *   发码成功 → consume() 让控件停在已验证态 + 起 60s 倒计时；倒计时归零才 reset() 重新武装。
 *   一次人机验证只兑换一次发码，否则控件立刻重跑挑战、用户可反复发码，验证形同虚设。
 *   发码失败 → 立即 reset()，那条路没有倒计时、不会触发重新武装，只 consume 会把人卡死。
 *
 * UI 沿用注册页原有形态：按钮绝对定位嵌在输入框右侧、左侧一道分隔线。
 */

import React from "react";
import Api from "@/request";
import Turnstile, { turnstileHeaders } from "@/components/Turnstile";
import styles from "./index.module.scss";

/** 业务类型 → 发码端点 + Turnstile action + 请求体语言字段名。 */
const BUSINESS = {
  register: {
    url: "/user/sendRegisterCode",
    action: "register",
    langKey: "language",
  },
  livechat: {
    url: "/chat/send-code",
    action: "livechat",
    langKey: "locale",
  },
};

const COOLDOWN_SECONDS = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function VerifyCode(
  {
    businessType,
    email,
    locale = "en",
    value,
    onChange,
    inputProps,
    onSent,
    onError,
    placeholder,
    texts = {},
    className,
  },
  ref
) {
  const conf = BUSINESS[businessType];
  const [sending, setSending] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  const turnstileRef = React.useRef(null);
  const prevCountdownRef = React.useRef(0);

  // 倒计时递减
  React.useEffect(() => {
    if (countdown <= 0) return undefined;
    const t = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // 冷却结束才重新武装控件——与「能再发一次码」严格同步
  React.useEffect(() => {
    if (prevCountdownRef.current > 0 && countdown === 0) {
      turnstileRef.current?.reset();
    }
    prevCountdownRef.current = countdown;
  }, [countdown]);

  const fail = React.useCallback(
    (msg) => {
      if (onError) onError(msg);
    },
    [onError]
  );

  const handleSend = React.useCallback(async () => {
    if (!conf || sending || countdown > 0) return;
    const addr = String(email || "").trim();
    if (!EMAIL_RE.test(addr)) {
      fail(texts.invalidEmail || "Please enter a valid email address");
      return;
    }
    // 未完成人机验证直接提示，不发请求：直接 await getToken() 会阻塞到 30s 超时，
    // 用户点了按钮毫无反应，体感是卡死。
    if (turnstileRef.current?.isEnabled() && !turnstileRef.current?.hasToken()) {
      fail(texts.turnstileRequired || "Please complete the verification first");
      return;
    }
    setSending(true);
    try {
      const tsToken = await turnstileRef.current?.getToken();
      const res = await Api.post(
        conf.url,
        { email: addr, [conf.langKey]: locale || "en" },
        turnstileHeaders(tsToken)
      );
      if (res?.code === 0) {
        turnstileRef.current?.consume();
        setCountdown(COOLDOWN_SECONDS);
        if (onSent) onSent(res);
      } else {
        turnstileRef.current?.reset();
        fail(res?.msg || res?.message || texts.sendFailed || "Failed to send code");
      }
    } catch {
      turnstileRef.current?.reset();
      fail(texts.sendFailed || "Failed to send code");
    } finally {
      setSending(false);
    }
  }, [conf, countdown, email, fail, locale, onSent, sending, texts]);

  React.useImperativeHandle(ref, () => ({
    /** 供父组件在提交失败（如码错/过期）后重置冷却，让用户能立即重发。 */
    resetCooldown() {
      setCountdown(0);
    },
    isSending() {
      return sending;
    },
  }));

  const btnLabel =
    countdown > 0
      ? `${countdown}s`
      : sending
        ? texts.sending || "Sending…"
        : texts.send || "Send code";

  // 受控与 react-hook-form 两种用法二选一：传了 inputProps（RHF 的 register(...) 展开）
  // 就交给 RHF 管值，否则走 value/onChange 受控。
  const controlled = inputProps
    ? {}
    : { value: value || "", onChange: (e) => onChange && onChange(e.target.value) };

  return (
    <div className={className}>
      <div className={styles.code_row}>
        <input
          type="text"
          autoComplete="one-time-code"
          inputMode="numeric"
          placeholder={placeholder}
          {...inputProps}
          {...controlled}
        />
        <button
          type="button"
          className={
            styles.send_code_btn +
            (countdown > 0 || sending ? " " + styles.is_disabled : "")
          }
          disabled={sending || countdown > 0}
          onClick={handleSend}
        >
          {btnLabel}
        </button>
      </div>
      {/* 人机验证只服务于发码这一步；后端未配 secret 时不渲染、不占位 */}
      <Turnstile ref={turnstileRef} action={conf?.action || "register"} />
    </div>
  );
}

export default React.forwardRef(VerifyCode);
