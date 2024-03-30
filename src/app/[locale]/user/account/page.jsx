import React from "react";

import getConfigData from "@/utils/getConfigData";
import Main from "./components/Main";

export const runtime = "edge";

export async function generateMetadata({ params: { locale } }) {
  const { LANG, CONFIG } = await getConfigData({
    locale,
    configList: ["config", "language"],
  });
  return {
    title: `${CONFIG["company.basic.company_name"]} - ${LANG["www.account.page_title"]}`,
    description: LANG["www.account.page_description"],
    keywords: LANG["www.account.page_keywords"],
  };
}

export default async function Account({ params: { locale } }) {
  const { LANG } = await getConfigData({
    locale,
    configList: ["language"],
    languageNameSpace: ["www.account"],
  });
  return <Main LANG={LANG} />;
}
