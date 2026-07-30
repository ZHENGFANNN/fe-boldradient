"use client";

import React from "react";
import ErrorIcon from "@/components/Icon/ErrorIcon";
import styles from "../index.module.scss";

// 终态提示卡片：红色 ErrorIcon + 加粗标题 + 可选原因。
// 已取消 / 已拒绝 共用同款白卡样式，仅标题与原因文案不同（title 未传时回落到「Service Cancelled」）。
const CancelledBanner = React.memo(function CancelledBanner({ title, reason, LANG, T }) {
  return (
    <div className={styles.cancelled_card}>
      <div className={styles.cancelled_body}>
        <span className={styles.cancelled_icon}>
          <ErrorIcon width={24} height={24} />
        </span>
        <div className={styles.cancelled_text}>
          <b>
            {title ||
              T(
                LANG,
                "user.account.after_sale.status.cancelled",
                "Service Cancelled"
              )}
          </b>
          {reason ? (
            <span className={styles.cancelled_reason}>{reason}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
});

export default CancelledBanner;
