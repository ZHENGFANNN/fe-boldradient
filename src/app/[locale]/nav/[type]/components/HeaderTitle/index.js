"use client";
import styles from "../../page.module.scss";
import React from "react";

export default function HeaderTitle({ navList, type }) {
  const [title, setTitle] = React.useState();
  React.useEffect(() => {
    try {
      const obj = {};
      navList.forEach((item) => {
        obj[item.key] = item;
      });
      const data = obj[type];
      setTitle(data.title);
    } catch {
      location.href = "/not-found";
    }
  }, [type, navList]);

  return (
    <div className={styles.nav_container}>
      <h1>{title}</h1>
    </div>
  );
}
