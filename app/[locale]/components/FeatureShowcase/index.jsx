/** @format */
"use client";

/**
 * FeatureShowcase —— 图文交替展示组件。
 * 传入 list（[{ image, title, desc, cta_text, cta_href, eyebrow, tint }]），
 * 逐行渲染：奇数行左图右文，偶数行右文左图（交替）。
 * PC 端两列并排，移动端统一图上文下（单列堆叠）。
 * 无 image 时用 tonal 渐变 + 钻石线稿占位（支持纯 mock/未出图场景）；有 title/desc 即渲染。
 * list 为空则整块隐藏（return null）。
 */
import React from "react";
import Link from "next/link";
import styles from "./index.module.scss";
import { fillOssImage } from "@/utils";

// 无图占位的低饱和 tonal 主题（与 Blog/BestSellers 同色系）
const TINTS = [
  { bg: "linear-gradient(150deg,#e9ede8 0%,#d5ded4 100%)", ink: "rgba(47,79,74,0.30)" },
  { bg: "linear-gradient(150deg,#f2ebdd 0%,#e6d8bf 100%)", ink: "rgba(150,110,44,0.28)" },
  { bg: "linear-gradient(150deg,#eeeae6 0%,#ddd6cd 100%)", ink: "rgba(60,60,60,0.22)" },
];

// 钻石刻面线稿占位
function FacetMark({ color }) {
  return (
    <svg className={styles.facet} viewBox="0 0 120 96" fill="none" stroke={color} strokeWidth="1" strokeLinejoin="round" aria-hidden="true">
      <path d="M60 8 L100 36 L60 88 L20 36 Z" />
      <path d="M20 36 H100" />
      <path d="M60 8 L44 36 L60 88 M60 8 L76 36 L60 88" />
      <path d="M44 36 L20 36 M76 36 L100 36" />
    </svg>
  );
}

export default function FeatureShowcase({ list }) {
  // 有图或有标题都渲染（无图走占位），彻底空对象才过滤
  const items = Array.isArray(list) ? list.filter((i) => i && (i.image || i.title)) : [];
  if (!items.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {items.map((item, idx) => {
          const theme = TINTS[idx % TINTS.length];
          const img = item.image ? fillOssImage(item.image) : null;
          return (
            <div
              key={idx}
              className={styles.row}
              data-reverse={idx % 2 === 1 ? "true" : "false"}
            >
              <div
                className={styles.media}
                style={img ? undefined : { backgroundImage: item.tint || theme.bg }}
              >
                {img ? (
                  <img
                    className={styles.image}
                    src={img}
                    alt={item.title || ""}
                    loading="lazy"
                  />
                ) : (
                  <FacetMark color={theme.ink} />
                )}
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
          );
        })}
      </div>
    </section>
  );
}
