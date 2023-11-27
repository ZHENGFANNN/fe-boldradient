"use client";

export default {
  // 加入购物车
  addToCart: function ({ productName }) {
    window.fbq("track", "AddToCart", { content_name: productName });
  },
  // 查看产品页
  viewContent: function ({ productName }) {
    window.fbq("track", "ViewContent", {
      product_name: productName,
      content_type: "product",
    });
  },
};
