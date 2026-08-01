/** @format */

"use client";

import React from "react";
import ReactDOM from "react-dom";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { isEmail } from "@/utils/pattern";
import FormInput from "@/components/Form/FormInput";
import Button from "@/components/Button";
import ShowTipModal from "@/components/Modal/ShowTipModal";
import Api from "../../../api";
import styles from "./RestockModal.module.scss";

// 到货通知弹窗（缺货收集，影石风格）：标题 + 描述 + 邮箱输入 + 隐私协议勾选 + 提交。
// 上报 email + 当前页面 path + area + locale + 选中套餐 combo_key（无变体传空串）。
// 目前只收集不发到货邮件；同邮箱同页同套餐重复提交后端静默去重。
// 用法：父组件持 ref，点击「Notify me」调 ref.current.show()。
function RestockModal({ LANG, locale, area, comboKey, productName }, ref) {
  const tipRef = React.useRef(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [changeBodyScroll, setChangeBodyScroll] = React.useState(true);
  const [agree, setAgree] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors }
  } = useForm();

  React.useImperativeHandle(ref, () => ({
    show: () => {
      setIsMounted(true);
      setTimeout(() => setShow(true), 0);
    }
  }));

  React.useEffect(() => {
    if (show) {
      setIsMounted(true);
      if (document.body.style.overflow === "hidden") {
        setChangeBodyScroll(false);
      }
      document.body.style.overflow = "hidden";
    } else {
      reset();
      clearErrors();
      setAgree(false);
      if (changeBodyScroll) {
        document.body.style.overflow = "scroll";
      } else {
        setChangeBodyScroll(true);
      }
    }
  }, [show]);

  const onSubmit = React.useCallback(
    async (values) => {
      if (loading) return;
      setLoading(true);
      try {
        const data = await Api.restockNotify({
          email: values.email,
          path: location.pathname,
          language: locale,
          area,
          combo_key: comboKey || ""
        });
        if (data.code === 0) {
          setShow(false);
          tipRef.current.show({
            type: "success",
            text:
              LANG["product.restock.success"] ||
              "Thanks! We'll email you when it's back in stock."
          });
        } else {
          throw new Error("code!==0");
        }
      } catch (err) {
        console.log("[restockNotify]: ", err);
        tipRef.current.show({
          type: "error",
          text:
            LANG["product.restock.submit_fail"] ||
            "Submission failed, please try again"
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, locale, area, comboKey, LANG]
  );

  if (!isMounted) return null;

  return ReactDOM.createPortal(
    <>
      <div
        className={styles.modal}
        data-show={show}
        onClick={() => setShow(false)}
      >
        <div className={styles.modal_wrapper}>
          <div
            className={styles.modal_content}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <div className={styles.title}>
                {LANG["product.restock.title"] || "Notify me when available"}
              </div>
              <div className={styles.close} onClick={() => setShow(false)}>
                ×
              </div>
            </div>
            <div className={styles.content}>
              {productName ? (
                <div className={styles.product_name}>{productName}</div>
              ) : null}
              <p className={styles.desc}>
                {LANG["product.restock.desc"] ||
                  "Enter your email and we'll notify you when this item is available again."}
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormInput
                  label={LANG["product.restock.email"] || "Email"}
                  error={errors.email?.message}
                  inputProps={{
                    ...register("email", {
                      required: LANG["product.restock.email"] || "Email",
                      pattern: {
                        value: isEmail,
                        message: LANG["product.restock.email"] || "Email"
                      }
                    })
                  }}
                />
                <label className={styles.agree}>
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <span>
                    {LANG["product.restock.privacy_prefix"] ||
                      "By submitting, you agree to our"}{" "}
                    <Link
                      href={`/${locale}/article/legal/privacy-policy`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {LANG["user.login.privacy_policy"] || "Privacy Policy"}
                    </Link>
                    .
                  </span>
                </label>
                <Button
                  type="submit"
                  variant="primary"
                  block
                  loading={loading}
                  disabled={!agree}
                  className={styles.submit_btn}
                >
                  {LANG["product.restock.notify_me"] || "Notify me"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ShowTipModal ref={tipRef} />
    </>,
    document.body
  );
}

export default React.forwardRef(RestockModal);
