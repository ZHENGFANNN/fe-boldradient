import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

// 纯 SSG：页面在构建期固化为静态资产（走 ASSETS 绑定），内容更新靠「点击发布 →
// Cloudflare 部署钩子全站重建」。不再需要 ISR 的增量缓存(R2)/刷新队列(DO)/tag 缓存(D1)。
// worker 仍保留，仅用于运行时实时取价路由（/api/cart、/api/products-offer、/api/products-catalog）。
export default defineCloudflareConfig({});
