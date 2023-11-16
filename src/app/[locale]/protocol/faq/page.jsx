import styles from "./page.module.scss";

import getAllConfigData from "@/utils/getAllConfigData";
import FaqList from "./components/FaqList";
import StickyTitle from "./components/StickyTitle";
export const runtime = "edge";

export async function generateMetadata({ params: { locale } }) {
  const { LANG, CONFIG } = await getAllConfigData(locale);
  return {
    title: `${CONFIG["company.basic.company_name"]} - ${LANG["www.protocol_faq.title"]}`,
    description: LANG["www.protocol_faq.description"],
    keywords: LANG["www.protocol_faq.keywords"],
  };
}

export default async function Faq({ params: { locale } }) {
  const { LANG, CONFIG } = await getAllConfigData(locale);
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
