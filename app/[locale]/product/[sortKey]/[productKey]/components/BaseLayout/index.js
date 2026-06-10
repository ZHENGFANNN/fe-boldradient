"use client";
import React from "react";
import ProductContext from "../../ProductContext";
import GlobalContext from "@/[locale]/context";
import { pickCombo } from "@/utils/productPricing";

export default function BaseLayout({
  children,
  locale,
  sortKey,
  productKey,
  LANG,
  CONFIG,
  isMobile,
  baseProductInfo,
  productInfo: initialProductInfo
}) {
  const { goodDiscountFestival: globalFestival } =
    React.useContext(GlobalContext) || {};

  const initialProductRef = React.useRef(initialProductInfo);

  React.useEffect(() => {
    initialProductRef.current = initialProductInfo;
  }, [initialProductInfo]);

  const [lazyLoading, setLazyLoading] = React.useState(true);
  const [productInfo, setProductInfo] = React.useState(initialProductInfo);
  const [productNum, setProductNum] = React.useState(1);
  const [productCurCombo, setProductCurCombo] = React.useState(() =>
    pickCombo(initialProductInfo?.comboList)
  );
  const [productOptions, setProductOptions] = React.useState(() => {
    const typeList = Array.isArray(initialProductInfo?.typeList)
      ? initialProductInfo.typeList
      : [];
    const formateList = [];
    const curComboKey = pickCombo(initialProductInfo?.comboList)?.key;
    typeList.forEach((item) => {
      if (!Array.isArray(item.options) || !item.options[0]) return;
      if (
        !item.associated ||
        (item.combo_keys && item.combo_keys.includes(curComboKey))
      ) {
        formateList.push({
          name: item.title,
          value: item.options[0].title,
          desc: item.options[0].desc
        });
      }
    });
    return formateList;
  });
  const [productShowType, setProductShowType] = React.useState("image");

  const productSlugRef = React.useRef(`${sortKey}/${productKey}`);
  React.useEffect(() => {
    const slug = `${sortKey}/${productKey}`;
    if (productSlugRef.current === slug) return;
    productSlugRef.current = slug;

    const seed = initialProductRef.current;
    setProductInfo(seed);
    setProductCurCombo(pickCombo(seed?.comboList));
  }, [sortKey, productKey]);

  const removeProductOptions = React.useCallback((name) => {
    setProductOptions((prev) => prev.filter((item) => item.name !== name));
  }, []);

  const upsertProductOption = React.useCallback((newItem) => {
    setProductOptions((prev) => {
      const findIndex = prev.findIndex((item) => item.name === newItem.name);
      if (findIndex > -1) {
        const next = [...prev];
        next[findIndex] = newItem;
        return next;
      }
      return [...prev, newItem];
    });
  }, []);

  React.useEffect(() => {
    import("jquery").then(({ default: $ }) => {
      window.$ = $;
      setLazyLoading(false);
    });
  }, []);

  return (
    <ProductContext.Provider
      value={{
        locale,
        LANG,
        CONFIG,
        isMobile,
        productInfo,
        goodDiscountFestival: globalFestival,
        lazyLoading,
        setLazyLoading,
        productNum,
        setProductNum,
        productCurCombo,
        setProductCurCombo,
        productOptions,
        removeProductOptions,
        setProductOptions: upsertProductOption,
        productShowType,
        setProductShowType
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}
