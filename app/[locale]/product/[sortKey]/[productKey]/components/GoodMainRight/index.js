import GoodMainText from "./GoodMainText";
import GoodPrice from "./GoodPrice";
import GoodReviewsRate from "./GoodReviewsRate";
import GoodComboList from "./GoodComboList";
import GoodOptionList from "./GoodOptionList";
import GoodNumber from "./GoodNumber";
import GoodBtnList from "./GoodBtnList";
import GoodContent from "./GoodContent";
import GoodGuarantee from "./GoodGuarantee";
import styles from "./index.module.scss";

export default function GoodMainRight() {
  return (
    <div>
      {/* 主要文本 */}
      <GoodMainText />
      {/* 价格配置 */}
      <GoodPrice />
      {/* 产品评价 */}
      <GoodReviewsRate />
      <div className={styles.line}></div>
      {/* 产品套餐 */}
      <GoodComboList />
      {/* 产品选项 */}
      <GoodOptionList />
      {/* 产品数量 */}
      <GoodNumber />
      {/* 支付按钮 */}
      <GoodBtnList />
      {/* 商品内容 */}
      <GoodContent />
      {/* 产品保障 */}
      <GoodGuarantee />
    </div>
  );
}
