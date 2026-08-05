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
import GlobalContext from "@/[locale]/context";
import Loading from "@/components/Loading";
import DeletionPendingModal from "@/[locale]/user/login/components/DeletionPendingModal";
import { track } from "@/utils/analytics";

export default function GoogleFinishPage() {
  const { locale } = useParams();
  const { LANG } = React.useContext(GlobalContext) || {};
  // 注销冷静期：Google 回调带 pending_deletion=1 时展示弹窗，用短命令牌取消注销并登录。
  const [pending, setPending] = React.useState(null); // { cancel_token, effective_at, grace_days, redirect } | null
  const [cancelLoading, setCancelLoading] = React.useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
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

    // 注销冷静期：Google 已验证身份，弹窗确认取消注销（凭 cancel_token）后继续登录。
    if (params.get("pending_deletion") === "1") {
      setPending({
        cancel_token: params.get("cancel_token") || "",
        effective_at: params.get("effective_at") || "",
        grace_days: Number(params.get("grace_days")) || undefined,
        redirect: safeRedirect || home,
      });
      return;
    }

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
          track("Login", { method: "google" });
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
  /* eslint-enable react-hooks/set-state-in-effect */

  // handleCancelDeletion Google 路径取消注销：凭 cancel_token 调 cancelDeletion，成功存 token 继续登录。
  const handleCancelDeletion = React.useCallback(async () => {
    if (!pending) return;
    setCancelLoading(true);
    try {
      const res = await Api.cancelDeletion({
        cancel_token: pending.cancel_token,
      });
      if (res?.code === 0 && res?.data) {
        Cookies.set("token", res.data, { expires: 7 });
        location.href = pending.redirect;
        return;
      }
      setCancelLoading(false);
    } catch {
      setCancelLoading(false);
    }
  }, [pending]);

  const backToLoginPage = React.useCallback(() => {
    location.href = `/${locale || "en"}/user/login`;
  }, [locale]);

  return (
    <>
      <Loading height="60vh" />
      <DeletionPendingModal
        visible={!!pending}
        LANG={LANG}
        effectiveAt={pending?.effective_at}
        graceDays={pending?.grace_days}
        needPassword={false}
        loading={cancelLoading}
        onConfirm={handleCancelDeletion}
        onClose={backToLoginPage}
      />
    </>
  );
}
