"use client";

import React from "react";
import ProductContext from "../../ProductContext";
import { pickCombo } from "@/utils/productPricing";

/**
 * 用嵌套 Provider 同步注入定价数据（SSR/CSR 一致），避免 useLayoutEffect 首屏无 areaInfo。
 */
export default function HydratePricedProduct({ pricedProductInfo, children }) {
  const parent = React.useContext(ProductContext);
  if (!parent || !pricedProductInfo) {
    return children;
  }

  const productCurCombo = pickCombo(
    pricedProductInfo.comboList,
    parent.productCurCombo?.key
  );

  return (
    <ProductContext.Provider
      value={{
        ...parent,
        productInfo: pricedProductInfo,
        productCurCombo,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}
