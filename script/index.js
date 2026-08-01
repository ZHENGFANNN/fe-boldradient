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
getData();

module.exports = getData;
