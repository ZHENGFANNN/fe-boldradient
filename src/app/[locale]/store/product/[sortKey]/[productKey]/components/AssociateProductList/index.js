"use client";

import React from "react";
import PcProductList from "./index.pc";
import MobProductList from "./index.mobile";
import ProductContext from "../../productContext";

export default function AssociateProductList({
  products,
  title,
  goodDiscountFestival,
  isMobile,
  LANG,
}) {
  const [device, setDevice] = React.useState(isMobile ? "mob" : "pc");
  const { lazyLoading } = React.useContext(ProductContext);
  React.useEffect(() => {
    if (!lazyLoading) {
      $(window).on("resize", () => {
        if ($(window).width() < 1250) {
          setDevice("mob");
        } else {
          setDevice("pc");
        }
      });
    }
  }, [lazyLoading]);
  return (
    <>
      {device === "pc" ? (
        <PcProductList
          LANG={LANG}
          goodDiscountFestival={goodDiscountFestival}
          products={products}
          title={title}
        />
      ) : (
        <MobProductList
          LANG={LANG}
          goodDiscountFestival={goodDiscountFestival}
          products={products}
          title={title}
        />
      )}
    </>
  );
}
