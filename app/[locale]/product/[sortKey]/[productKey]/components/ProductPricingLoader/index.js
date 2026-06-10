"use client";

import React from "react";
import Cookies from "js-cookie";
import ProductContext from "../../ProductContext";
import { applyProductPricing, pickCombo } from "@/utils/productPricing";
import { loadProductPricing } from "../../actions";

/**
 * area cookie 与 ISR 默认地区不一致时，通过 Server Action 读取 use cache 定价缓存。
 * 默认地区价格在 layout 服务端已合并，首屏 pricingLoading=false。
 */
export default function ProductPricingLoader({
  sortKey,
  productKey,
  locale,
  baseProductInfo,
  serverArea = "us",
}) {
  const ctx = React.useContext(ProductContext);
  if (!ctx) return null;

  const { area, setPricingState, productCurCombo } = ctx;

  const comboKeyRef = React.useRef(productCurCombo?.key);

  React.useEffect(() => {
    comboKeyRef.current = productCurCombo?.key;
  }, [productCurCombo?.key]);

  React.useEffect(() => {
    if (!baseProductInfo?.key) return;

    const currentArea = area || Cookies.get("area") || "us";
    if (currentArea === serverArea) {
      return;
    }

    let cancelled = false;
    setPricingState({ pricingLoading: true });

    (async () => {
      try {
        const pricing = await loadProductPricing({
          sortKey,
          productKey,
          area: currentArea,
          language: locale,
        });
        if (cancelled) return;

        const merged = applyProductPricing(baseProductInfo, pricing);
        const nextCombo = pickCombo(merged.comboList, comboKeyRef.current);

        setPricingState({
          pricingLoading: false,
          goodDiscountFestival: !!pricing?.festivalDiscount,
          productInfo: merged,
          productCurCombo: nextCombo,
        });
      } catch (err) {
        if (cancelled) return;
        console.error("ProductPricingLoader:", err?.message);
        setPricingState({ pricingLoading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    area,
    baseProductInfo,
    locale,
    productKey,
    serverArea,
    setPricingState,
    sortKey,
  ]);

  return null;
}
