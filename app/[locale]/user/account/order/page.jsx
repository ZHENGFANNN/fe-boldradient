import React from "react";

import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import getRemoteConfig from "@/config/Api/getRemoteConfig";
import OrderPageClient from "./OrderPageClient";

async function getData({ locale }) {
  const [LANG, CONFIG] = await Promise.all([
    getRemoteLanguage({ locale, nameSpace: ["user.account"] }),
    getRemoteConfig({ locale, nameSpace: ["common.base"] }),
  ]);
  return { LANG, CONFIG };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { LANG, CONFIG } = await getData({ locale });
  return {
    title: `${CONFIG["common.base"]?.company_name} - ${LANG["user.account.my_order"]}`,
    description: LANG["user.account.page_description"],
    keywords: LANG["user.account.page_keywords"],
  };
}

export default async function AccountOrderPage({ params }) {
  const { locale } = await params;
  const { LANG } = await getData({ locale });
  return <OrderPageClient LANG={LANG} locale={locale} />;
}
