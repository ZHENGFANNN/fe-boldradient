"use client";

import React from "react";
import Cookies from "js-cookie";
import ProductContext from "../../ProductContext";
import { applyProductPricing, pickCombo } from "@/utils/productPricing";
import { loadProductPricing } from "../../actions";

function readCookieArea(fallback = "us") {
  return Cookies.get("area") || fallback;
}

/**
 * area cookie 与 ISR 默认地区不一致时，通过 Server Action 读取 use cache 定价缓存。
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
  const baseProductRef = React.useRef(baseProductInfo);
  const loadedAreaRef = React.useRef(null);
  const productSlugRef = React.useRef(`${sortKey}/${productKey}`);
  const requestIdRef = React.useRef(0);

  React.useEffect(() => {
    comboKeyRef.current = productCurCombo?.key;
  }, [productCurCombo?.key]);

  React.useEffect(() => {
    baseProductRef.current = baseProductInfo;
  }, [baseProductInfo]);

  React.useEffect(() => {
    const slug = `${sortKey}/${productKey}`;
    if (productSlugRef.current !== slug) {
      productSlugRef.current = slug;
      loadedAreaRef.current = null;
      requestIdRef.current += 1;
    }
  }, [sortKey, productKey]);

  const loadPricing = React.useCallback(
    async (currentArea, requestId) => {
      const base = baseProductRef.current;
      if (!base?.key) return;

      setPricingState({ pricingLoading: true, pricingResolved: false });

      try {
        const pricing = await loadProductPricing({
          sortKey,
          productKey,
          area: currentArea,
          language: locale,
        });
        if (requestId !== requestIdRef.current) return;

        const merged = applyProductPricing(base, pricing);
        const nextCombo = pickCombo(merged.comboList, comboKeyRef.current);

        loadedAreaRef.current = currentArea;
        setPricingState({
          pricingLoading: false,
          pricingResolved: true,
          productInfo: merged,
          productCurCombo: nextCombo,
        });
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        console.error("ProductPricingLoader:", err?.message);
        setPricingState({ pricingLoading: false, pricingResolved: true });
      }
    },
    [locale, productKey, setPricingState, sortKey]
  );

  React.useLayoutEffect(() => {
    const base = baseProductRef.current;
    if (!base?.key) return;

    const currentArea = readCookieArea(area || serverArea);
    if (currentArea === serverArea) {
      loadedAreaRef.current = serverArea;
      return;
    }
    if (loadedAreaRef.current === currentArea) {
      return;
    }

    const requestId = ++requestIdRef.current;
    loadPricing(currentArea, requestId);
  }, [area, loadPricing, serverArea]);

  return null;
}
