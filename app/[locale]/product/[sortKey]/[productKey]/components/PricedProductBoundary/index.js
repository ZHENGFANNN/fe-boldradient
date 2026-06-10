/** @format */

import readProductArea from "@/utils/readProductArea";
import getPricedProduct from "@/utils/getConfigData/getPricedProduct";
import HydratePricedProduct from "./HydratePricedProduct";

/**
 * 按 cookie area 拉取 use cache 定价并注入 ProductContext。
 * 由外层 Suspense 提供骨架，不阻塞首屏其余内容。
 */
export default async function PricedProductBoundary({
  locale,
  sortKey,
  productKey,
  children,
}) {
  const area = await readProductArea();
  const pricedProductInfo = await getPricedProduct({
    locale,
    sortKey,
    productKey,
    area,
  });

  if (!pricedProductInfo) {
    return children;
  }

  return (
    <HydratePricedProduct pricedProductInfo={pricedProductInfo}>
      {children}
    </HydratePricedProduct>
  );
}
