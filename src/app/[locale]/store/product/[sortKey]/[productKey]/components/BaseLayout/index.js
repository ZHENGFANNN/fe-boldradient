"use client";
import React from "react";
import ProductContext from "../../productContext";
import useProductStore from "../../productStore";

export default function Layout({ children }) {
  const [lazyLoading, setLazyLoading] = React.useState(true);

  const setProductNum = useProductStore((state) => state.setProductNum);
  const setProductOptions = useProductStore((state) => state.setProductOptions);
  const setProductCurCombo = useProductStore(
    (state) => state.setProductCurCombo
  );
  const setProductShowType = useProductStore(
    (state) => state.setProductShowType
  );

  React.useEffect(() => {
    import("jquery").then(({ default: $ }) => {
      window.$ = $;
      setLazyLoading(false);
    });
    return () => {
      // 切换初始化
      setProductNum(1);
      setProductShowType("image");
      setProductCurCombo({ areaInfo: {} });
      setProductOptions(null);
    };
  }, []);

  return (
    <ProductContext.Provider
      value={{
        lazyLoading,
        setLazyLoading,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}
