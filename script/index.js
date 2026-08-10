/** @format */

require("./register-ts");

// 加载本地 env 文件。
// NEXT_PUBLIC_* 是构建期内联变量：本地放 .env.local（gitignore），
// 线上由 Cloudflare Workers Builds 的「构建变量」在 process.env 注入，故此处两文件都不存在也不报错。
// 优先级：.env.local > .env（dotenv 不覆盖已存在的键；CF 环境两文件皆无 → 直接用注入值）。
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const fetchConfig = require("./fetch-config.js");
const fetchSeo = require("./fetch-seo.js");

// 注意：product / blog 不再构建期物化，改为运行时从后端拉取 + ISR。
// 文案（language）已改为运行时按命名空间从后端拉取（app/config/Api/getRemoteLanguage.ts）+ ISR，
//   不再构建期物化到 fetch-data/languageList，故 fetchLanguage 已移除。
// 节日折扣（getFestivalDiscount）已下线，后端表与接口已移除，不再构建期拉取。
// sitemap 改用 Next 原生 app/sitemap.js（构建期生成 /sitemap.xml），不再走脚本。
// SEO 运营配置（meta 覆盖 / sitemap 追加 / robots 追加）构建期物化到 fetch-data/seo/index.json，
//   接口不存在 / 抖动都会写空骨架，绝不 crash 主流程。
async function getData() {
  await fetchConfig();
  await fetchSeo();
}

// 🔴 必须 await + 非 0 退出：本脚本是 `yarn deploy`（fetch-prod && cf-build && cf-deploy）
// 的第一环，靠退出码决定后面构建/部署跑不跑。
//
// 原来是裸调 `getData();`——fetchConfig 连续三次拉取失败时抛的错只是一个**未处理的 Promise
// rejection**，进程仍以 0 退出，`&&` 链照常往下走，于是拿着不完整的 fetch-data 构建并推上线。
// 2026-08-09 就是这样：本地网络拉不动 4.5MB 的 /config/getProduct（30s 超时），
// 数据没落全却照样部署，线上商品页 500，而部署日志一路显示成功。
//
// 构建数据不完整时**必须让整条链停在这里**——宁可不发版，也不能发一个静默残缺的包。
getData().catch((err) => {
  console.error("\n【构建数据拉取失败，已中止】", err && err.message ? err.message : err);
  console.error("构建数据不完整时禁止继续构建/部署：产物会缺页面数据且不会报错，直到线上 500 才被发现。");
  console.error("排查方向：后端 service 域名可达性、/config/getProduct（约 4.5MB）是否在超时内拉完。");
  process.exit(1);
});

module.exports = getData;
