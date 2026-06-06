import { trackingCustomClick } from "@/utils";

const layoutTracking = {
  enterOrderForm: function ({ currency, value, contents }) {
    trackingCustomClick({
      click_type: "CartModalCheckout",
      click_data: {
        currency,
        value,
        contents,
      },
    });
  },
};

export default layoutTracking;
