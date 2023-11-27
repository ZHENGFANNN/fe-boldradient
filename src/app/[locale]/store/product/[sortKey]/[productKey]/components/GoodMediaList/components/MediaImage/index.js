import styles from "./index.module.scss";
export default function MediaVideo({ imageInfo }) {
  return (
    <div className={styles.media_container}>
      <div className={styles.media_item}>
        {imageInfo.title || imageInfo.description ? (
          <div className={styles.media_description}>
            {imageInfo.title ? <h3>{imageInfo.title}</h3> : null}
            {imageInfo.description ? <p>{imageInfo.description}</p> : null}
          </div>
        ) : null}
        <div className={styles.img_container}>
          <img alt={imageInfo.title} src={imageInfo.image_src} />
        </div>
      </div>
    </div>
  );
}
