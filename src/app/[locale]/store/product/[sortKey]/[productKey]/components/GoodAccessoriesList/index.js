// 参数组件
import styles from "./index.module.scss";
export default function Accessories({ configList = [], LANG = () => {} }) {
  if (configList.length < 1) return null;
  return (
    <section className={`${styles.accessories}`} id="productAccessories">
      <div className={styles.accessories_container}>
        <h2>{LANG["store.product.specifiche"]}</h2>
        <div className={styles.accessories_item}>
          <ul>
            {configList
              .slice(0, Math.ceil(configList.length / 2))
              .map((item, index) => {
                return (
                  <li key={index}>
                    <h4>{item.key}</h4>
                    <p>{item.value}</p>
                  </li>
                );
              })}
          </ul>
          <ul>
            {configList
              .slice(Math.ceil(configList.length / 2), configList.length)
              .map((item, index) => {
                return (
                  <li key={index}>
                    <h4>{item.key}</h4>
                    <p>{item.value}</p>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </section>
  );
}
