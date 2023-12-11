"use client";
import React from "react";
import ProductContext from "../../productContext";
import useProductStore from "../../productStore";

export default function Layout({ children }) {
  const [lazyLoading, setLazyLoading] = React.useState(true);

  const setProductNum = useProductStore((state) => state.setProductNum);
  const setProductShowType = useProductStore(
    (state) => state.setProductShowType
  );

  React.useEffect(() => {
    // 切换初始化
    setProductNum(1);
    setProductShowType("image");

    import("jquery").then(({ default: $ }) => {
      window.$ = $;
      setLazyLoading(false);
    });
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
