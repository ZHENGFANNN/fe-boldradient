import styles from "./page.module.scss";
import React from "react";

import getAllConfigData from "@/utils/getAllConfigData";
import ForgetForm from "./components/ForgetForm";
import background from "../bg.webp";

export const runtime = "edge";

export async function generateMetadata({ params: { locale } }) {
  const { LANG, CONFIG } = await getAllConfigData(locale);
  return {
    title: `${CONFIG["company.basic.company_name"]} - ${LANG["www.forget.title"]}`,
    description: LANG["www.forget.description"],
    keywords: LANG["www.forget.keywords"],
  };
}

export default async function Forget({ params: { locale } }) {
  const { LANG, CONFIG } = await getAllConfigData(locale);
  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${background.src})`,
      }}
    >
      <main className={styles.main}>
        <img
          alt={CONFIG["company.basic.company_name"]}
          src={CONFIG["company.basic.logo"]}
          width={40}
          height={40}
        />
        <h1 className={styles.title}>{LANG["www.forget.retrieve_password"]}</h1>
        <ForgetForm LANG={LANG} />
      </main>
    </div>
  );
}
