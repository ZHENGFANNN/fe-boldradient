import React from "react";
import ReactDOM from "react-dom";
import { isEmail } from "@/utils/pattern";
import GlobalContext from "@/[locale]/context";
import styles from "./index.module.scss";
import ShowTipModal from "@/components/Modal/ShowTipModal";
import { useForm } from "react-hook-form";

import Api from "@/components/Layout/api";
import FormInput from "@/components/Form/FormInput";
import FormTextarea from "@/components/Form/FormTextArea";
import Turnstile, { turnstileHeaders } from "@/components/Turnstile";
import FormItem from "@/components/Form/FormItem";
import Button from "@/components/Button";

function Modal(_, ref) {
  const tipRef = React.useRef(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const { locale, LANG, area } = React.useContext(GlobalContext);
  const [changeBodyScroll, setChangeBodyScroll] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  // 人机验证（业务 code = contact），与联系页表单同 code、同后端守卫。
  const turnstileRef = React.useRef(null);
  // 提交来源：默认「联系我们页」，产品页入口打开时传 "product" 以便后台区分来源。
  const sourceRef = React.useRef("contact");

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = React.useCallback(
    async (values) => {
      if (loading) return;
      setLoading(true);
      try {
        const tsToken = await turnstileRef.current?.getToken();
        const data = await Api.contactForm(
          {
            path: location.pathname,
            language: locale,
            area,
            type: sourceRef.current,
            ...values,
          },
          turnstileHeaders(tsToken)
        );
        turnstileRef.current?.reset(); // token 一次性
        if (data.code === 0) {
          // 成功后直接关闭弹窗 + 顶部成功 toast，不再在弹窗内切换到大块「Thank you」展示态。
          setShow(false);
          tipRef.current.show({
            type: "success",
            text:
              LANG["common.contact.success_desc"] ||
              "We've received your message and will get back to you as soon as possible.",
          });
        } else {
          throw new Error("code!==0");
        }
      } catch (err) {
        console.log("[contactForm]: ", err);
        tipRef.current.show({
          type: "error",
          text: LANG["common.contact.submit_fail"],
        });
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  React.useImperativeHandle(ref, () => ({
    show: (type) => {
      sourceRef.current = type === "product" ? "product" : "contact";
      setIsMounted(true);
      setTimeout(() => setShow(true), 0);
    },
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
      if (changeBodyScroll) {
        document.body.style.overflow = "scroll";
      } else {
        setChangeBodyScroll(true);
      }
    }
  }, [show]);

  if (!isMounted) return null;

  return ReactDOM.createPortal(
    <>
      <div
        className={`${styles.modal}`}
        data-show={show}
        onClick={() => {
          setShow(false);
        }}
      >
        <div className={styles.modal_wrapper}>
          <div
            className={styles.modal_content}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className={styles.header}>
              <div className={styles.title}>{LANG["common.contact.title"]}</div>
              <div className={styles.close} onClick={() => setShow(false)}>
                ×
              </div>
            </div>
            <div className={styles.content}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormItem>
                  <FormInput
                    label={LANG["common.contact.first_name"]}
                    error={errors.first_name?.message}
                    inputProps={{
                      maxLength: 15,
                      ...register("first_name", {
                        required: LANG["common.contact.first_name"],
                      }),
                    }}
                  />
                  <FormInput
                    label={LANG["common.contact.last_name"]}
                    error={errors.last_name?.message}
                    inputProps={{
                      maxLength: 15,
                      ...register("last_name", {
                        required: LANG["common.contact.last_name"],
                      }),
                    }}
                  />
                </FormItem>
                <FormInput
                  label={LANG["common.contact.email"]}
                  error={errors.email?.message}
                  inputProps={{
                    ...register("email", {
                      required: LANG["common.contact.email"],
                      pattern: {
                        value: isEmail,
                        message: LANG["common.contact.email"],
                      },
                    }),
                  }}
                />
                <FormInput
                  label={LANG["common.contact.other_contact"]}
                  error={errors.other_contact?.message}
                  required={false}
                  inputProps={{
                    maxLength: 100,
                    ...register("other_contact"),
                  }}
                />
                <FormTextarea
                  label={LANG["common.contact.what_problem"]}
                  error={errors.content?.message}
                  inputProps={{
                    maxLength: 1000,
                    ...register("content", {
                      required: LANG["common.contact.what_problem"],
                    }),
                  }}
                />
                <Turnstile ref={turnstileRef} action="contact" />
                <div className={styles.btn_container}>
                  <Button
                    variant="secondary"
                    className={styles.btn_cancel}
                    onClick={() => {
                      setShow(false);
                    }}
                  >
                    {LANG["common.contact.cancel"]}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className={styles.btn_confirm}
                  >
                    {LANG["common.contact.submit"]}
                  </Button>
                </div>
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

export default React.forwardRef(Modal);
