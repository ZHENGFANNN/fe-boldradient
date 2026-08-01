/** @format */

"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { isEmail } from "@/utils/pattern";
import FormInput from "@/components/Form/FormInput";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import ShowTipModal from "@/components/Modal/ShowTipModal";
import Api from "../../../api";
import styles from "./RestockModal.module.scss";

// 到货通知弹窗（缺货收集）：无标题,含商品名 + 描述 + 邮箱输入 + 隐私协议勾选 + 提交。
// 复用外层共享 Modal 组件(不传 title 即无 header)。上报 email + path + area + locale + combo_key。
// 目前只收集不发到货邮件;同邮箱同页同套餐后端静默去重。父组件持 ref 调 ref.current.show()。
function RestockModal({ LANG, locale, area, comboKey, sortKey, goodKey }, ref) {
  const modalRef = React.useRef(null);
  const tipRef = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [agree, setAgree] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors }
  } = useForm();

  React.useImperativeHandle(ref, () => ({
    show: () => modalRef.current?.show({})
  }));

  const close = React.useCallback(() => {
    modalRef.current?.hide();
    reset();
    clearErrors();
    setAgree(false);
  }, [reset, clearErrors]);

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
          combo_key: comboKey || "",
          sort_key: sortKey || "",
          good_key: goodKey || ""
        });
        if (data.code === 0) {
          close();
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
    [loading, locale, area, comboKey, sortKey, goodKey, LANG, close]
  );

  return (
    <>
      <Modal ref={modalRef} onClose={close} wrapperClassName={styles.narrow}>
        <div className={styles.restock_modal}>
          <div className={styles.close} onClick={close}>
            ×
          </div>
          <div className={styles.title}>
            {LANG["product.restock.notify_me"] || "Notify me"}
          </div>
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
      </Modal>
      <ShowTipModal ref={tipRef} />
    </>
  );
}

export default React.forwardRef(RestockModal);
