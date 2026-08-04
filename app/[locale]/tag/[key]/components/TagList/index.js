/** @format */

"use client";

import React from "react";
import Link from "next/link";

import { formatCurrency, fillOssImage } from "@/utils";
import {
  discountedUnitPrice,
  savedUnitAmount,
  pickAutoDiscount,
  formatDiscountLabel,
} from "@/utils/productPricing";
import useArea from "@/hooks/useArea";
import Skeleton from "@/components/Skeleton";
import getProductsOffer from "@/service/product/get-offer";
import { StarIcon, StarActiveIcon } from "@/components/Icon";
// 复用分类页样式（商品网格/卡片/面包屑/标题完全一致，避免重复 SCSS）。
import styles from "../../../../product/[sortKey]/components/CategoryList/index.module.scss";

function pickAreaInfo(pricingItem) {
  if (!pricingItem) return null;
  const combos = Array.isArray(pricingItem.combos) ? pricingItem.combos : [];
  for (const c of combos) {
    if (c?.areaInfo) return c.areaInfo;
  }
  return null;
}

function ReviewRate({ LANG, reviewScore, reviewsNum }) {
  if (!reviewScore) return null;
  return (
    <div className={styles.stars_container}>
      <div className={styles.no_active_stars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>
      <div className={styles.active_stars} style={{ width: 90 * (reviewScore / 5) }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarActiveIcon key={i} />
        ))}
      </div>
      <div className={styles.score}>
        {`( ${LANG?.["home.reviews"]?.replace("${num}", reviewsNum) ?? reviewsNum} )`}
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

function pad2(n) {
  return Math.max(0, n).toString().padStart(2, "0");
}

function CardCountdown({ endsAt }) {
  const [remain, setRemain] = React.useState(0);
  React.useEffect(() => {
    const tick = () => setRemain(Math.max(0, Number(endsAt) - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  if (remain <= 0) return null;
  const seconds = Math.floor(remain / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return (
    <div className={styles.discount_countdown}>
      <span>{pad2(hours)}</span>
      <i>:</i>
      <span>{pad2(minutes)}</span>
      <i>:</i>
      <span>{pad2(secs)}</span>
    </div>
  );
}

function ProductCard({ product, LANG, pricingMap, pricingReady, discountMap }) {
  const areaInfo = pricingReady
    ? pickAreaInfo(pricingMap?.[`${product.sort_key}:${product.key}`])
    : null;
  const autoDiscount = pickAutoDiscount(product, discountMap);
  const savedAmount = autoDiscount ? savedUnitAmount(areaInfo, autoDiscount) : 0;
  const discountedPrice = autoDiscount
    ? discountedUnitPrice(areaInfo, autoDiscount)
    : areaInfo?.product_price;
  return (
    <Link
      scroll={true}
      href={`/product/${product.sort_key}/${product.key}`}
      className={styles.goods_item}
    >
      <div className={styles.image_container} data-scenes={!!product.image_scenes}>
        <img
          className={styles.product_image}
          alt={product.name}
          src={fillOssImage(product.image)}
        />
        {product.image_scenes ? (
          <img
            className={styles.scenes_image}
            alt={product.name}
            src={fillOssImage(product.image_scenes)}
          />
        ) : null}
        {autoDiscount ? (
          <div className={styles.limit_discount_tag}>
            <span className={styles.limit_discount_label}>
              {formatDiscountLabel(autoDiscount, areaInfo, LANG)}
            </span>
            <CardCountdown endsAt={Number(autoDiscount.ends_at)} />
          </div>
        ) : null}
      </div>
      <div className={styles.content_container}>
        <ReviewRate
          LANG={LANG}
          reviewScore={product.reviewScore}
          reviewsNum={product.reviewsNum}
        />
        <h3 className={styles.product_name}>{product.name}</h3>
        {!pricingReady ? (
          <div className={styles.product_price_container}>
            <Skeleton variant="rect" width={80} height={16} />
          </div>
        ) : !areaInfo?.product_price ? (
          <div className={styles.product_stock_container}>
            {LANG?.["home.no_stock"] ?? "Out of stock"}
          </div>
        ) : autoDiscount && savedAmount > 0 ? (
          <div className={styles.product_price_container}>
            <div>{`${areaInfo?.currency_symbol}${formatCurrency(
              discountedPrice,
              areaInfo?.currency_unit
            )}`}</div>
            <div>{`${areaInfo?.currency_symbol}${formatCurrency(
              areaInfo?.product_price,
              areaInfo?.currency_unit
            )}`}</div>
          </div>
        ) : (
          <div className={styles.product_price_container}>
            <div>{`${areaInfo?.currency_symbol}${formatCurrency(
              areaInfo?.product_price,
              areaInfo?.currency_unit
            )}`}</div>
          </div>
        )}
      </div>
    </Link>
  );
}

function makeT(LANG) {
  return (key, fallback) => LANG?.[key] ?? fallback;
}

// PLACEHOLDER_TAGLIST_MAIN
export default function TagList({ tag, goodList, locale, LANG }) {
  const t = makeT(LANG);

  const { area, areaReady } = useArea();
  const [pricingMap, setPricingMap] = React.useState(null);
  const pricingReady = pricingMap !== null;
  const [discountMap, setDiscountMap] = React.useState({});
  const [visible, setVisible] = React.useState(PAGE_SIZE);

  const allKeys = React.useMemo(
    () =>
      goodList
        .filter((p) => p.sort_key && p.key)
        .map((p) => ({ sortKey: p.sort_key, productKey: p.key })),
    [goodList]
  );

  // 批量取「价格 + 折扣」，与分类页同一链路（getProductsOffer）。
  React.useEffect(() => {
    if (!areaReady) return;
    let cancelled = false;
    const effectiveArea = area || "us";
    getProductsOffer({ area: effectiveArea, locale, keys: allKeys }).then(
      (data) => {
        if (cancelled) return;
        const pMap = {};
        const dMap = {};
        (data?.list || []).forEach((item) => {
          pMap[`${item.sortKey}:${item.productKey}`] = item;
          if (item.discount) dMap[item.productKey] = item.discount;
        });
        setPricingMap(pMap);
        setDiscountMap(dMap);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [areaReady, area, locale, allKeys]);

  const shown = goodList.slice(0, visible);
  const hasMore = visible < goodList.length;

  return (
    <div className={styles.container}>
      {/* 面包屑 */}
      <nav className={styles.breadcrumb} aria-label="breadcrumb">
        <Link href="/">{t("common.nav.home", "Home")}</Link>
        <span className={styles.sep}>/</span>
        <span className={styles.current}>{tag.name}</span>
      </nav>

      {/* 标签标题（复用分类页标题样式） */}
      <header className={styles.collection_header}>
        <h1 className={styles.collection_title}>{tag.name}</h1>
      </header>

      {/* 商品网格 / 空状态 */}
      {shown.length > 0 ? (
        <section className={styles.goods_container}>
          {shown.map((product) => (
            <ProductCard
              key={product.key}
              product={product}
              LANG={LANG}
              pricingMap={pricingMap}
              pricingReady={pricingReady}
              discountMap={discountMap}
            />
          ))}
        </section>
      ) : (
        <div className={styles.empty_state}>
          <div className={styles.empty_icon} aria-hidden="true">
            ✦
          </div>
          <div className={styles.empty_title}>
            {t("product.category.empty_title", "No products found")}
          </div>
        </div>
      )}

      {/* 加载更多 / 已全部加载 */}
      {shown.length > 0 ? (
        <div className={styles.load_more_bar}>
          {hasMore ? (
            <button
              type="button"
              className={styles.load_more_btn}
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
            >
              {t("product.category.load_more", "Load more")}
            </button>
          ) : pricingReady ? (
            <div className={styles.all_loaded}>
              {t("product.category.all_loaded", "All products loaded")}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
