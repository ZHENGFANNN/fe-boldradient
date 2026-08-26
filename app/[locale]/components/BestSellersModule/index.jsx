/**
 * BestSellersModule — 当前热卖 Top 10（首页,横向滑动,mock 数据）。
 *
 * 设计: 对齐 BlogModule/CategoryModule 调性;卡片复用商品卡语义(方图 + 评分 + 名称 + 价格),
 *   带排名角标(#1..#10)、限时折后价划线原价。10 件走横向 scroll-snap + 圆形翻页箭头。
 *
 * 数据: 先 mock(MOCK_PRODUCTS,形状贴近后端 product:key/sort_key/name/image/price...)。
 *   接后端后把 MOCK 换成 props/context 下发的真实热卖列表即可,组件渲染不变。
 *   价格此处直接给数字 + 币种(mock),真实接线时改用 ProductCardPrice + 批量取价。
 */
"use client";
import React from "react";
import Link from "next/link";
import styles from "./index.module.scss";
import { HomeContent } from "../IndexContext";
import { fillOssImage } from "@/utils";
import { StarIcon, StarActiveIcon } from "@/components/Icon";

// 低饱和 tonal 占位主题(无图时用),与 BlogModule 同色系。
const TINTS = [
  "linear-gradient(150deg,#e9ede8 0%,#d5ded4 100%)",
  "linear-gradient(150deg,#f2ebdd 0%,#e6d8bf 100%)",
  "linear-gradient(150deg,#eeeae6 0%,#ddd6cd 100%)",
];

// mock 热卖商品(10 件),形状贴近后端 product;price/compare_at 为 mock 数字(单位美元)。
const MOCK_PRODUCTS = [
  { key: "round-solitaire", sort_key: "engagement-rings", name: "Round Solitaire Engagement Ring", image: "", price: 1290, compare_at: 1590, reviews_score: 4.9, reviews_num: 218 },
  { key: "oval-halo", sort_key: "engagement-rings", name: "Oval Halo Diamond Ring", image: "", price: 1680, compare_at: 0, reviews_score: 4.8, reviews_num: 176 },
  { key: "emerald-three-stone", sort_key: "engagement-rings", name: "Emerald Cut Three-Stone Ring", image: "", price: 2150, compare_at: 2490, reviews_score: 5.0, reviews_num: 94 },
  { key: "tennis-bracelet", sort_key: "bracelets", name: "Lab-Grown Diamond Tennis Bracelet", image: "", price: 990, compare_at: 1250, reviews_score: 4.7, reviews_num: 312 },
  { key: "stud-earrings", sort_key: "earrings", name: "Classic Diamond Stud Earrings", image: "", price: 560, compare_at: 0, reviews_score: 4.9, reviews_num: 401 },
  { key: "pear-pendant", sort_key: "necklaces", name: "Pear Solitaire Pendant Necklace", image: "", price: 720, compare_at: 890, reviews_score: 4.8, reviews_num: 143 },
  { key: "cushion-pave", sort_key: "engagement-rings", name: "Cushion Pavé Engagement Ring", image: "", price: 1450, compare_at: 0, reviews_score: 4.9, reviews_num: 87 },
  { key: "eternity-band", sort_key: "womens-wedding-rings", name: "Diamond Eternity Wedding Band", image: "", price: 880, compare_at: 1080, reviews_score: 4.8, reviews_num: 205 },
  { key: "hoop-earrings", sort_key: "earrings", name: "Pavé Diamond Hoop Earrings", image: "", price: 640, compare_at: 0, reviews_score: 4.7, reviews_num: 129 },
  { key: "marquise-ring", sort_key: "engagement-rings", name: "Marquise Diamond Engagement Ring", image: "", price: 1590, compare_at: 1890, reviews_score: 5.0, reviews_num: 66 },
];

// mock 价格格式化(真实接线后改走 ProductCardPrice / areaInfo)。
function formatUsd(n) {
  if (!Number(n)) return "";
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// 5 星评分(复刻 IndexProductList 的星条覆盖法,90px 满宽)。
function ReviewRate({ score, num, LANG }) {
  const label = LANG?.["home.reviews"] ? LANG["home.reviews"].replace("${num}", num) : `${num}`;
  return (
    <div className={styles.stars}>
      <div className={styles.starsBase}>
        <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
      </div>
      <div className={styles.starsActive} style={{ width: 78 * (score / 5) }}>
        <StarActiveIcon /><StarActiveIcon /><StarActiveIcon /><StarActiveIcon /><StarActiveIcon />
      </div>
      <span className={styles.score}>({label})</span>
    </div>
  );
}

export default function BestSellersModule() {
  const { LANG, bestSellers } = React.useContext(HomeContent) || {};
  const scrollerRef = React.useRef(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const list = (Array.isArray(bestSellers) && bestSellers.length > 0 ? bestSellers : MOCK_PRODUCTS).slice(0, 10);

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

  if (list.length < 2) return null;

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.querySelector(`.${styles.card}`);
    let step = el.clientWidth * 0.85;
    if (first) {
      const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 0;
      step = first.getBoundingClientRect().width + gap;
    }
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className={styles.module} aria-label="Best Sellers">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.headText}>
            <span className={styles.kicker}>{LANG?.["home.bestsellers.kicker"] || "Most Loved"}</span>
            <h2 className={styles.title}>{LANG?.["home.bestsellers.title"] || "Best Sellers"}</h2>
            <p className={styles.subtitle}>
              {LANG?.["home.bestsellers.subtitle"] || "The pieces our customers can't stop talking about."}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.carousel}>
        <div className={styles.scroller} ref={scrollerRef}>
          {list.map((p, i) => {
            const img = p.image ? fillOssImage(p.image) : null;
            const onSale = Number(p.compare_at) > Number(p.price);
            return (
              <Link
                key={p.key || i}
                href={`/product/${p.sort_key}/${p.key}`}
                className={styles.card}
                data-event="HomeBestSeller"
                data-ev-product={p.key}
              >
                <div
                  className={styles.thumb}
                  style={img ? undefined : { backgroundImage: TINTS[i % TINTS.length] }}
                >
                  <span className={styles.rank}>{i + 1}</span>
                  {onSale ? <span className={styles.saleTag}>Sale</span> : null}
                  {img ? (
                    <img src={img} alt={p.name} loading="lazy" />
                  ) : (
                    <span className={styles.placeholderMark} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.body}>
                  {p.reviews_score ? (
                    <ReviewRate score={p.reviews_score} num={p.reviews_num} LANG={LANG} />
                  ) : null}
                  <h3 className={styles.name}>{p.name}</h3>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{formatUsd(p.price)}</span>
                    {onSale ? (
                      <span className={styles.compareAt}>{formatUsd(p.compare_at)}</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!atEnd ? (
          <button type="button" className={`${styles.arrow} ${styles.next}`} aria-label="Next products" onClick={() => scrollBy(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        ) : null}
        {!atStart ? (
          <button type="button" className={`${styles.arrow} ${styles.prev}`} aria-label="Previous products" onClick={() => scrollBy(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        ) : null}
      </div>
    </section>
  );
}
