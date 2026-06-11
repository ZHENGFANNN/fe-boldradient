import api from "../../../../request";

const request = {
  previewOrder: (data) => {
    return api.post("/pay/previewOrder", data);
  },
  // 支付
  createOrder: (data) => {
    return api.post("/pay/createOrder", data);
  },
  // 确认Paypal
  confirmPaypal: (data) => {
    return api.post("/pay/confirmPaypal", data);
  },
};

export default request;
