import api from "../../request";

const request = {
  userLogin: (data) => {
    return api.post(`/user/login`, data);
  },
  userRegister: (data) => {
    return api.post(`/user/register`, data);
  },
  // 注册前置：给邮箱发送验证码（用户填码后再 userRegister）
  sendRegisterCode: (data) => {
    return api.post(`/user/sendRegisterCode`, data);
  },
  // Google 登录（旧 GSI ID-token 隐式流，保留兼容；新前端走中央回调授权码流）
  userGoogleLogin: (data) => {
    return api.post(`/user/googleLogin`, data);
  },
  // Google 中央回调授权码流第 1 步：拿 Google 授权 URL（前端整页跳转）
  googleAuthUrl: (data) => {
    return api.post(`/user/google/auth-url`, data);
  },
  // Google 中央回调授权码流第 3 步：一次性交接码换本站 JWT
  googleExchange: (data) => {
    return api.post(`/user/google/exchange`, data);
  },
  // 自助重置第 1 步：校验邮箱并发送带 token 的重置链接到邮箱
  verifyForgetPassword: (data) => {
    return api.post(`/user/verifyforgetPassword`, data);
  },
  // 自助重置第 2 步：凭邮件 token 设置新密码
  resetPassword: (data) => {
    return api.post(`/user/resetPassword`, data);
  },
};

export default request;
