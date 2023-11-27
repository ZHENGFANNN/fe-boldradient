import styles from "./index.module.scss";
export default function MediaVideo({ videoInfo }) {
  return (
    <div className={styles.media_container}>
      <div className={styles.media_item}>
        <div className={styles.media_description}>
          {videoInfo.title ? <h3>{videoInfo.title}</h3> : null}
          {videoInfo.description ? <p>{videoInfo.description}</p> : null}
        </div>
        <video
          muted
          autoPlay
          loop
          src={videoInfo.video_src}
          poster={videoInfo.poster_src}
        />
      </div>
    </div>
  );
}
