"use client";

import React from "react";
import ReactDOM from "react-dom";
import styles from "./index.module.scss";

const T = (LANG, key, fallback) => LANG?.[key] || fallback;

/**
 * 注销冷静期确认弹窗（登录场景专用，受控）。
 *
 * 登录接口检测到账号处于注销冷静期（code 10097）时，父组件置 visible 展示本弹窗：
 * 告知账号「注销中」+ 预计注销生效时间，并让用户「重新输入密码」确认取消注销后继续登录。
 * Google 路径无密码——父组件传 cancelToken 时隐藏密码框，仅需点击确认。
 *
 * @param {boolean}  visible      是否展示
 * @param {object}   LANG         文案 map
 * @param {string?}  effectiveAt  预计注销生效时间（ISO 字符串，展示用）
 * @param {number?}  graceDays    冷静期天数（展示用）
 * @param {boolean}  needPassword true=邮箱路径需重新输入密码；false=Google 路径仅确认
 * @param {boolean}  loading      确认请求进行中（禁用按钮）
 * @param {Function} onConfirm    确认取消注销：needPassword 时回传 (password)，否则 ()
 * @param {Function} onClose      放弃（关闭弹窗，不取消注销）
 */
export default function DeletionPendingModal({
  visible,
  LANG,
  effectiveAt,
  graceDays,
  needPassword = true,
  loading = false,
  onConfirm,
  onClose,
}) {
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (!visible) {
      setPassword("");
      setErr("");
    }
  }, [visible]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!visible) return null;

  const effectiveText = effectiveAt
    ? new Date(effectiveAt).toLocaleDateString()
    : "";

  const handleConfirm = () => {
    if (needPassword) {
      if (!password || password.length < 8) {
        setErr(
          T(LANG, "user.login.password_error", "Password must be 8-20 characters")
        );
        return;
      }
      onConfirm?.(password);
    } else {
      onConfirm?.();
    }
  };

  return ReactDOM.createPortal(
    <div className={styles.mask}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <h2 className={styles.title}>
          {T(LANG, "user.login.deletion_pending_title", "Account pending deletion")}
        </h2>
        <p className={styles.desc}>
          {T(
            LANG,
            "user.login.deletion_pending_desc",
            "This account has requested deletion and is in the cooling-off period."
          )}
          {effectiveText ? (
            <>
              <br />
              {T(
                LANG,
                "user.login.deletion_pending_effective",
                "Scheduled deletion date:"
              )}{" "}
              <strong>{effectiveText}</strong>
            </>
          ) : null}
        </p>
        <p className={styles.hint}>
          {T(
            LANG,
            "user.login.deletion_pending_cancel_hint",
            "Cancel the deletion to keep using this account and continue signing in."
          )}
        </p>

        {needPassword ? (
          <div className={styles.field}>
            <input
              type="password"
              value={password}
              placeholder={T(
                LANG,
                "user.login.deletion_pending_password_ph",
                "Re-enter your password to confirm"
              )}
              onChange={(e) => {
                setPassword(e.target.value);
                if (err) setErr("");
              }}
            />
            {err ? <p className={styles.err}>{err}</p> : null}
          </div>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btn_cancel}
            onClick={onClose}
            disabled={loading}
          >
            {T(LANG, "user.login.deletion_pending_keep", "Keep account deleted")}
          </button>
          <button
            type="button"
            className={styles.btn_confirm}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading
              ? T(LANG, "common.other.loading", "Processing...")
              : T(
                  LANG,
                  "user.login.deletion_pending_confirm",
                  "Cancel deletion & continue"
                )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
