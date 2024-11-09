import Link from "next/link";

export default function ({ item, styles, LANG }) {
  return (
    <Link
      scroll={true}
      href={item.content}
      className={styles.content_row_description + " " + styles.blue}
    >
      {LANG["www.company_contact.click_view"]}
    </Link>
  );
}
