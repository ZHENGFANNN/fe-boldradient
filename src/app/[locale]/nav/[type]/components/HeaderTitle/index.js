"use client";
import styles from "../../page.module.scss";
import React from "react";
import { useRouter } from "next/navigation";

export default function HeaderTitle({ NAVLIST, type }) {
  const [title, setTitle] = React.useState();
  const router = useRouter();

  React.useEffect(() => {
    try {
      const obj = {};
      NAVLIST.forEach((item) => {
        obj[item.key] = item;
      });
      const data = obj[type];
      setTitle(data.title);
    } catch {
      // 防止type不合法
      location.href = "/404";
    }
  }, [type, NAVLIST, router]);

  return (
    <div className={styles.nav_container}>
      <h1>{title}</h1>
    </div>
  );
}
