import styles from "./index.module.scss";

export default function FormItem({ children }) {
  return (
    <div className={styles.form_item_container}>
      {children.map((item, index) => {
        return (
          <div className={styles.form_item} key={index}>
            {item}
          </div>
        );
      })}
    </div>
  );
}
