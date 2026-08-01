/** @format */

import styles from "../forget/page.module.scss";
import React from "react";

import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import getRemoteConfig from "@/config/Api/getRemoteConfig";
import { mergeMeta } from "@/config/mergeMeta";
import ResetForm from "./components/ResetForm";
async function getData({ locale }) {
  const [LANG, CONFIG] = await Promise.all([
    getRemoteLanguage({ locale, nameSpace: ["user.forget"] }),
    getRemoteConfig({ locale, nameSpace: ["common.base"] }),
  ]);
  return { LANG, CONFIG };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { LANG, CONFIG } = await getData({ locale });
  return mergeMeta(
    {
      title: `${CONFIG["common.base"]?.company_name} - ${
        LANG["user.forget.retrieve_password"] || "Reset password"
      }`,
      description: LANG["user.forget.description"],
    },
    "/user/reset-password"
  );
}

export default async function ResetPassword({ params }) {
  const { locale } = await params;
  const { LANG } = await getData({ locale });
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          {LANG["user.forget.retrieve_password"] || "Reset password"}
        </h1>
        <ResetForm LANG={LANG} />
      </main>
    </div>
  );
}
