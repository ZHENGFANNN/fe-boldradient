import styles from "./page.module.scss";
import React from "react";

import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import getRemoteConfig from "@/config/Api/getRemoteConfig";
import ForgetForm from "./components/ForgetForm";

async function getData({ locale }) {
  const [LANG, CONFIG] = await Promise.all([
    getRemoteLanguage({ locale, nameSpace: ["user.forget"] }),
    getRemoteConfig({ locale, nameSpace: ["common.base"] })
  ]);
  return { LANG, CONFIG };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { LANG, CONFIG } = await getData({
    locale
  });
  return {
    title: `${CONFIG["common.base"]?.company_name} - ${LANG["user.forget.title"]}`,
    description: LANG["user.forget.description"],
    keywords: LANG["user.forget.keywords"]
  };
}

export default async function Forget({ params }) {
  const { locale } = await params;
  const { LANG } = await getData({
    locale
  });
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          {LANG["user.forget.retrieve_password"]}
        </h1>
        <ForgetForm LANG={LANG} />
      </main>
    </div>
  );
}
