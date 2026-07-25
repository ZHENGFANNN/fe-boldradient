/**
 * axios封装
 * 请求拦截、响应拦截、错误统一处理
 *
 * @format
 */

const axios = require("axios");

const serviceBase = process.env.NEXT_PUBLIC_HOST;

// 多站点：构建期物化数据也要带 X-Site-Domain（与运行时 request/index.js、config/siteDomain.ts 一致），
// 后端按域名匹配 boldsaasify.site → 业务库。从 NEXT_PUBLIC_DOMAIN 解析出 host；未设置则不带（主站按 Host 解析，行为不变）。
function siteDomain() {
  const raw = (process.env.NEXT_PUBLIC_DOMAIN || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw).host;
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
}
const SITE_DOMAIN = siteDomain();

const instance = axios.create({
  baseURL: serviceBase,
  timeout: 30000,
  withCredentials: false,
  proxy: false,
  headers: SITE_DOMAIN ? { "X-Site-Domain": SITE_DOMAIN } : {},
});

/**
 * 响应拦截器
 */
instance.interceptors.response.use(
  // 请求成功
  (res) => {
    const { data, status } = res;
    if (status === 200) {
      return Promise.resolve(data);
    } else {
      return Promise.reject(data);
    }
  },
  // 请求失败
  (error) => {
    return Promise.reject(error);
  }
);

module.exports = instance;
