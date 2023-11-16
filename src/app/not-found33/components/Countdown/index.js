"use client";

import styles from "../../page.module.scss";
import { useRouter } from "next/router";
import React from "react";

export default function Countdown() {
  const [secord, setSecord] = React.useState(10);
  const router = useRouter();
  React.useEffect(() => {
    const t = setInterval(() => {
      setSecord((old) => {
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
      .join(`<span class=${styles.secord}>${secord}</span>`);
  }, [secord, LANG]);

  return (
    <p
      dangerouslySetInnerHTML={{
        __html: htmlContext,
      }}
    />
  );
}
