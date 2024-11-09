"use client";

import React from "react";
import styles from "./index.module.scss";
import GlobalContext from "@/[locale]/context";
export default function Advantage({ LANG }) {
  const { showContactModal } = React.useContext(GlobalContext);
  return (
    <div
      className={styles.tip_container}
      data-role="store-advantage"
      id="store-advantage"
    >
      <div className={styles.tip_item}>
        <div className={styles.tip_item_img}>
          <img
            alt="store-car"
            src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/store-car.svg`}
          />
        </div>
        <div className={styles.tip_item_text}>
          {LANG["common.advantage.express_text"]}
        </div>
      </div>
      <div className={styles.tip_item}>
        <div className={styles.tip_item_img}>
          <img
            alt="store-credit"
            src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/store-credit.svg`}
          />
        </div>
        <div className={styles.tip_item_text}>
          {LANG["common.advantage.pay_way"]}
        </div>
      </div>
      <div className={styles.tip_item}>
        <div className={styles.tip_item_img}>
          <img
            alt="store-contact"
            src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/store-contact.svg`}
          />
        </div>
        <div className={styles.tip_item_text}>
          <div className={styles.modal_context} onClick={showContactModal}>
            {LANG["common.advantage.contact"]}
          </div>
        </div>
      </div>
    </div>
  );
}
