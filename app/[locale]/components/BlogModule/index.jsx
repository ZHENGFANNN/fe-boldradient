/**
 * BlogModule — From the Journal（首页最新博客,编辑风,对齐旗舰站 IndexDiamondShapes 调性）。
 *
 * 设计:
 *   - Georgia serif 标题 + 暖白 ivory 背景,奢品编辑调性(非首页其它模块的 sans 版式)。
 *   - 3 张最新文章卡:16:9 封面 + 分类眉标(带短分隔线) + serif 标题 + 日期。
 *   - 无封面图时不再用高饱和色块,改「柔和低饱和 tonal 渐变 + 钻石刻面线稿 SVG」占位,读起来是刻意留白而非坏图。
 *
 * 数据源:
 *   - 优先 HomeContent.blogList(IndexContext 已预留;接后端后 page.jsx 下发即自动切换)。
 *   - 空店/未接线兜底: MOCK_BLOGS。兼容 blogSortList([{name,blogList}]) 与扁平 article[]。
 * 展示: 跨分类拍平后按 updated_time 降序取最新 3 篇;不足 2 篇不渲染。
 */
"use client";
import React from "react";
import Link from "next/link";
import styles from "./index.module.scss";
import { HomeContent } from "../IndexContext";
import { fillOssImage } from "@/utils";

const LATEST_COUNT = 3;

// 低饱和 tonal 主题(sage / champagne / stone),取代原高饱和绿金,匹配奢品调性。
const THEMES = [
  { bg: "linear-gradient(150deg,#e9ede8 0%,#d5ded4 100%)", ink: "rgba(47,79,74,0.30)" },
  { bg: "linear-gradient(150deg,#f2ebdd 0%,#e6d8bf 100%)", ink: "rgba(150,110,44,0.28)" },
  { bg: "linear-gradient(150deg,#eeeae6 0%,#ddd6cd 100%)", ink: "rgba(60,60,60,0.22)" },
];

// mock 数据:接后端前的占位,形状对齐后端 article(image/title/key/sort_key/updated_time)。
const MOCK_BLOGS = [
  {
    key: "how-to-choose-lab-grown-diamond",
    sort_key: "buying-guide",
    sort_name: "Buying Guide",
    title: "How to Choose the Perfect Lab-Grown Diamond",
    image: "",
    updated_time: "2026-08-20T00:00:00Z",
  },
  {
    key: "engagement-ring-styles-2026",
    sort_key: "trends",
    sort_name: "Trends",
    title: "Engagement Ring Styles Defining 2026",
    image: "",
    updated_time: "2026-08-14T00:00:00Z",
  },
  {
    key: "caring-for-your-fine-jewelry",
    sort_key: "care",
    sort_name: "Jewelry Care",
    title: "Caring for Your Fine Jewelry: A Complete Guide",
    image: "",
    updated_time: "2026-08-06T00:00:00Z",
  },
];

// 钻石刻面线稿(占位中心图案),color 跟随主题 ink,细线奢品感。
function FacetMark({ color }) {
  return (
    <svg
      className={styles.facet}
      viewBox="0 0 120 96"
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M60 8 L100 36 L60 88 L20 36 Z" />
      <path d="M20 36 H100" />
      <path d="M60 8 L44 36 L60 88 M60 8 L76 36 L60 88" />
      <path d="M44 36 L20 36 M76 36 L100 36" />
    </svg>
  );
}

// 轻量日期格式化(不引 dayjs):Aug 20, 2026。
function formatDate(time, locale) {
  const d = new Date(time);
  if (isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale || "en", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

// 归一化 context.blogList → 扁平 article[](兼容 blogSortList 与已扁平两种形状)。
function flattenBlogs(blogList) {
  if (!Array.isArray(blogList) || blogList.length === 0) return [];
  if (blogList[0] && Array.isArray(blogList[0].blogList)) {
    return blogList.flatMap((sort) =>
      (sort.blogList || []).map((a) => ({ ...a, sort_name: a.sort_name || sort.name }))
    );
  }
  return blogList;
}

export default function BlogModule() {
  const { blogList, LANG, locale } = React.useContext(HomeContent) || {};

  const real = flattenBlogs(blogList);
  const source = real.length > 0 ? real : MOCK_BLOGS;

  const latest = [...source]
    .sort((a, b) => new Date(b.updated_time || 0) - new Date(a.updated_time || 0))
    .slice(0, LATEST_COUNT);

  if (latest.length < 2) return null;

  return (
    <section className={styles.module} aria-label="From the Journal">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headText}>
            <span className={styles.kicker}>The Journal</span>
            <h2 className={styles.title}>
              {LANG?.["home.blog.title"] || "Stories & Guides"}
            </h2>
            <p className={styles.subtitle}>
              {LANG?.["home.blog.subtitle"] ||
                "Insights, trends, and stories from the world of fine jewelry."}
            </p>
          </div>
          <Link href="/blog" className={styles.viewAll} data-event="HomeBlogViewAll">
            <span>{LANG?.["blog.view_all"] || "View all"}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>

        <div className={styles.grid}>
          {latest.map((b, i) => {
            const img = b.image ? fillOssImage(b.image) : null;
            const theme = THEMES[i % THEMES.length];
            return (
              <Link
                key={b.key || i}
                href={`/blog/${b.sort_key}/${b.key}`}
                className={styles.card}
                data-event="HomeBlog"
                data-ev-blog={b.key}
              >
                <div
                  className={styles.thumb}
                  style={img ? undefined : { backgroundImage: theme.bg }}
                >
                  {img ? (
                    <img src={img} alt={b.title} loading="lazy" />
                  ) : (
                    <FacetMark color={theme.ink} />
                  )}
                </div>
                <div className={styles.body}>
                  {b.sort_name ? (
                    <span className={styles.eyebrow}>{b.sort_name}</span>
                  ) : null}
                  <h3 className={styles.cardTitle}>{b.title}</h3>
                  {b.updated_time ? (
                    <time className={styles.date}>
                      {formatDate(b.updated_time, locale)}
                    </time>
                  ) : null}
                  <span className={styles.readMore}>
                    {LANG?.["home.blog.read_more"] || "Read article"}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
