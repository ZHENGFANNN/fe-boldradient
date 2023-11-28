import React from "react";
import styles from "./page.module.scss";
export const runtime = "edge";

import getAllConfigData from "@/utils/getAllConfigData";
import Main from "./component/Main";

export async function generateMetadata({ params: { locale } }) {
  const { LANG, CONFIG } = await getAllConfigData(locale);
  return {
    title: `${LANG["common.not_found.title"]} - ${CONFIG["company.basic.company_name"]}`,
    description: LANG["common.not_found.description"],
    keywords: LANG["common.not_found.keywords"],
  };
}

export default async function NotFound({ params: { locale } }) {
  const { LANG } = await getAllConfigData(locale);
  return (
    <div className={styles.container}>
      <h1>404</h1>
      <h2>{LANG["common.not_found.content_title"]}</h2>
      <Main LANG={LANG} />
    </div>
  );
}
