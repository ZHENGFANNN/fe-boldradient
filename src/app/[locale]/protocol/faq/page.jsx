import styles from "./page.module.scss";

import getConfigData from "@/utils/getConfigData";
import FaqList from "./components/FaqList";
import StickyTitle from "./components/StickyTitle";
export const runtime = "edge";

export async function generateMetadata({ params: { locale } }) {
  const { LANG, CONFIG } = await getConfigData({
    locale,
    configList: ["config", "language"],
  });
  return {
    title: `${CONFIG["company.basic.company_name"]} - ${LANG["www.protocol_faq.title"]}`,
    description: LANG["www.protocol_faq.description"],
    keywords: LANG["www.protocol_faq.keywords"],
  };
}

export default async function Faq({ params: { locale } }) {
  const { LANG, CONFIG } = await getConfigData({
    locale,
    configList: ["config", "language"],
    languageNameSpace: ["www.protocol_faq"],
    configNameSpace: ["www.protocol.faq"],
  });
  return (
    <div className={styles.container}>
      <StickyTitle LANG={LANG} />
      <div className={styles.content_container}>
        <div className={styles.content_title}>
          {LANG["www.protocol_faq.content_title"]}
        </div>
        <div className={styles.content_line}></div>
        <FaqList CONFIG={CONFIG} />
      </div>
    </div>
  );
}
