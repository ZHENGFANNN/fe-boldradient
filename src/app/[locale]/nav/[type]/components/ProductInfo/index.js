"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "../../page.module.scss";
import Link from "next/link";

export default function ProductInfo({ NAVLIST, type }) {
  const [list, setList] = React.useState([]);
  const router = useRouter();
  React.useEffect(() => {
    try {
      const obj = {};
      NAVLIST.forEach((item) => {
        obj[item.key] = item;
      });
      const data = obj[type];
      setList(data.list);
    } catch {}
  }, [type, NAVLIST, router]);

  return (
    <section className={styles.header_nav_content}>
      <div className={styles.header_nav_container}>
        <div className={styles.header_nav_width}>
          {list.map((item, index) => {
            return (
              <Link
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
