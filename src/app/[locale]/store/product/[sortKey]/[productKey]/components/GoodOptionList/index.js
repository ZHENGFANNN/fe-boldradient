"use client";
import React from "react";
import styles from "./index.module.scss";
import useProductStore from "../../productStore";

export default function GoodType({
  title = "",
  options = [],
  type,
  defaultActive,
}) {
  const setProductOptions = useProductStore((state) => state.setProductOptions);
  const [active, setActive] = React.useState(() => {
    return defaultActive || 0;
  });

  const onChange = React.useCallback((item) => {
    setProductOptions((state) => {
      let existItem = false;
      const list = state.map((stateItem) => {
        if (stateItem.name === item.name) {
          existItem = true;
          return item;
        } else {
          return stateItem;
        }
      });
      if (!existItem) list.push(item);
      return list;
    });
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
