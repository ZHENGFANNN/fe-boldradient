"use client";

/**
 * Google 中央回调授权码流收尾页：/[locale]/auth/google/finish
 *
 * Google 授权 → 中央回调(service 域名)签发一次性 handoff code → 302 回本站此页，带 ?code=<handoff>&redirect=<站内路径>。
 * 本页在「本站自己的域名」上把 handoff code 换成 JWT 并写 token cookie（cookie 必须落本站域名，故不能在中央域名写）。
 * 失败时带 ?error=<原因>，回登录页提示。
 */

import React from "react";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import Api from "@/[locale]/user/api";
import Loading from "@/components/Loading";

export default function GoogleFinishPage() {
  const { locale } = useParams();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const err = params.get("error");
    const rawRedirect = params.get("redirect") || "";
    // 仅允许站内相对路径回跳，防开放重定向
    const safeRedirect =
      rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
        ? rawRedirect
        : "";
    const home = `/${locale || "en"}`;
    const loginPage = `/${locale || "en"}/user/login`;
    // 失败时回登录页，带上原始回跳目标以便重试
    const backToLogin = () => {
      location.href = safeRedirect
        ? `${loginPage}?redirect=${encodeURIComponent(safeRedirect)}`
        : loginPage;
    };

    if (err || !code) {
      const t = setTimeout(backToLogin, 1200);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await Api.googleExchange({ code });
        if (!cancelled && res?.code === 0 && res?.data) {
          Cookies.set("token", res.data, { expires: 7 });
          location.href = safeRedirect || home;
          return;
        }
        throw new Error("exchange failed");
      } catch {
        if (cancelled) return;
        setTimeout(backToLogin, 1200);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  return <Loading height="60vh" />;
}
