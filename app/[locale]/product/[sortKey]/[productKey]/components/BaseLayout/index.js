"use client";
import React from "react";
import Cookies from "js-cookie";
import ProductContext from "../../ProductContext";
import GlobalContext from "@/[locale]/context";
import { useRouter } from "next/navigation";
import ProductPricingLoader from "../ProductPricingLoader";
import { pickCombo } from "@/utils/productPricing";

function readCookieArea(fallback = "us") {
  if (typeof document === "undefined") return fallback;
  return Cookies.get("area") || fallback;
}

export default function Layout({
  children,
  locale,
  sortKey,
  productKey,
  area: areaProp,
  serverArea = "us",
  LANG,
  CONFIG,
  isMobile,
  baseProductInfo,
  productInfo: initialProductInfo,
}) {
  const router = useRouter();
  const { goodDiscountFestival: globalFestival } =
    React.useContext(GlobalContext) || {};

  const initialProductRef = React.useRef(initialProductInfo);

  React.useEffect(() => {
    initialProductRef.current = initialProductInfo;
  }, [initialProductInfo]);

  React.useEffect(() => {
    if (!initialProductInfo && !baseProductInfo) {
      router.push("/not-found");
    }
  }, [baseProductInfo, initialProductInfo, router]);

  const [area, setArea] = React.useState(areaProp || "us");
  const [lazyLoading, setLazyLoading] = React.useState(true);
  // 默认不展示 ISR 美元价，等客户端确认 cookie 地区后再显示当地价格。
  const [pricingLoading, setPricingLoading] = React.useState(true);
  const [pricingResolved, setPricingResolved] = React.useState(false);
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
          desc: item.options[0].desc,
        });
      }
    });
    return formateList;
  });
  const [productShowType, setProductShowType] = React.useState("image");

  React.useLayoutEffect(() => {
    const cookieArea = readCookieArea(serverArea);
    if (cookieArea !== area) {
      setArea(cookieArea);
    }
    if (cookieArea === serverArea) {
      setPricingLoading(false);
      setPricingResolved(true);
    } else {
      setPricingLoading(true);
      setPricingResolved(false);
    }
  }, [area, serverArea]);

  // 仅导航到另一商品时重置；初始 slug 写入 ref，避免首 mount 用美元 seed 覆盖 cn 价。
  const productSlugRef = React.useRef(`${sortKey}/${productKey}`);
  React.useEffect(() => {
    const slug = `${sortKey}/${productKey}`;
    if (productSlugRef.current === slug) return;
    productSlugRef.current = slug;

    const seed = initialProductRef.current;
    setProductInfo(seed);
    setProductCurCombo(pickCombo(seed?.comboList));

    const cookieArea = readCookieArea(serverArea);
    if (cookieArea === serverArea) {
      setPricingLoading(false);
      setPricingResolved(true);
    } else {
      setPricingLoading(true);
      setPricingResolved(false);
    }
  }, [sortKey, productKey, serverArea]);

  const setPricingState = React.useCallback((patch) => {
    if (patch.pricingLoading !== undefined) {
      setPricingLoading(patch.pricingLoading);
    }
    if (patch.pricingResolved !== undefined) {
      setPricingResolved(patch.pricingResolved);
    }
    if (patch.productInfo !== undefined) {
      setProductInfo(patch.productInfo);
    }
    if (patch.productCurCombo !== undefined) {
      setProductCurCombo(patch.productCurCombo);
    }
  }, []);

  React.useEffect(() => {
    import("jquery").then(({ default: $ }) => {
      window.$ = $;
      setLazyLoading(false);
    });
  }, []);

  if (!initialProductInfo && !baseProductInfo) return null;

  const showPriceSkeleton = pricingLoading || !pricingResolved;

  return (
    <ProductContext.Provider
      value={{
        locale,
        area,
        LANG,
        CONFIG,
        isMobile,
        productInfo,
        goodDiscountFestival: globalFestival,
        pricingLoading,
        pricingResolved,
        showPriceSkeleton,
        lazyLoading,
        setLazyLoading,
        setPricingState,
        productNum,
        setProductNum,
        productCurCombo,
        setProductCurCombo,
        productOptions,
        removeProductOptions: (name) => {
          setProductOptions((prev) => prev.filter((item) => item.name !== name));
        },
        setProductOptions: (newItem) => {
          setProductOptions((prev) => {
            const findIndex = prev.findIndex((item) => item.name === newItem.name);
            if (findIndex > -1) {
              const next = [...prev];
              next[findIndex] = newItem;
              return next;
            }
            return [...prev, newItem];
          });
        },
        productShowType,
        setProductShowType,
      }}
    >
      <ProductPricingLoader
        sortKey={sortKey}
        productKey={productKey}
        locale={locale}
        baseProductInfo={baseProductInfo}
        serverArea={serverArea}
      />
      {children}
    </ProductContext.Provider>
  );
}
