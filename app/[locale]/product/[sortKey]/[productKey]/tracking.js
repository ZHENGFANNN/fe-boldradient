"use client";
import { trackingCustomClick } from "@/utils";

export default {
  // 加入购物车
  addToCart: function ({ productName }) {
    trackingCustomClick({
      click_type: "AddToCart",
      click_data: {
        productName,
      },
    });
  },
  // 查看产品页
  viewContent: function ({ productName }) {
    trackingCustomClick({
      click_type: "ViewProduct",
      click_data: {
        productName,
      },
    });
  },
  // 购买流程
  initiateCheckout: function ({ currency, value, discount, contents, type }) {
    trackingCustomClick({
      click_type: "InitiateCheckout",
      click_data: {
        from: "product_page",
        currency,
        value,
        contents,
        discount,
        type,
      },
    });
  },
  // 购买转化
  purchase: function ({ currency, value, discount, contents, type }) {
    trackingCustomClick({
      click_type: "Purchase",
      click_data: {
        from: "product_page",
        currency,
        value,
        contents,
        discount,
        type,
      },
    });
  },
  // Footer按钮
  clickProductFooterCombo: function ({ productName }) {
    trackingCustomClick({
      click_type: "ProductFooterCombo",
      click_data: {
        productName,
      },
    });
  },
  clickProductFooterBuyBtn: function ({ productName }) {
    trackingCustomClick({
      click_type: "ProductFooterBuy",
      click_data: {
        productName,
      },
    });
  },
};
