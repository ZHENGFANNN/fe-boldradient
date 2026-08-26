/**
 * ReviewsModule — 首页级客户评价聚合（mock 数据）。
 *
 * 左侧聚合星评（总均分 + 评价总数 + 星条），右侧 3 条精选评价卡（评分/引文/作者/商品）。
 * 高客单珠宝转化标配的社会证明；沿用 Blog/BestSellers 编辑风（ivory 底、serif、金色点缀）。
 * 接后端后把 SUMMARY/MOCK_REVIEWS 换成 context/props 下发即可，渲染不变。
 */
"use client";
import React from "react";
import styles from "./index.module.scss";
import { StarIcon, StarActiveIcon } from "@/components/Icon";

const SUMMARY = { average: 4.9, count: 2847 };

const MOCK_REVIEWS = [
  {
    score: 5,
    quote:
      "The ring exceeded every expectation. The lab-grown diamond is absolutely flawless and the craftsmanship is impeccable. My fiancée was speechless.",
    author: "Marcus T.",
    product: "Round Solitaire Engagement Ring",
    verified: true,
  },
  {
    score: 5,
    quote:
      "I did months of research before buying. Same brilliance as a mined diamond at a fraction of the price, and I feel good about the ethics. Zero regrets.",
    author: "Elena R.",
    product: "Oval Halo Diamond Ring",
    verified: true,
  },
  {
    score: 5,
    quote:
      "From the certification to the packaging, everything felt premium. Customer service helped me pick the perfect setting. Truly a five-star experience.",
    author: "Priya S.",
    product: "Emerald Cut Three-Stone Ring",
    verified: true,
  },
];

// 星条覆盖法（复刻商品卡，宽 90px）
function Stars({ score, width = 90 }) {
  const unit = width / 5;
  return (
    <div className={styles.stars} style={{ width, height: unit }}>
      <div className={styles.starsBase}>
        <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
      </div>
      <div className={styles.starsActive} style={{ width: unit * score }}>
        <StarActiveIcon /><StarActiveIcon /><StarActiveIcon /><StarActiveIcon /><StarActiveIcon />
      </div>
    </div>
  );
}

export default function ReviewsModule({ summary, reviews, LANG }) {
  const agg = summary || SUMMARY;
  const list = Array.isArray(reviews) && reviews.length ? reviews : MOCK_REVIEWS;
  if (!list.length) return null;

  return (
    <section className={styles.module} aria-label="Customer reviews">
      <div className={styles.inner}>
        {/* 聚合摘要 */}
        <div className={styles.summary}>
          <span className={styles.kicker}>{LANG?.["home.reviews.kicker"] || "Loved by Thousands"}</span>
          <div className={styles.avgRow}>
            <span className={styles.avg}>{agg.average.toFixed(1)}</span>
            <Stars score={agg.average} width={110} />
          </div>
          <p className={styles.count}>
            {(LANG?.["home.reviews.count"] || "Based on ${num} verified reviews").replace(
              "${num}",
              new Intl.NumberFormat("en").format(agg.count)
            )}
          </p>
        </div>

        {/* 精选评价卡 */}
        <div className={styles.grid}>
          {list.slice(0, 3).map((r, i) => (
            <figure className={styles.card} key={i}>
              <Stars score={r.score} width={90} />
              <blockquote className={styles.quote}>{r.quote}</blockquote>
              <figcaption className={styles.meta}>
                <span className={styles.author}>
                  {r.author}
                  {r.verified ? (
                    <span className={styles.verified}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {LANG?.["home.reviews.verified"] || "Verified"}
                    </span>
                  ) : null}
                </span>
                {r.product ? <span className={styles.product}>{r.product}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
