import api from "../../request";

const request = {
  loginOut: () => {
    return api.get(`/user/loginOut`);
  },
  // config 用于透传 Turnstile token 请求头，后端 TurnstileGuard("contact") 校验
  contactForm: (data, config) => {
    return api.post(`/user/contactForm`, data, config);
  },
};

export default request;
