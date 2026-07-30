/** @format */

import Link from "next/link";
import styles from "./page.module.scss";
import React from "react";
import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import getRemoteConfig from "@/config/Api/getRemoteConfig";
import RegisterForm from "./components/RegisterForm";
import GoogleLoginPanel from "@/components/Auth/GoogleAuth/GoogleLoginPanel";

async function getData({ locale }) {
  const [LANG, CONFIG] = await Promise.all([
    getRemoteLanguage({ locale, nameSpace: ["user.register"] }),
    getRemoteConfig({ locale, nameSpace: ["common.base"] }),
  ]);
  return { LANG, CONFIG };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { LANG, CONFIG } = await getData({
    locale,
  });
  return {
    title: `${CONFIG["common.base"]?.company_name} - ${LANG["user.register.title"]}`,
    description: LANG["user.register.description"],
    keywords: LANG["user.register.keywords"],
  };
}

export default async function Register({ params }) {
  const { locale } = await params;
  const { LANG } = await getData({
    locale,
  });
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          {LANG["user.register.regsiter_title"]}
        </h1>
        <GoogleLoginPanel
          className={styles.google_top}
          label="OR"
          dividerPosition="bottom"
          buttonLabel={LANG["user.register.google_continue"] || "Continue with Google"}
          successText={LANG["user.register.register_success"]}
          errorText={LANG["user.register.tip_service_exception"]}
        />
        <RegisterForm LANG={LANG} />
        <p className={styles.register}>
          <span>{LANG["user.register.already_account"]}</span>
          <Link scroll={true} href="/user/login">
            {LANG["user.register.login_now"]}
          </Link>
        </p>
        <div className={styles.agreen}>
          <span>{LANG["user.register.contiuning_agree"]}</span>
          <Link scroll={true} href="/article/legal/privacy-policy">
            {LANG["user.register.privacy_policy"]}
          </Link>
          <span>{LANG["user.register.and"]}</span>
          <Link scroll={true} href="/article/legal/user-agreement">
            {LANG["user.register.user_service"]}
          </Link>
        </div>
      </main>
    </div>
  );
}
