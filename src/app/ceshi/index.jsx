import React from "react";
import styles from "./page.module.scss";
// import Countdown from "./components/Countdown";
import getAllConfigData from "@/utils/getAllConfigData";

export const runtime = "edge";
export async function generateMetadata({ params: { locale } }) {
  const { LANG, CONFIG } = await getAllConfigData(locale);
  return {
    title: `${CONFIG["company.basic.company_name"]} - ${LANG["common.not_found.title"]}`,
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
      {/* <Countdown /> */}
    </div>
  );
}
