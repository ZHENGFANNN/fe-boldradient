import { trackingCustomClick } from "@/utils";

export default {
  // 点击轮播图
  clickBannerLink: ({ link }) => {
    trackingCustomClick({
      click_type: "IndexBannerItem",
      click_data: {
        link,
      },
    });
  },
  // 来自首页的点击，进入产品页
  clickIndexProduct: function ({ productName }) {
    trackingCustomClick({
      click_type: "IndexProductItem",
      click_data: {
        productName,
      },
    });
  },
};
