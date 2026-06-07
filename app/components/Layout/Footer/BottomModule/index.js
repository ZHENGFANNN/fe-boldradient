"use client";

import React from "react";
import GlobalContext from "@/[locale]/context";

import { countryMap } from "@/config/marketSettings";
import { trackingCustomClick } from "@/utils";

import styles from "./index.module.scss";

const FULLYEAR = new Date().getFullYear();

function ShowLanguageItem() {
  const { area, showAreaModal } = React.useContext(GlobalContext);
  return (
    <div
      className={styles.show_item}
      onClick={() => {
        showAreaModal();
        trackingCustomClick({ click_type: "FooterArea" });
      }}
    >
      <img
        className={styles.icon}
        alt={area}
        src={`${process.env.NEXT_PUBLIC_FILE}/common/image/icon/flags/${area}.svg`}
      />
      <div>{`${countryMap[area]?.country} (${countryMap[area]?.currency_symbol}${countryMap[area]?.currency})`}</div>
    </div>
  );
}

export default function BottomModule() {
  const { CONFIG, LANG } = React.useContext(GlobalContext);
  return (
    <section className={styles.footer}>
      <div className={styles.footer_container}>
        <div className={styles.footer_copyright}>
          Copyright &copy; <time dateTime={FULLYEAR}>{FULLYEAR}</time>
          {` ${CONFIG["common.base"]?.company_name} `}
          {LANG["common.footer.right_reserved"]}
        </div>
        <div className={styles.footer_filing}>
          <ShowLanguageItem />
        </div>
      </div>
    </section>
  );
}
