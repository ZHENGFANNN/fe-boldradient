"use client";
import React from "react";
import styles from "./index.module.scss";
import ProductContext from "../../ProductContext";

function GoodOptionItem({ title = "", options = [], type }) {
  const { setProductOptions, productOptions, productCurCombo } =
    React.useContext(ProductContext);

  const onChange = React.useCallback((item) => {
    setProductOptions(item);
  });

  const currentItem = React.useMemo(() => {
    let value;
    productOptions.forEach((item) => {
      if (item.name === title) {
        value = item.value;
      }
    });
    return value;
  }, [productOptions]);

  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      <div className={styles.list}>
        {options.map((item, index) => {
          if (type === "text") {
            return (
              <div
                data-carousel={item.index}
                key={index}
                className={`
                    ${styles.list_item}
                    ${item.title === currentItem ? styles.active : ""}
                `}
                onClick={() => {
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
                data-carousel={item.index}
                className={`
                    ${styles.list_item_image}
                    ${item.title === currentItem ? styles.active : ""}
                `}
                onClick={() => {
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

export default function GoodOptionList() {
  const {
    productInfo: { typeList },
    productCurCombo,
    setProductOptions,
    removeProductOptions,
  } = React.useContext(ProductContext);

  React.useEffect(() => {
    // 设置了值，就不剔除
    let isSetValue = false;
    typeList.forEach((item) => {
      // 存在关联套餐的且不包含当前套餐的不显示
      if (
        !isSetValue &&
        item.associated &&
        item.combo_keys &&
        !item.combo_keys.includes(productCurCombo?.key)
      ) {
        removeProductOptions(item.title);
      }
      // 存在关联套餐的且包含当前套餐的显示
      if (
        item.associated &&
        item.combo_keys &&
        item.combo_keys.includes(productCurCombo?.key)
      ) {
        isSetValue = true;
        setProductOptions({
          name: item.title,
          value: item.options[0].title,
        });
      }
    });
  }, [productCurCombo]);

  if (typeList.length < 1) return null;
  return (
    <>
      {typeList.map((item, index) => {
        // 处理强关联
        if (
          item.associated &&
          item.combo_keys &&
          !item.combo_keys.includes(productCurCombo?.key)
        ) {
          return null;
        }
        return (
          <GoodOptionItem
            key={index}
            title={item.title}
            options={item.options}
            type={item.type}
          />
        );
      })}
    </>
  );
}
