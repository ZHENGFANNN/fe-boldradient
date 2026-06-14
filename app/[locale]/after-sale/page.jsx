/** @format */

import styles from "./page.module.scss";
import getConfigData from "@/utils/getConfigData";
import AfterSaleClient from "./components/AfterSaleClient";
import { buildAlternates } from "@/config/seo";

async function getData({ locale }) {
  const result = await getConfigData({
    locale,
    configList: ["config", "language"],
    languageNameSpace: ["user_account"],
    configNameSpace: ["common.base"],
  });
  return result;
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { CONFIG } = await getData({ locale });
  const company = CONFIG["common.base"]?.company_name || "";
  return {
    title: `${company} - After-Sales Service`,
    description:
      "Submit a return, refund, exchange or repair request. Our team is here to help with your order.",
    alternates: buildAlternates("/after-sale", locale),
  };
}

export default async function AfterSalePage({ params }) {
  const { locale } = await params;
  const { LANG } = await getData({ locale });
  return (
    <div className={styles.container}>
      <AfterSaleClient LANG={LANG} />
    </div>
  );
}
