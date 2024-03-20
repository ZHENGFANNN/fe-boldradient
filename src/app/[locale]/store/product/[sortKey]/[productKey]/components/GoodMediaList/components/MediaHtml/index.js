import Image from "@/components/Image";
import styles from "./index.module.scss";
import qs from "qs";
import React from "react";

export default function MediaHtml({ htmlInfo }) {
  return (
    <div className={styles.media_container}>
      <div dangerouslySetInnerHTML={{ __html: htmlInfo.description }} />
    </div>
  );
}
