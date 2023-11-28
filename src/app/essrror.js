"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./error.module.scss";
import Cookies from "js-cookie";

export const runtime = "edge";
const languages = {
  en: {
    "common.website_error.navigator_link":
      'After ${second} seconds, it will automatically jump to the official website <a style="color: rgba(0,0,0,.65);text-decoration: underline;" href="/">homepage</a>',
    "common.website_error.web_error": "An error occurred on the page",
  },
};

export default function Error() {
  const locale = "en";
  const LANG = languages[locale];
  const [second, setSecond] = React.useState(10);
  const router = useRouter();
  React.useEffect(() => {
    const t = setInterval(() => {
      setSecond((old) => {
        if (old < 2) {
          clearInterval(t);
          router.replace("/");
        }
        return old - 1;
      });
    }, 1000);
    return () => {
      clearInterval(t);
    };
  }, [router]);

  const htmlContext = React.useMemo(() => {
    return LANG["common.website_error.navigator_link"]
      ?.split("${second}")
      .join(`<span class=${styles.second}>${second}</span>`);
  }, [second, LANG]);

  return (
    <div className={styles.container}>
      <h1>500</h1>
      <h2>{LANG["common.website_error.web_error"]}</h2>
      <p
        dangerouslySetInnerHTML={{
          __html: htmlContext,
        }}
      />
    </div>
  );
}
