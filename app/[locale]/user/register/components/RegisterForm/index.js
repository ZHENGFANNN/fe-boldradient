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
import Turnstile, { turnstileHeaders } from "@/components/Turnstile";

export default function RegisterForm({ LANG }) {
  const [loading, setLoading] = React.useState(false);
  // 发码在途 / 冷却倒计时（秒）：与后端 60s 发送冷却对齐，倒计时期间禁用发码按钮。
  const [sending, setSending] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);
  // Cloudflare 人机验证。挂在「发送验证码」这一步——那是唯一会真发邮件（花钱、可被拿来轰炸任意
  // 地址）的端点；register 本身必须带对邮箱验证码才过，等于已证明收件箱所有权，再挑战一次
  // 只会让用户在同一表单里被拦两遍。
  const turnstileRef = React.useRef(null);
  const router = useRouter();
  const { locale } = useParams();
  // redirect 来自 URL query，挂载后从 window 读取，避免 useSearchParams 触发
  // 静态预渲染的 CSR bailout（需 Suspense 包裹），使本页可整页静态化。
  const [redirect, setRedirect] = React.useState(null);
  React.useEffect(() => {
    setRedirect(new URLSearchParams(location.search).get("redirect"));
  }, []);

  // 倒计时递减。
  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // 冷却结束才重新武装人机验证控件：一次验证只兑换一次发码。
  // 冷却期内控件停在已验证完成态、hasToken() 为 false，点发码只会得到「请先完成验证」的提示；
  // 冷却结束后重置，用户想再发一次码时才重新拿得到 token。
  const prevCountdownRef = React.useRef(0);
  React.useEffect(() => {
    if (prevCountdownRef.current > 0 && countdown === 0) {
      turnstileRef.current?.reset();
    }
    prevCountdownRef.current = countdown;
  }, [countdown]);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
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

  // 发送邮箱验证码：先校验邮箱格式 → 调后端发码 → 成功则起 60s 倒计时。
  const handleSendCode = async () => {
    if (sending || countdown > 0) return;
    const email = (getValues("email") || "").trim();
    if (!email || !isEmail.test(email)) {
      tipRef.current.show({
        text: LANG["user.register.email_format"],
        type: "error",
      });
      return;
    }
    // 🔴 发码前先确认已通过人机验证，没通过就直接提示、不发请求。
    // 不这么做的话：getToken() 会阻塞等到 30s 超时，用户点了按钮毫无反应（体感像卡死），
    // 最后还是被后端以 10102 拒掉——白等一轮又得不到有效提示。
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
      setSending(true);
      // 人机验证：业务 code = register。未启用时 getToken() 返回 ""，turnstileHeaders 退化为空对象，
      // 请求照常发出、后端也不校验，前后端降级口径一致。
      const tsToken = await turnstileRef.current?.getToken();
      const res = await Api.sendRegisterCode(
        { email, language: locale },
        turnstileHeaders(tsToken)
      );
      if (res.code === 0) {
        // 🔴 成功才 consume()：token 清掉但控件停在"已验证"完成态，不重跑挑战。
        // 若这里用 reset()，managed 控件几秒后又拿到新 token，用户就能反复发验证码——
        // 验证形同虚设。控件的重新武装交给「倒计时归零」那个 effect，
        // 使「能再发一次码」与「能再拿一个 token」严格同步。
        turnstileRef.current?.consume();
        setCountdown(60);
        tipRef.current.show({
          text:
            LANG["user.register.code_sent"] ||
            "Verification code sent to your email",
          type: "success",
        });
      } else {
        // 🔴 失败必须 reset()：没有倒计时，控件不会被那个 effect 重新武装；
        // 只 consume 的话用户改完邮箱想重试，会永远卡在「请先完成验证」。
        turnstileRef.current?.reset();
        tipRef.current.show({
          text: errText(res),
          type: res.code === 10002 ? "info" : "error",
        });
      }
    } catch {
      turnstileRef.current?.reset(); // 同上：异常路径也要放用户重试
      tipRef.current.show({
        text: LANG["user.register.tip_service_exception"],
        type: "error",
      });
    } finally {
      setSending(false);
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
        setCountdown(0);
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

  const codeBtnLabel =
    countdown > 0
      ? `${countdown}s`
      : sending
      ? LANG["user.register.code_sending"] || "Sending…"
      : LANG["user.register.send_code"] || "Send code";

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
        <div className={styles.code_row}>
          <input
            {...register("code", {
              required:
                LANG["user.register.code_empty"] ||
                "Please enter the verification code",
            })}
            autoComplete="off"
            inputMode="numeric"
          />
          <button
            type="button"
            className={
              styles.send_code_btn +
              (countdown > 0 || sending ? " " + styles.is_disabled : "")
            }
            disabled={sending || countdown > 0}
            onClick={handleSendCode}
          >
            {codeBtnLabel}
          </button>
        </div>
        <p>{errors.code?.message}</p>
      </div>
      {/* 人机验证：后端未配置 secret 时本组件不渲染任何内容、不占位 */}
      <Turnstile ref={turnstileRef} action="register" />
      <button disabled={loading} type="submit" className={styles.button}>
        {LANG["user.register.submit"]}
      </button>
      <ShowTipModal ref={tipRef} />
    </form>
  );
}
