"use client";

import styles from "../../page.module.scss";
import { useForm } from "react-hook-form";
import { isEmail } from "../../../../../utils/pattern";

import Api from "../../../api";

import React from "react";
import ShowTipModal from "../../../../../components/Modal/ShowTipModal";
import Turnstile, { turnstileHeaders } from "@/components/Turnstile";

export default function ForgetForm({ LANG }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const tipRef = React.useRef(null);
  // 人机验证（业务 code = forgot）。该接口会真发重置邮件，可被拿来给任意地址轰炸。
  const turnstileRef = React.useRef(null);

  const onSubmit = async function (data) {
    // 🔴 先确认已通过人机验证，没通过直接提示、不发请求（否则 getToken 会干等到 30s 超时）
    if (turnstileRef.current?.isEnabled() && !turnstileRef.current?.hasToken()) {
      tipRef.current.show({
        text:
          LANG["common.turnstile.required"] ||
          "Please complete the verification first",
        type: "info",
      });
      return;
    }
    try {
      // 自助：仅提交邮箱，后端校验后发送重置链接
      const tsToken = await turnstileRef.current?.getToken();
      const res = await Api.verifyForgetPassword(
        { email: data.email },
        turnstileHeaders(tsToken)
      );
      turnstileRef.current?.reset(); // token 一次性
      if (res.code !== 0) throw new Error("code !== 0");
      tipRef.current.show({
        text:
          LANG["user.forget.reset_link_sent"] ||
          "If this email is registered, a password reset link has been sent. Please check your inbox.",
        type: "success",
      });
      reset();
    } catch {
      tipRef.current.show({
        text: LANG["user.forget.tip_service_exception"],
        type: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.form_item + " " + styles["mb-16"]}>
        <h2>{LANG["user.forget.email"]}</h2>
        <input
          {...register("email", {
            required: LANG["user.forget.email_empyt"],
            pattern: {
              value: isEmail,
              message: LANG["user.forget.email_format"],
            },
          })}
          autoComplete="off"
        />
        <p>{errors.email?.message}</p>
      </div>

      <div className={styles.tip}>
        {LANG["user.forget.reset_tip"] ||
          "Enter your account email and we'll send you a link to reset your password."}
      </div>
      <Turnstile ref={turnstileRef} action="forgot" />
      <button type="submit" className={styles.button}>
        {LANG["user.forget.send_reset_link"] || "Send reset link"}
      </button>
      <ShowTipModal ref={tipRef} />
    </form>
  );
}
