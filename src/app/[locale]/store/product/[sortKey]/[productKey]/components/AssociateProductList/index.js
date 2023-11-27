"use client";

import React from "react";
import $ from "jquery";
import PcProductList from "./index.pc";
import MobProductList from "./index.mobile";

export default function ProductList({ products, title }) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    setIsMobile($(window).width() < 1250);
    $(window).on("resize", () => {
      if ($(window).width() < 1250) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    });
  }, []);
  return (
    <>
      {!isMobile ? (
        <PcProductList products={products} title={title} />
      ) : (
        <MobProductList products={products} title={title} />
      )}
    </>
  );
}
