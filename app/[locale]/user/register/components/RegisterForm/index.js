"use client";

import React from "react";
import styles from "../../page.module.scss";
import Api from "../../../api";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { isEmail } from "../../../../../utils/pattern";
import { useRouter, useParams } from "next/navigation";
import ShowTipModal from "../../../../../components/Modal/ShowTipModal";
import { track } from "@/utils/analytics";
import VerifyCode from "@/components/VerifyCode";

export default function RegisterForm({ LANG }) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { locale } = useParams();
  // redirect 来自 URL query，挂载后从 window 读取，避免 useSearchParams 触发
  // 静态预渲染的 CSR bailout（需 Suspense 包裹），使本页可整页静态化。
  const [redirect, setRedirect] = React.useState(null);
  React.useEffect(() => {
    setRedirect(new URLSearchParams(location.search).get("redirect"));
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const tipRef = React.useRef(null);

  // 按后端错误码映射提示文案（storefront 以英文为主，LANG 有对应 key 时优先取）。
  const errText = (res) => {
    switch (res?.code) {
      case 10002:
        return LANG["user.register.email_registered"];
      case 10070:
        return (
          LANG["user.register.code_cooldown"] ||
          "Please wait a moment before requesting another code"
        );
      case 10071:
      case 10072:
        return (
          LANG["user.register.code_send_fail"] ||
          "Failed to send the verification code, please try again later"
        );
      case 10073:
        return (
          LANG["user.register.code_invalid"] ||
          "The verification code is invalid or has expired"
        );
      case 10074:
        return (
          LANG["user.register.code_incorrect"] || "Incorrect verification code"
        );
      default:
        return res?.message || LANG["user.register.tip_service_exception"];
    }
  };

  const onSubmit = async function (data) {
    try {
      setLoading(true);
      // 昵称不再收集：后端为空时自动生成 user_xxxxxx。
      const res = await Api.userRegister({
        ...data,
        language: locale,
        area: Cookies.get("area") || "",
      });
      if (res.code === 0) {
        tipRef.current.show({
          text: LANG["user.register.register_success"],
          type: "success",
        });
        track("CompleteRegistration", { method: "email" });
        reset();
        // 注册成功后直接跳转，去掉原 500ms 延迟（消除跳转前的卡顿感）。
        if (redirect) {
          // TODO： 恶心操作 - url末尾自带 /
          const path = redirect.endsWith("/")
            ? redirect.slice(0, -1)
            : redirect;
          location.href = path;
        } else {
          router.push("/user/login");
        }
      } else {
        setLoading(false);
        tipRef.current.show({
          text: errText(res),
          type: res.code === 10002 ? "info" : "error",
        });
      }
    } catch {
      setLoading(false);

      tipRef.current.show({
        text: LANG["user.register.tip_service_exception"],
        type: "error",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.form_item + " " + styles["mb-16"]}>
        <h2>{LANG["user.register.email"]}</h2>
        <input
          {...register("email", {
            required: LANG["user.register.email_empyt"],
            pattern: {
              value: isEmail,
              message: LANG["user.register.email_format"],
            },
          })}
          autoComplete="off"
        />
        <p>{errors.email?.message}</p>
      </div>
      <div className={styles.form_item + " " + styles["mb-16"]}>
        <h2>{LANG["user.register.password"]}</h2>
        <input
          type="password"
          {...register("password", {
            required: LANG["user.register.password_empyt"],
            minLength: {
              value: 8,
              message: LANG["user.register.password_format"],
            },
            maxLength: {
              value: 20,
              message: LANG["user.register.password_format"],
            },
          })}
        />
        <p>{errors.password?.message}</p>
      </div>
      <div className={styles.form_item}>
        <h2>{LANG["user.register.code"] || "Verification code"}</h2>
        <VerifyCode
          businessType="register"
          email={watch("email")}
          locale={locale}
          inputProps={register("code", {
            required:
              LANG["user.register.code_empty"] ||
              "Please enter the verification code",
          })}
          onError={(text) => tipRef.current?.show({ text, type: "error" })}
          onSent={() =>
            tipRef.current?.show({
              text:
                LANG["user.register.code_sent"] ||
                "Verification code sent to your email",
              type: "success",
            })
          }
          texts={{
            send: LANG["user.register.send_code"] || "Send code",
            sending: LANG["user.register.code_sending"] || "Sending…",
            invalidEmail: LANG["user.register.email_format"],
            sendFailed: LANG["user.register.code_send_fail"],
            turnstileRequired:
              LANG["common.turnstile.required"] ||
              "Please complete the verification first",
          }}
        />
        <p>{errors.code?.message}</p>
      </div>
      <button disabled={loading} type="submit" className={styles.button}>
        {LANG["user.register.submit"]}
      </button>
      <ShowTipModal ref={tipRef} />
    </form>
  );
}
