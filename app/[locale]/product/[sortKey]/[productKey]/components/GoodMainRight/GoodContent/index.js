/** @format */

"use client";

import React from "react";
import ProductContext from "../../../ProductContext";
import styles from "./index.module.scss";
import "@/styles/richtext.scss";

export default function GoodContent() {
  const {
    productInfo: { content },
  } = React.useContext(ProductContext);

  const hide = React.useMemo(() => {
    return content?.replace(/<[^>]+>/g, "").trim().length < 1;
  }, [content]);

  if (hide) return null;

  const contentRef = React.useRef();
  React.useEffect(() => {
    if (contentRef.current) {
      const videos = contentRef.current.querySelectorAll("video");
      videos.forEach((video) => {
        console.log("[videos]: ", video);
        video.setAttribute("playsinline", "true");
      });
    }
  }, []);

  return (
    <div className={styles.container} ref={contentRef}>
      <div
        className="wangeditor-rich-text-css"
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      ></div>
    </div>
  );
}
