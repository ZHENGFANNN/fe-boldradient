/** @format */

import styles from "./index.module.scss";

export default function ComboListSkeleton() {
  return (
    <div className={styles.container} aria-hidden="true">
      <div className={styles.price_skeleton} style={{ width: 120, height: 21 }} />
      <div className={styles.list} style={{ marginTop: 16 }}>
        <div className={styles.price_skeleton} style={{ width: "100%", height: 72 }} />
      </div>
    </div>
  );
}
