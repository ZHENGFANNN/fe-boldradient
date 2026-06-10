import React, { Suspense } from "react";

import GoodMediaDisplay from "./GoodMediaDisplay";
import Countdown from "./Countdown";
import GoodMediaTabs from "./GoodMediaTabs";
import PricedProductBoundary from "../PricedProductBoundary";

export default function GoodMainLeft({ locale, sortKey, productKey }) {
  return (
    <>
      <GoodMediaDisplay />
      <Suspense fallback={null}>
        <PricedProductBoundary
          locale={locale}
          sortKey={sortKey}
          productKey={productKey}
        >
          <Countdown />
        </PricedProductBoundary>
      </Suspense>
      <GoodMediaTabs />
    </>
  );
}
