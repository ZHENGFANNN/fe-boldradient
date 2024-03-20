"use client";
import React from "react";
import styles from "./index.module.scss";
import useProductStore from "../../productStore";

export default function GoodOptionList({
  title = "",
  options = [],
  type,
  defaultActive,
}) {
  const setProductOptions = useProductStore((state) => state.setProductOptions);
  const productOptions = useProductStore((state) => state.productOptions);
  const [active, setActive] = React.useState(() => {
    return defaultActive || 0;
  });

  const onChange = React.useCallback((item) => {
    setProductOptions(item);
  });

  React.useEffect(() => {
    onChange({ name: title, value: options[0].title });
  }, []);
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      <div className={styles.list}>
        {options.map((item, index) => {
          if (type === "text") {
            return (
              <div
                key={index}
                className={`
                    ${styles.list_item}
                    ${active === index ? styles.active : ""}
                `}
                onClick={() => {
                  setActive(index);
                  onChange({
                    name: title,
                    value: item.title,
                  });
                }}
              >
                {item.title}
              </div>
            );
          } else {
            return (
              <div
                key={index}
                className={`
                    ${styles.list_item_image}
                    ${active === index ? styles.active : ""}
                `}
                onClick={() => {
                  setActive(index);
                  onChange({
                    name: title,
                    value: item.title,
                  });
                }}
              >
                <img alt={item.title} src={item.image} />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
