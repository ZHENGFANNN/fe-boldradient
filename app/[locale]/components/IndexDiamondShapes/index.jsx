/** @format */
"use client";

/**
 * IndexDiamondShapes —— 首页「按形状选购钻石」板块（参考 brilliantearth.com）。
 * 左列：板块标题 +（可选）主推戒指图；右列：10 种钻石形状网格。
 * 每个形状 tile 链接到主分类页并带 ?shape=<slug> query（分类页已 SSG，
 * query 向后兼容——真正按形状过滤需后端加 facet，属后续项）。
 *
 * 纯静态可 SSG：数据（形状集合 + 内联 SVG 图标）来自 ./shapes，
 * 文案走 home.* i18n（带英文 fallback，无需改后端即可显示）。
 * 无可用分类时 tile 退化为不可点（无 href），不产生 404。
 */
import React from "react";
import Link from "next/link";
import { IndexContent } from "../IndexContext";
import { fillOssImage } from "@/utils";
import styles from "./index.module.scss";
import { SHAPES } from "./shapes";

export default function IndexDiamondShapes({ featuredImage } = {}) {
  const ctx = React.useContext(IndexContent) || {};
  const { LANG = {}, goodsSortList = [] } = ctx;

  // 主分类：取首个 enabled 分类下首个商品的 sort_key 作为形状 tile 的落地页
  // （/product/[sortKey] 路由按商品 sort_key 定址，与 IndexProductList 的 href 对齐；
  //  分类对象顶层的 .key 是 sortInfo.key，未必等于路由 sortKey，故读 goodList）。
  // 无可用分类时不加 href，tile 退化为不可点，不产生 404。
  const baseSortKey = Array.isArray(goodsSortList)
    ? goodsSortList[0]?.goodList?.[0]?.sort_key
    : undefined;

  const title = LANG["home.shape_title"] || "Shop Diamonds by Shape";

  const hrefFor = (slug) =>
    baseSortKey ? `/product/${baseSortKey}?shape=${slug}` : undefined;

  const labelFor = (shape) =>
    LANG[`home.shape_${shape.slug}`] || shape.label;

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <h2 className={styles.title}>{title}</h2>
          {featuredImage ? (
            <div className={styles.featured}>
              <img
                className={styles.featuredImg}
                src={fillOssImage(featuredImage)}
                alt={title}
                loading="lazy"
              />
            </div>
          ) : null}
        </div>

        <ul className={styles.grid}>
          {SHAPES.map((shape) => {
            const href = hrefFor(shape.slug);
            const label = labelFor(shape);
            const body = (
              <>
                <span className={styles.icon}>
                  <img
                    className={styles.iconImg}
                    src={`/diamond-shapes/${shape.slug}.png`}
                    alt={label}
                    width={120}
                    height={120}
                    loading="lazy"
                  />
                </span>
                <span className={styles.label}>{label}</span>
              </>
            );
            return (
              <li key={shape.slug} className={styles.cell}>
                {href ? (
                  <Link href={href} className={styles.tile} aria-label={label}>
                    {body}
                  </Link>
                ) : (
                  <span className={styles.tile} aria-label={label}>
                    {body}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
