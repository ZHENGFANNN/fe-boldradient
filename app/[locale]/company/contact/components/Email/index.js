export default function ({ item, styles }) {
  return (
    <a
      href={"mailto:" + item.content}
      className={styles.content_row_description + " " + styles.blue}
    >
      {item.content}
    </a>
  );
}
