import React from "react";
import Modal from "@/components/Modal";

import GoodNumber from "../../GoodNumber";
import GoodOptionList from "../../GoodOptionList";
import GoodComboList from "../../GoodComboList";
import GoodBtnList from "../../GoodBtnList";

import styles from "./index.module.scss";

function ComboModal(
  { GOODDISCOUNTFESTIVAL, LANG, CONFIG, options, locale, area, productInfo },
  ref
) {
  const modalRef = React.useRef();
  React.useImperativeHandle(ref, () => {
    return {
      show: () => {
        modalRef.current.show({ title: LANG["store.product.combo"] });
      },
    };
  });
  return (
    <Modal ref={modalRef}>
      <div className={styles.container}>
        {/* 产品选项 */}
        {productInfo.typeList?.length > 0
          ? productInfo.typeList.map((item, index) => {
              return (
                <GoodOptionList
                  from="components"
                  key={index}
                  title={item.title}
                  options={item.options}
                  type={item.type}
                />
              );
            })
          : null}
        <GoodComboList
          from="components"
          goodDiscountFestival={GOODDISCOUNTFESTIVAL}
          LANG={LANG}
          options={options}
        />
        <GoodNumber LANG={LANG} />
        <GoodBtnList
          goodDiscountFestival={GOODDISCOUNTFESTIVAL}
          CONFIG={CONFIG}
          LANG={LANG}
          areaCode={area}
          locale={locale}
          productInfo={productInfo}
        />
      </div>
    </Modal>
  );
}

export default React.forwardRef(ComboModal);
