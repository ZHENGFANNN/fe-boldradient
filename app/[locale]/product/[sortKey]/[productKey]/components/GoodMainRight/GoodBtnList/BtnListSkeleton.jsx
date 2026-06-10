/** @format */

import styles from "./index.module.scss";

export default function BtnListSkeleton() {
  return (
    <div className={styles.container} aria-hidden="true">
      <div className={styles.btn_loading} />
    </div>
  );
}
