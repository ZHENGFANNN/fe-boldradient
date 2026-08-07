"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { isEmail } from "@/utils/pattern";
import GlobalContext from "@/[locale]/context";
import Api from "@/components/Layout/api";
import FormInput from "@/components/Form/FormInput";
import FormTextarea from "@/components/Form/FormTextArea";
import FormItem from "@/components/Form/FormItem";
import ShowTipModal from "@/components/Modal/ShowTipModal";
import Turnstile, { turnstileHeaders } from "@/components/Turnstile";
import ContactSuccess from "../ContactSuccess";
import Button from "@/components/Button";
import { track } from "@/utils/analytics";
import styles from "./index.module.scss";

// Contact 页内联表单（类 Shopify）。字段与后端契约对齐全局 ContactModal：
// first_name / last_name / email(必填+isEmail) / other_contact(选填, UI 呈现为 Phone)
// / content(必填 textarea, UI 呈现为 Message)。提交 type:"contact"。
export default function ContactForm() {
  const tipRef = React.useRef(null);
  const { locale, LANG, area } = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(false);
  // 人机验证（业务 code = contact）。联系/订阅是最典型的表单灌水目标。
  const turnstileRef = React.useRef(null);
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors }
  } = useForm();

  const onSubmit = React.useCallback(
    async (values) => {
      if (loading) return;
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
      setLoading(true);
      try {
        // 人机验证：业务 code = contact
        const tsToken = await turnstileRef.current?.getToken();
        const data = await Api.contactForm(
          {
            path: location.pathname,
            language: locale,
            area,
            type: "contact",
            ...values
          },
          turnstileHeaders(tsToken)
        );
        // 🔴 token 一次性；下面那次 best-effort 订阅打的是同一个受保护端点，
        // 必须重置后另取一个，否则会被判 timeout-or-duplicate、邮箱静默收集不到。
        turnstileRef.current?.reset();
        if (data.code === 0) {
          // best-effort：把邮箱补收进邮箱收集(订阅)模块。走同一端点、靠 body.type
          // 区分；失败不影响联系表单成功 UX，故 fire-and-forget + catch 吞掉。
          (async () => {
            const subToken = await turnstileRef.current?.getToken();
            return Api.contactForm(
              {
                type: "subscribe",
                email: values.email,
                path: location.pathname,
                language: locale,
                area
              },
              turnstileHeaders(subToken)
            ).finally(() => turnstileRef.current?.reset());
          })().catch((err) => console.log("[contactForm subscribe]: ", err));

          track("Lead", { from: "contact_page" });
          // 成功不再弹不明显的 toast，切换到「提交成功」展示态。
          setSubmitted(true);
        } else {
          throw new Error("code!==0");
        }
      } catch (err) {
        console.log("[contactForm]: ", err);
        tipRef.current.show({
          type: "error",
          text:
            LANG["common.contact.submit_fail"] ||
            "Submission failed, please try again"
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, locale, area, LANG]
  );

  if (submitted) return (
    <ContactSuccess
      LANG={LANG}
      onReset={() => {
        setSubmitted(false);
        reset();
        clearErrors();
      }}
    />
  );

  return (
    <section className={styles.form_section}>
      <div className={styles.form_wrapper}>
        <h2 className="title">
          {LANG["common.contact.title"] || "Contact us"}
        </h2>
        <p className="desc">
          {LANG["common.contact.form_subtitle"] ||
            "For questions about our products, shipping, after-sales, partnerships, or anything else, please fill out the form and we'll get back to you as soon as possible."}
        </p>
        <form onSubmit={(e) => handleSubmit(onSubmit)(e)}>
          <FormItem>
            <FormInput
              label={LANG["common.contact.first_name"] || "First name"}
              error={errors.first_name?.message}
              inputProps={{
                maxLength: 15,
                ...register("first_name", {
                  required: LANG["common.contact.first_name"] || "First name"
                })
              }}
            />
            <FormInput
              label={LANG["common.contact.last_name"] || "Last name"}
              error={errors.last_name?.message}
              inputProps={{
                maxLength: 15,
                ...register("last_name", {
                  required: LANG["common.contact.last_name"] || "Last name"
                })
              }}
            />
          </FormItem>
          <FormInput
            label={LANG["common.contact.email"] || "Email"}
            error={errors.email?.message}
            inputProps={{
              ...register("email", {
                required: LANG["common.contact.email"] || "Email",
                pattern: {
                  value: isEmail,
                  message: LANG["common.contact.email"] || "Email"
                }
              })
            }}
          />
          <FormInput
            label={LANG["common.contact.phone"] || "Phone (optional)"}
            error={errors.other_contact?.message}
            required={false}
            inputProps={{
              maxLength: 100,
              ...register("other_contact")
            }}
          />
          <FormTextarea
            label={LANG["common.contact.message"] || "Message"}
            error={errors.content?.message}
            inputProps={{
              maxLength: 1000,
              ...register("content", {
                required: LANG["common.contact.message"] || "Message"
              })
            }}
          />
          <Turnstile ref={turnstileRef} action="contact" />
          <Button
            type="submit"
            variant="primary"
            block
            loading={loading}
            className={styles.submit_btn}
          >
            {LANG["common.contact.submit"] || "Submit"}
          </Button>
        </form>
      </div>
      <ShowTipModal ref={tipRef} />
    </section>
  );
}
