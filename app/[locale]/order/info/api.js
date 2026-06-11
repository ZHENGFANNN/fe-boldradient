import api from "../../../request";

const request = {
  // 获取订单详情（游客/支付后凭 secret 查看）
  getOrderDetail: (data) => {
    return api.post("/pay/getOrderDetail", data);
  },
  // 获取订单列表
  getOrderList: (data) => {
    return api.post("/pay/getOrderList", data);
  },
  // 确认Paypal
  confirmPaypal: (data) => {
    return api.post("/pay/confirmPaypal", data);
  },
};

export default request;
