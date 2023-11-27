// 参数组件
import styles from "./index.module.scss";
import React from "react";

import MediaVideo from "./components/MediaVideo";
import MediaYoutube from "./components/MediaYoutube";
import MediaFacebook from "./components/MediaFacebook";
import MediaImage from "./components/MediaImage";

export default function GoodMediaList({ configList = [] }) {
  if (configList.length < 1) return null;
  return (
    <section className={`${styles.media}`} id="productMedia">
      {configList.map((item, index) => {
        if (item.type === "video") {
          return <MediaVideo key={index} videoInfo={item} />;
        } else if (item.type === "youtube") {
          return <MediaYoutube key={index} youtubeInfo={item} />;
        } else if (item.type === "facebook") {
          return <MediaFacebook key={index} facebookInfo={item} />;
        } else if (item.type === "image") {
          return <MediaImage key={index} imageInfo={item} />;
        }
      })}
    </section>
  );
}
