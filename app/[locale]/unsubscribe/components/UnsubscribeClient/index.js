"use client";

// ============================================================
// 退订确认交互（客户端）
//   1. 挂载后从 URL query 读 token（避免 useSearchParams 触发 CSR bailout）。
//   2. token 缺失 → 直接展示 "Invalid unsubscribe link"。
//   3. 展示确认卡片，用户点「Confirm unsubscribe」才调 POST /user/unsubscribe。
//      —— 不自动提交，防邮件客户端预取链接误退订。
//   4. 成功 → 展示已退订 + 邮箱；失败 → 展示错误信息。
// 复用 @/[locale]/user/api（axios 实例自动带 baseURL + X-Site-Domain）。
// ============================================================

import React from "react";
import styles from "./index.module.scss";
import Api from "@/[locale]/user/api";

// 交互状态机
const STATUS = {
  LOADING: "loading", // 读取 token 中
  NO_TOKEN: "no_token", // token 缺失
  CONFIRM: "confirm", // 等待用户确认
  SUBMITTING: "submitting", // 请求进行中
  SUCCESS: "success", // 退订成功
  ERROR: "error", // 退订失败
};

export default function UnsubscribeClient() {
  const [status, setStatus] = React.useState(STATUS.LOADING);
  const [token, setToken] = React.useState(null);
  const [email, setEmail] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    // 异步置态，避免在 effect 体内同步 setState（cascading renders）
    const id = setTimeout(() => {
      const t = new URLSearchParams(location.search).get("token");
      if (!t) {
        setStatus(STATUS.NO_TOKEN);
        return;
      }
      setToken(t);
      setStatus(STATUS.CONFIRM);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const onConfirm = async () => {
    if (status === STATUS.SUBMITTING || !token) return;
    setStatus(STATUS.SUBMITTING);
    try {
      const res = await Api.unsubscribe({ token });
      if (res?.code !== 0) throw new Error(res?.message || "unsubscribe failed");
      setEmail(res?.data?.email || "");
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      setErrorMsg(
        err?.message ||
          err?.response?.data?.message ||
          "This unsubscribe link is invalid or has expired."
      );
      setStatus(STATUS.ERROR);
    }
  };

  return (
    <div className={styles.container} data-role="unsubscribe">
      <main className={styles.main}>
        <UnsubscribeBody
          status={status}
          email={email}
          errorMsg={errorMsg}
          onConfirm={onConfirm}
        />
      </main>
    </div>
  );
}

function UnsubscribeBody({ status, email, errorMsg, onConfirm }) {
  if (status === STATUS.LOADING) {
    return <p className={styles.hint}>Loading…</p>;
  }

  if (status === STATUS.NO_TOKEN) {
    return (
      <>
        <h1 className={styles.title}>Invalid unsubscribe link</h1>
        <p className={styles.desc}>
          This link is missing required information. Please open the unsubscribe
          link directly from the email you received.
        </p>
      </>
    );
  }

  if (status === STATUS.SUCCESS) {
    return (
      <>
        <h1 className={styles.title}>You&apos;ve been unsubscribed</h1>
        <p className={styles.desc}>
          {email ? `${email} ` : ""}will no longer receive marketing emails.
        </p>
      </>
    );
  }

  if (status === STATUS.ERROR) {
    return (
      <>
        <h1 className={styles.title}>Unsubscribe failed</h1>
        <p className={styles.desc}>{errorMsg}</p>
      </>
    );
  }

  // CONFIRM / SUBMITTING
  const submitting = status === STATUS.SUBMITTING;
  return (
    <>
      <h1 className={styles.title}>Unsubscribe from marketing emails?</h1>
      <p className={styles.desc}>
        You will stop receiving promotional and marketing emails. This
        won&apos;t affect important account or order notifications.
      </p>
      <button
        type="button"
        className={styles.button}
        disabled={submitting}
        onClick={onConfirm}
      >
        {submitting ? "Unsubscribing…" : "Confirm unsubscribe"}
      </button>
    </>
  );
}
