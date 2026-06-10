import React, { Suspense } from "react";

import GoodMainText from "./GoodMainText";
import GoodPrice from "./GoodPrice";
import GoodReviewsRate from "./GoodReviewsRate";
import GoodComboList from "./GoodComboList";
import GoodOptionList from "./GoodOptionList";
import GoodNumber from "./GoodNumber";
import GoodBtnList from "./GoodBtnList";
import GoodContent from "./GoodContent";
import GoodGuarantee from "./GoodGuarantee";
import PricedProductBoundary from "../PricedProductBoundary";
import PriceSkeleton from "./GoodPrice/PriceSkeleton";
import ComboListSkeleton from "./GoodComboList/ComboListSkeleton";
import BtnListSkeleton from "./GoodBtnList/BtnListSkeleton";
import styles from "./index.module.scss";

export default function GoodMainRight({ locale, sortKey, productKey }) {
  const pricingProps = { locale, sortKey, productKey };

  return (
    <div>
      <GoodMainText />
      <Suspense fallback={<PriceSkeleton />}>
        <PricedProductBoundary {...pricingProps}>
          <GoodPrice />
        </PricedProductBoundary>
      </Suspense>
      <GoodReviewsRate />
      <div className={styles.line}></div>
      <Suspense fallback={<ComboListSkeleton />}>
        <PricedProductBoundary {...pricingProps}>
          <GoodComboList />
        </PricedProductBoundary>
      </Suspense>
      <GoodOptionList />
      <GoodNumber />
      <Suspense fallback={<BtnListSkeleton />}>
        <PricedProductBoundary {...pricingProps}>
          <GoodBtnList />
        </PricedProductBoundary>
      </Suspense>
      <GoodContent />
      <GoodGuarantee />
    </div>
  );
}
