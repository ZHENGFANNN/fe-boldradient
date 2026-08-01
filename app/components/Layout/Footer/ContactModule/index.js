"use client";

import React from "react";
import GlobalContext from "@/[locale]/context";

import { isEmail } from "@/utils/pattern";
import {
  SocialBilibiliIcon,
  SocialFacebookIcon,
  SocialInsIcon,
  SocialLinkedinIcon,
  SocialSinaIcon,
  SocialTiktokIcon,
  SocialTwitterIcon,
  SocialWeixinIcon,
  SocialWhatsappIcon,
  SocialYoutubeIcon,
} from "@/components/Icon";
import Api from "../../api";

import styles from "./index.module.scss";

// 预设社媒 type → 本地内联图标组件。
// 后台选中预设类型时只存 type，不再上传 Logo，前台按此映射渲染本地化图标；
// type 为 "other"（或历史数据无 type）时回退到上传的 item.src 图片。
const PRESET_SOCIAL_ICONS = {
  bilibili: SocialBilibiliIcon,
  facebook: SocialFacebookIcon,
  ins: SocialInsIcon,
  linkedin: SocialLinkedinIcon,
  sina: SocialSinaIcon,
  tiktok: SocialTiktokIcon,
  twitter: SocialTwitterIcon,
  weixin: SocialWeixinIcon,
  whatsapp: SocialWhatsappIcon,
  youtube: SocialYoutubeIcon,
};

// alt/type 常见别名 → 预设图标 key，用于历史数据无 type、仅有 alt 时的兜底解析。
const SOCIAL_ALIAS = {
  instagram: "ins",
  ig: "ins",
  fb: "facebook",
  x: "twitter",
  wechat: "weixin",
  wx: "weixin",
  yt: "youtube",
  weibo: "sina",
};

// 优先按 type 命中预设单色图标；type 缺失/为 other 时回退按 alt 归一化匹配。
function resolvePresetIcon(item) {
  const raw = (item.type && item.type !== "other" ? item.type : item.alt) || "";
  const key = raw.toString().trim().toLowerCase();
  return PRESET_SOCIAL_ICONS[key] || PRESET_SOCIAL_ICONS[SOCIAL_ALIAS[key]] || null;
}

export default function ContactModule() {
  const { CONFIG, LANG, locale, area } = React.useContext(GlobalContext);

  const [email, setEmail] = React.useState("");
  const [emailStatue, setEmailStatue] = React.useState();

  const onSubmit = React.useCallback(async () => {
    if (!email) return;
    if (!isEmail.exec(email)) {
      setEmailStatue("error");
    } else {
      try {
        const data = await Api.contactForm({
          type: "subscribe",
          email,
          path: location.pathname,
          language: locale,
          area,
        });
        if (data.code !== 0) throw new Error("code!==0");
        else setEmailStatue("success");
      } catch (err) {
        console.log("[contactForm]: ", err);
        setEmailStatue("fail");
      }
    }
  }, [email, locale, area]);

  React.useEffect(() => {
    if (emailStatue === "success") {
      const $subModal = document.getElementsByClassName(
        styles.subscription_modal
      )[0];
      document.body.style.overflow = "hidden";
      $subModal.style.display = "block";
      setTimeout(() => {
        $subModal.style.opacity = 1;
      });
      setEmail("");
    }
  }, [emailStatue]);

  return (
    <>
      <section className={styles.content}>
        <div className={styles.content_company}>
          <div className={[styles.content_logo, styles.content_item].join(" ")}>
            {CONFIG["common.social"]?.map((item, index) => {
              // 预设类型走本地内联单色图标；无法归一化才回退上传图片。
              const PresetIcon = resolvePresetIcon(item);
              return (
                <div key={index}>
                  {item.href ? (
                    <a
                      key={index}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      data-event="FooterSocialMedia"
                      data-ev-alt={item.alt}
                    >
                      {PresetIcon ? (
                        <PresetIcon
                          className={styles.social_icon}
                          width={24}
                          height={24}
                          role="img"
                          aria-hidden={false}
                          aria-label={item.alt}
                        />
                      ) : item.src ? (
                        <img
                          alt={item.alt}
                          width={24}
                          height={24}
                          src={item.src}
                        />
                      ) : null}
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div
            className={[styles.contact_email, styles.content_item].join(" ")}
          >
            <span>{LANG["common.footer.contact_email"]}：</span>
            <div>{CONFIG["common.base"]?.customer_service}</div>
          </div>
          <time
            className={styles.content_item}
            dateTime={CONFIG["common.base"]?.work_time}
          >
            <span>{LANG["common.footer.work_time"]}：</span>
            <div>{CONFIG["common.base"]?.work_time}</div>
          </time>
          {locale === "zh-cn" ? (
            <div className={styles.content_item}>
              <span>备案信息：</span>
              <span>
                <a
                  className={styles.footer_files}
                  target="_blank"
                  rel="noreferrer"
                  href="https://beian.miit.gov.cn/#/Integrated/index"
                >
                  {CONFIG["common.base"]?.website_beian}
                </a>
              </span>
            </div>
          ) : null}
        </div>
        <div className={styles.content_subscription}>
          <h2 className={styles.content_title}>
            {LANG["common.footer.email_subscribe"]}
          </h2>
          <p className={styles.content_description}>
            {LANG["common.footer.subscribe_news"]
              ?.split("${1}")
              .join(CONFIG["common.base"]?.company_name)}
          </p>
          <div className={styles.content_email}>
            <div className={styles.content_input_btn}>
              <input
                onFocus={() => setEmailStatue(null)}
                value={email}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmit();
                }}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailStatue();
                }}
                placeholder={LANG["common.footer.email_placeholder"]}
              />
              <button
                onClick={() => {
                  onSubmit();
                }}
                className={email ? styles.active_btn : ""}
              >
                <div className={styles.arrow_icon}></div>
              </button>
            </div>
            {emailStatue === "fail" ? (
              <div className={styles.email_fail}>
                {LANG["common.footer.subscribe_error"]}
              </div>
            ) : null}
            {emailStatue === "error" ? (
              <div className={styles.email_fail}>
                {LANG["common.footer.email_error"]}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className={styles.subscription_modal}>
        <div className={styles.subscription_modal_content}>
          <h2>{LANG["common.footer.subscribe_success"]}</h2>
          <p>
            {LANG["common.footer.subscribe_description"]
              ?.split("${1}")
              .join(CONFIG["common.base"]?.company_name)}
          </p>
          <button
            onClick={() => {
              const $subModal = document.getElementsByClassName(
                styles.subscription_modal
              )[0];
              $subModal.style.opacity = 0;
              document.body.style.overflow = "auto";
              setTimeout(() => {
                $subModal.style.display = "none";
              }, 400);
            }}
          >
            {LANG["common.footer.email_confirm"]}
          </button>
        </div>
      </div>
    </>
  );
}
