"use client";

import React from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import Api from "@/[locale]/user/api";
import styles from "./GoogleLoginCustomButton.module.scss";

/**
 * 「使用 Google 登录」按钮 —— 中央回调授权码流。
 * 点击 → POST /user/google/auth-url 拿 Google 授权 URL → 整页跳转 Google。
 * 授权完成由 Google 回调中央域名、再 302 回本站 /[locale]/auth/google/finish 收尾写 cookie。
 *
 * 不再使用 GSI(@react-oauth/google)，因此不受「每站 Authorized JavaScript origins 白名单 + 100 上限」限制。
 */
export default function GoogleLoginCustomButton({ label, onError }) {
  const { locale } = useParams();
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // 登录成功后回跳目标：优先 URL 上的 ?redirect=（如从下单页被拦来登录）。
      const returnPath =
        new URLSearchParams(location.search).get("redirect") || "";
      const area = Cookies.get("area") || "us";
      const res = await Api.googleAuthUrl({
        returnPath,
        locale: locale || "en",
        area,
      });
      const authURL = res?.code === 0 ? res?.data?.authURL : null;
      if (authURL) {
        location.href = authURL; // 整页跳转到 Google 授权页
        return;
      }
      onError && onError();
      setLoading(false);
    } catch {
      onError && onError();
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.visual}
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" width="20" height="20">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.05-3.71 1.05-2.86 0-5.29-1.93-6.15-4.53H2.18v2.85A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.85 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.87l3.67-2.85Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.07l3.67 2.85C6.71 7.31 9.14 5.38 12 5.38Z"
          />
        </svg>
        <span className={styles.text}>{label || "Continue with Google"}</span>
      </button>
    </div>
  );
}
