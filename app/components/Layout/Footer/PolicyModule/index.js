"use client";

import React from "react";
import Link from "next/link";
import GlobalContext from "@/[locale]/context";

import styles from "./index.module.scss";

// 页脚协议模块：隐私条款 / 用户协议 / Cookie 政策为文章链接（sort=legal），
// Cookie 设置为按钮触发偏好弹窗。用「·」分隔，位于 ContactModule 与 BottomModule 之间。
export default function PolicyModule() {
  const { LANG, showCookieSetting } = React.useContext(GlobalContext);

  const items = [
    {
      key: "privacy",
      href: "/article/legal/privacy-policy",
      label: LANG["user.login.privacy_policy"] || "Privacy Policy",
    },
    {
      key: "user-agreement",
      href: "/article/legal/user-agreement",
      label: LANG["user.login.user_service"] || "User Agreement",
    },
    {
      key: "cookie-policy",
      href: "/article/legal/cookie-policy",
      label: LANG["common.cookie.cookie_policy"] || "Cookie Policy",
    },
    {
      key: "cookie-setting",
      onClick: () => showCookieSetting?.(),
      label: LANG["common.cookie.cookie_perferences"] || "Cookie Settings",
    },
  ];

  return (
    <section className={styles.policy}>
      <ul className={styles.policy_list}>
        {items.map((item, index) => (
          <li key={item.key} className={styles.policy_item}>
            {item.href ? (
              <Link
                scroll={true}
                href={item.href}
                className={styles.policy_link}
                data-event="FooterPolicy"
                data-ev-alt={item.key}
              >
                {item.label}
              </Link>
            ) : (
              <a
                className={styles.policy_link}
                data-event="FooterCookieSetting"
                onClick={item.onClick}
              >
                {item.label}
              </a>
            )}
            {index < items.length - 1 ? (
              <span className={styles.policy_dot} aria-hidden="true">
                ·
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
