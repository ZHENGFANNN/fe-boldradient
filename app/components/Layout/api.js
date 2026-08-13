import api from "../../request";

const request = {
  loginOut: () => {
    return api.get(`/user/loginOut`);
  },
  // config 用于透传 Turnstile token 请求头，后端 TurnstileGuard("contact") 校验
  contactForm: (data, config) => {
    return api.post(`/user/contactForm`, data, config);
  },
  // 底部邮件订阅：走独立的无人机验证端点（footer 不渲染 Turnstile widget）
  newsletterSubscribe: (data) => {
    return api.post(`/user/newsletterSubscribe`, data);
  },
};

export default request;
