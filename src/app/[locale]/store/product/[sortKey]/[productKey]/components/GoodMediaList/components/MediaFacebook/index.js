import styles from "./index.module.scss";
export default function MediaYoutube({ facebookInfo }) {
  return (
    <div className={styles.media_container}>
      <div className={styles.media_item}>
        <div className={styles.media_description}>
          {facebookInfo.title ? <h3>{facebookInfo.title}</h3> : null}
          {facebookInfo.description ? <p>{facebookInfo.description}</p> : null}
        </div>
        <iframe
          src={`https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fsslfly%2Fvideos%2F${facebookInfo.media_code}%2F&t=0`}
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        ></iframe>
      </div>
    </div>
  );
}
