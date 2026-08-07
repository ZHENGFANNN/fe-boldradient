/** @format */

"use client";

import React from "react";
import styles from "../../page.module.scss";
import GlobalContext from "@/[locale]/context";
import Api from "../../../api";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { isEmail } from "../../../../../utils/pattern";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShowTipModal from "../../../../../components/Modal/ShowTipModal";
import DeletionPendingModal from "../DeletionPendingModal";
import Button from "@/components/Button";
import { track } from "@/utils/analytics";
import Turnstile, { turnstileHeaders } from "@/components/Turnstile";

export default function LoginForm({ LANG }) {
  const tipRef = React.useRef(null);
  const router = useRouter();
  // redirect 来自 URL query，改为挂载后从 window 读取，避免 useSearchParams 触发
  // 静态预渲染的 CSR bailout（需 Suspense 包裹）约束，使本页可整页静态化。
  const [redirect, setRedirect] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  // 注销冷静期弹窗：登录返回 10097 时展示，记住本次登录邮箱 + 冷静期信息，
  // 供弹窗内「重新输入密码」调 cancelDeletion 取消注销并继续登录。
  const [pending, setPending] = React.useState(null); // { email, effective_at, grace_days } | null
  const [cancelLoading, setCancelLoading] = React.useState(false);
  // 人机验证（业务 code = login）。登录是撞库/暴力破解的首要目标。
  const turnstileRef = React.useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [searchStr, setSearchStr] = React.useState("");
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setSearchStr(location.search);
    setRedirect(new URLSearchParams(location.search).get("redirect"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      router.push("/user/account");
    }
  }, []);

  // gotoAfterLogin 登录/取消注销成功后的统一跳转：优先回跳 redirect（去尾斜杠），否则去账户页。
  const gotoAfterLogin = React.useCallback(() => {
    if (redirect) {
      // TODO： 恶心操作 - url末尾自带 /
      const path = redirect.endsWith("/") ? redirect.slice(0, -1) : redirect;
      location.href = path;
    } else {
      location.href = "/user/account";
    }
  }, [redirect]);

  const onSubmit = React.useCallback(
    async (formData) => {
      setLoading(true);
      try {
        // 人机验证：业务 code = login（登录是撞库首要目标）
        const tsToken = await turnstileRef.current?.getToken();
        const data = await Api.userLogin(formData, turnstileHeaders(tsToken));
        // 🔴 token 一次性，无论成败都重置，否则密码输错重试会带着已消耗的 token
        turnstileRef.current?.reset();
        if (data.code === 0) {
          // 后端把 JWT 放在 body.data，前端需自行落库到 token cookie，
          // 后续请求由 axios 拦截器注入 Authorization: Bearer 头（否则登录态丢失）。
          if (data.data) {
            Cookies.set("token", data.data, { expires: 7 });
          }
          tipRef.current.show({
            text: LANG["user.login.login_success"],
            type: "success",
          });
          track("Login", { method: "password" });
          reset();
          gotoAfterLogin();
        } else if (data.code === 10097) {
          // 账号处于注销冷静期：不直接登录，弹窗让用户重新输入密码确认取消注销后继续。
          setLoading(false);
          setPending({
            email: formData.email,
            effective_at: data.data?.effective_at,
            grace_days: data.data?.grace_days,
          });
        } else if (data.code === -1) {
          setLoading(false);
          tipRef.current.show({
            text: LANG["user.login.invalid_user"],
            type: "error",
          });
          reset();
        } else if (data.code === -2) {
          setLoading(false);
          tipRef.current.show({
            text: LANG["user.login.data_error"],
            type: "info",
          });
        } else {
          throw new Error("业务代码错误！");
        }
      } catch (err) {
        setLoading(false);
        tipRef.current.show({
          text: LANG["user.login.server_error"],
          type: "error",
        });
      }
    },
    [redirect, gotoAfterLogin]
  );

  // handleCancelDeletion 弹窗内确认取消注销：重新输入密码 → cancelDeletion → 存 token 继续登录。
  const handleCancelDeletion = React.useCallback(
    async (password) => {
      if (!pending) return;
      setCancelLoading(true);
      try {
        const data = await Api.cancelDeletion({
          email: pending.email,
          password,
        });
        if (data.code === 0) {
          if (data.data) Cookies.set("token", data.data, { expires: 7 });
          setPending(null);
          tipRef.current.show({
            text: LANG["user.login.login_success"],
            type: "success",
          });
          gotoAfterLogin();
        } else {
          setCancelLoading(false);
          tipRef.current.show({
            text: LANG["user.login.invalid_user"],
            type: "error",
          });
        }
      } catch (err) {
        setCancelLoading(false);
        tipRef.current.show({
          text: LANG["user.login.server_error"],
          type: "error",
        });
      }
    },
    [pending, gotoAfterLogin]
  );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.form_item + " " + styles["mb-16"]}>
          <h2>{LANG["user.login.email"]}</h2>
          <input
            {...register("email", {
              required: LANG["user.login.email_empyt"],
              pattern: {
                value: isEmail,
                message: LANG["user.login.email_error"],
              },
            })}
          />
          <p>{errors.email?.message}</p>
        </div>
        <div className={styles.form_item + " " + styles["mb-16"]}>
          <h2>{LANG["user.login.password"]}</h2>
          <input
            type="password"
            {...register("password", {
              required: LANG["user.login.password_empyt"],
              minLength: {
                value: 8,
                message: LANG["user.login.password_error"],
              },
              maxLength: {
                value: 20,
                message: LANG["user.login.password_error"],
              },
            })}
          />
          <p>{errors.password?.message}</p>
        </div>
        <span>
          <Link scroll={true} href={`/user/forget`} className={styles.forget}>
            {LANG["user.login.forget_password"]}
          </Link>
        </span>
        <Turnstile ref={turnstileRef} action="login" />
        <Button
          type="submit"
          variant="primary"
          block
          loading={loading}
          className={styles.button}
        >
          {LANG["user.login.login_title"]}
        </Button>
        <ShowTipModal ref={tipRef} />
      </form>
      <DeletionPendingModal
        visible={!!pending}
        LANG={LANG}
        effectiveAt={pending?.effective_at}
        graceDays={pending?.grace_days}
        needPassword
        loading={cancelLoading}
        onConfirm={handleCancelDeletion}
        onClose={() => setPending(null)}
      />
      <p className={styles.register}>
        <span>{LANG["user.login.new_user"]}</span>
        <Link scroll={true} href={`/user/register${searchStr}`}>
          {LANG["user.login.create_acount"]}
        </Link>
      </p>
    </>
  );
}
