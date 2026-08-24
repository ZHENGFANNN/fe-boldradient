/**
 * CategoryModule — Shop Jewelry by Category（严格对齐参考图一的排版，原创实现）。
 *
 * 版式（图一）:
 *   - 左对齐大标题（serif）+ 副标题一行。
 *   - 一排横向可滑动的分类卡（scroll-snap），右侧圆形箭头翻页。
 *   - 卡片: 近方形图（略竖 4:5）+ 标签在图下方左对齐；无 "Shop →"。
 *
 * 数据源:
 *   - 优先 HomeContent.goodsSortList（真实分类，取 name/key/image_src）。
 *   - 空店兜底: 为空时回退 DEFAULT_CATEGORIES，key 对齐库内 erp_goods_sort。
 * 渲染条件: 最终分类数 >=2 才渲染。
 * 配图: 有 image_src 用真实图；无图用 CSS 渐变占位（出图后回填 image_src 即替换）。
 */
"use client";
import React from "react";
import Link from "next/link";
import styles from "./index.module.scss";
import { HomeContent } from "../IndexContext";
import { fillOssImage } from "@/utils";

const DEFAULT_CATEGORIES = [
  { key: "engagement-rings", name: "Engagement Rings", tint: "linear-gradient(135deg,#2f4f4a,#5b7a72)" },
  { key: "womens-wedding-rings", name: "Women's Wedding Rings", tint: "linear-gradient(135deg,#b8862f,#d8ad55)" },
  { key: "mens-wedding-rings", name: "Men's Wedding Rings", tint: "linear-gradient(135deg,#b6a888,#cbbb99)" },
  { key: "gemstone-rings", name: "Gemstone Rings", tint: "linear-gradient(135deg,#274a44,#3f6b62)" },
  { key: "earrings", name: "Earrings", tint: "linear-gradient(135deg,#b9a87f,#d0bd97)" },
  { key: "necklaces", name: "Necklaces", tint: "linear-gradient(135deg,#7a2b25,#a8433a)" },
  { key: "bracelets", name: "Bracelets", tint: "linear-gradient(135deg,#8a6a3a,#b08a4f)" },
  { key: "rings", name: "Rings", tint: "linear-gradient(135deg,#3a4a48,#5a6f6b)" },
];

const TINTS = DEFAULT_CATEGORIES.map((c) => c.tint);

export default function CategoryModule() {
  const { goodsSortList, LANG } = React.useContext(HomeContent) || {};
  const scrollerRef = React.useRef(null);
  // 滚动到头/尾时隐藏对应箭头（起始态在最左 → 不显示左箭头）
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const real = Array.isArray(goodsSortList) ? goodsSortList : [];
  const cats =
    real.length >= 2
      ? real.slice(0, 12).map((c, i) => ({
          key: c.key,
          name: c.name,
          image: c.image_src || c.goodList?.[0]?.image,
          tint: TINTS[i % TINTS.length],
        }))
      : DEFAULT_CATEGORIES;

  const updateEdges = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setAtStart(scrollLeft <= 1);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  if (cats.length < 2) return null;

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    // 每次滚动一张卡：按首张卡实际宽度 + gap 计算步长（不写死，跟随断点变化）
    const first = el.querySelector(`.${styles.card}`);
    let step = el.clientWidth * 0.85;
    if (first) {
      const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 0;
      step = first.getBoundingClientRect().width + gap;
    }
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className={styles.module} aria-label="Shop Jewelry by Category">
      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 className={styles.title}>
            {LANG?.["home.category.title"] || "Shop Jewelry by Category"}
          </h2>
          <p className={styles.subtitle}>
            {LANG?.["home.category.subtitle"] ||
              "Thoughtfully designed collections for the big day and every day."}
          </p>
        </div>
      </div>

      <div className={styles.carousel}>
        <div className={styles.scroller} ref={scrollerRef}>
          {cats.map((c) => {
            const img = c.image ? fillOssImage(c.image) : null;
            return (
              <Link
                key={c.key}
                href={`/product/${c.key}`}
                className={styles.card}
                data-event="HomeCategory"
                data-ev-cat={c.key}
              >
                <div
                  className={styles.thumb}
                  style={img ? undefined : { backgroundImage: c.tint }}
                >
                  {img ? (
                    <img src={img} alt={c.name} loading="lazy" />
                  ) : (
                    <span className={styles.placeholderMark} aria-hidden="true" />
                  )}
                </div>
                <span className={styles.name}>{c.name}</span>
              </Link>
            );
          })}
        </div>

        {!atEnd ? (
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            aria-label="Next categories"
            onClick={() => scrollBy(1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        ) : null}
        {!atStart ? (
          <button
            type="button"
            className={`${styles.arrow} ${styles.prev}`}
            aria-label="Previous categories"
            onClick={() => scrollBy(-1)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        ) : null}
      </div>
    </section>
  );
}
