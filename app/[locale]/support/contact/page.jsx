import React from "react";
import styles from "./page.module.scss";
import getRemoteLanguage from "@/config/Api/getRemoteLanguage";
import getRemoteConfig from "@/config/Api/getRemoteConfig";
import { buildAlternates } from "@/config/seo";
import { mergeMeta } from "@/config/mergeMeta";
import ContactForm from "./components/ContactForm";

async function getData({ locale }) {
  const [LANG, CONFIG] = await Promise.all([
    getRemoteLanguage({ locale, nameSpace: ["support.contact"] }),
    getRemoteConfig({ locale, nameSpace: ["common.base"] }),
  ]);
  return { LANG, CONFIG };
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const { LANG, CONFIG } = await getData({
    locale,
  });
  return mergeMeta(
    {
      title: `${CONFIG["common.base"]?.company_name} - ${LANG["support.contact.title"]}`,
      description: LANG["support.contact.description"],
      keywords: LANG["support.contact.keywords"],
      alternates: buildAlternates("/support/contact", locale),
    },
    "/support/contact"
  );
}

export default async function Contact() {
  return (
    <div className={styles.container}>
      <ContactForm />
    </div>
  );
}
