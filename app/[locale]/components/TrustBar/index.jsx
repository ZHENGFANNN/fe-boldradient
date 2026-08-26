/**
 * TrustBar — Hero 下方信任/价值主张条（首页，mock 数据）。
 *
 * 展示 4 项高客单珠宝转化标配：免运费 / 终身质保 / 30 天免费退换 / IGI·GIA 认证 / 无冲突来源。
 * 纯静态、无数据依赖；细线描边图标 + serif 标题，对齐站点编辑风。
 * 需要后台可配时，把 ITEMS 换成 props/context 下发即可，渲染不变。
 */
"use client";
import React from "react";
import styles from "./index.module.scss";

// 极简线性图标（细线，奢品感）
const Icons = {
  shipping: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
      <circle cx="7" cy="18" r="1.6" /><circle cx="17.5" cy="18" r="1.6" />
    </svg>
  ),
  warranty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  returns: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v4h4" />
    </svg>
  ),
  certified: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="5" /><path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5" />
    </svg>
  ),
};

const ITEMS = [
  { icon: "shipping", title: "Free Shipping", desc: "Complimentary insured delivery, worldwide." },
  { icon: "warranty", title: "Lifetime Warranty", desc: "Every piece covered, for life." },
  { icon: "returns", title: "30-Day Returns", desc: "Free returns, no questions asked." },
  { icon: "certified", title: "IGI & GIA Certified", desc: "Independently graded, conflict-free." },
];

export default function TrustBar({ items }) {
  const list = Array.isArray(items) && items.length ? items : ITEMS;
  return (
    <section className={styles.bar} aria-label="Our promise">
      <div className={styles.inner}>
        {list.map((it, i) => (
          <div className={styles.item} key={i}>
            <span className={styles.icon}>{Icons[it.icon] || Icons.certified}</span>
            <div className={styles.text}>
              <span className={styles.title}>{it.title}</span>
              {it.desc ? <span className={styles.desc}>{it.desc}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
