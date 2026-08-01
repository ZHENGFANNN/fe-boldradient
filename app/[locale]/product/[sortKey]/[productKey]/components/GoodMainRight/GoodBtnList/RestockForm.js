/** @format */

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { isEmail } from "@/utils/pattern";
import FormInput from "@/components/Form/FormInput";
import Button from "@/components/Button";
import ShowTipModal from "@/components/Modal/ShowTipModal";
import Api from "../../../api";
import styles from "./RestockForm.module.scss";

// 缺货到货通知表单：商品缺货时收集邮箱。上报 email + 当前页面 path + area + locale + 选中套餐 combo_key
// （无变体套餐时 combo_key 传空串）。目前只收集不发到货邮件；同邮箱同页同套餐重复提交后端静默去重。
export default function RestockForm({ LANG, locale, area, comboKey }) {
  const tipRef = React.useRef(null);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

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
          setSubmitted(true);
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

  return (
    <div className={styles.restock}>
      <div className={styles.stock_label}>
        {LANG["product.no_stock"] || "Out of stock"}
      </div>
      {submitted ? (
        <div className={styles.success}>
          {LANG["product.restock.success"] ||
            "Thanks! We'll email you when it's back in stock."}
        </div>
      ) : (
        <>
          <div className={styles.desc}>
            {LANG["product.restock.desc"] ||
              "Enter your email and we'll notify you when this item is available again."}
          </div>
          <form
            className={styles.form}
            onSubmit={(e) => handleSubmit(onSubmit)(e)}
          >
            <FormInput
              label={LANG["product.restock.email"] || "Email"}
              error={errors.email?.message}
              inputProps={{
                placeholder: LANG["product.restock.email"] || "Email",
                ...register("email", {
                  required: LANG["product.restock.email"] || "Email",
                  pattern: {
                    value: isEmail,
                    message: LANG["product.restock.email"] || "Email"
                  }
                })
              }}
            />
            <Button
              type="submit"
              variant="primary"
              block
              loading={loading}
              className={styles.submit_btn}
            >
              {LANG["product.restock.notify_me"] || "Notify me"}
            </Button>
          </form>
        </>
      )}
      <ShowTipModal ref={tipRef} />
    </div>
  );
}
