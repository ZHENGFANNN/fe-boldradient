"use client";
import styles from "../../page.module.scss";
import React from "react";
import useProductStore from "../../productStore";

export default function GoodNumber({ LANG }) {
  const setProductNum = useProductStore((state) => state.setProductNum);
  const productNum = useProductStore((state) => state.productNum);
  React.useEffect(() => {
    console.log("productNum", productNum);
  }, [productNum]);
  return (
    <div className={styles.product_num}>
      <h3>{LANG["store.product.amount"]}</h3>
      <div className={styles.product_num_operation}>
        <div
          className={styles.product_num_symbol}
          onClick={() => {
            if (productNum < 2) {
              return;
            }
            setProductNum(productNum - 1);
          }}
        >
          -
        </div>
        <input
          className={styles.product_num_text}
          value={productNum}
          type="number"
          onChange={(e) => {
            const number = Number(e.target.value);
            if (number > 99998) setProductNum(99999);
            else if (number < 2) setProductNum(1);
            else setProductNum(number);
          }}
        />
        <div
          className={styles.product_num_symbol}
          onClick={() => {
            if (productNum > 99998) {
              return;
            }
            setProductNum(productNum + 1);
          }}
        >
          +
        </div>
      </div>
    </div>
  );
}
