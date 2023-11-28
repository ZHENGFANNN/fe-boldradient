"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "../../page.module.scss";

export default function Main({ LANG }) {
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
    return LANG["common.not_found.navigator_link"]
      ?.split("${second}")
      .join(`<span class=${styles.second}>${second}</span>`);
  }, [second, LANG]);

  return (
    <p
      dangerouslySetInnerHTML={{
        __html: htmlContext,
      }}
    />
  );
}
