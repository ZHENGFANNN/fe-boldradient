import { trackingCustomClick } from "@/utils";

export default {
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
