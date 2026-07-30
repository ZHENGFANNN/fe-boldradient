/** @format */

import Link from "next/link";
import React from "react";
import styles from "./page.module.scss";
import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import getRemoteConfig from "@/config/Api/getRemoteConfig";
import LoginForm from "./components/LoginForm";
import GoogleLoginPanel from "@/components/Auth/GoogleAuth/GoogleLoginPanel";

async function getData({ locale }) {
  const [LANG, CONFIG] = await Promise.all([
    getRemoteLanguage({ locale, nameSpace: ["user.login"] }),
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
    title: `${CONFIG["common.base"]?.company_name} - ${LANG["user.login.title"]}`,
    description: LANG["user.login.description"],
    keywords: LANG["user.login.keywords"],
  };
}

export default async function Login({ params }) {
  const { locale } = await params;
  const { LANG, CONFIG } = await getData({
    locale,
  });
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>{LANG["user.login.login_title"]}</h1>
        <GoogleLoginPanel
          className={styles.google_top}
          label="OR"
          dividerPosition="bottom"
          buttonLabel={LANG["user.login.google_continue"] || "Continue with Google"}
          successText={LANG["user.login.login_success"]}
          errorText={LANG["user.login.server_error"]}
        />
        <LoginForm LANG={LANG} CONFIG={CONFIG} />
        <div className={styles.agreen}>
          <span>{LANG["user.login.countinue_agree"]}</span>
          <Link scroll={true} href="/article/legal/privacy-policy">
            {LANG["user.login.privacy_policy"]}
          </Link>
          <span>{LANG["user.login.and"]}</span>
          <Link scroll={true} href="/article/legal/user-agreement">
            {LANG["user.login.user_service"]}
          </Link>
        </div>
      </main>
    </div>
  );
}
