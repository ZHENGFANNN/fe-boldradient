/** @format */
"use client";

/**
 * FeatureShowcase —— 图文交替展示组件。
 * 传入 list（[{ image, title, desc, cta_text, cta_href }]），
 * 逐行渲染：奇数行左图右文，偶数行右文左图（交替）。
 * PC 端两列并排，移动端统一图上文下（单列堆叠）。
 * list 为空则整块隐藏（return null）。
 */
import React from "react";
import Link from "next/link";
import styles from "./index.module.scss";
import { fillOssImage } from "@/utils";

export default function FeatureShowcase({ list }) {
  const items = Array.isArray(list) ? list.filter((i) => i && i.image) : [];
  if (!items.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {items.map((item, idx) => (
          <div
            key={idx}
            className={styles.row}
            data-reverse={idx % 2 === 1 ? "true" : "false"}
          >
            <div className={styles.media}>
              <img
                className={styles.image}
                src={fillOssImage(item.image)}
                alt={item.title || ""}
                loading="lazy"
              />
            </div>
            <div className={styles.body}>
              {item.eyebrow ? (
                <span className={styles.eyebrow}>{item.eyebrow}</span>
              ) : null}
              {item.title ? <h2 className={styles.title}>{item.title}</h2> : null}
              {item.desc ? <p className={styles.desc}>{item.desc}</p> : null}
              {item.cta_text && item.cta_href ? (
                <Link href={item.cta_href} className={styles.cta}>
                  {item.cta_text}
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
