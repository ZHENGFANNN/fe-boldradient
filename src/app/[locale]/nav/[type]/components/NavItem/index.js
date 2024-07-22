/** @format */

"use client";
import React from "react";
import styles from "../../page.module.scss";
import Link from "next/link";

export default function NavItem({ navList, type }) {
  const [list, setList] = React.useState([]);
  React.useEffect(() => {
    try {
      const obj = {};
      navList.forEach((item) => {
        obj[item.key] = item;
      });
      const data = obj[type];
      setList(data.list);
    } catch {}
  }, [type, navList]);

  return (
    <section className={styles.header_nav_content}>
      <div className={styles.header_nav_container}>
        <div className={styles.header_nav_width}>
          {list.map((item, index) => {
            return (
              <Link
                scroll={false}
                href={item.href}
                className={styles.header_nav_items}
                key={index}
              >
                {item.img}
                <p>{item.sub_title}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
