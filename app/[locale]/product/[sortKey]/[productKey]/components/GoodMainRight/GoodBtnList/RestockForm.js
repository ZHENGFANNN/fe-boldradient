/** @format */

"use client";

import React from "react";
import RestockModal from "./RestockModal";
import styles from "./RestockForm.module.scss";

// 缺货区块（PDP 不可购买时）：直接展示黑色「Notify me」按钮触发到货通知弹窗（去掉 Out of Stock 标）。
// 弹窗内收集邮箱并上报 path/area/locale/combo_key，见 RestockModal。
export default function RestockForm({ LANG, locale, area, comboKey, productName }) {
  const modalRef = React.useRef(null);

  return (
    <div className={styles.restock}>
      <div
        className={styles.notify_btn}
        onClick={() => modalRef.current?.show()}
      >
        {LANG["product.restock.notify_me"] || "Notify me"}
      </div>
      <RestockModal
        ref={modalRef}
        LANG={LANG}
        locale={locale}
        area={area}
        comboKey={comboKey}
        productName={productName}
      />
    </div>
  );
}
