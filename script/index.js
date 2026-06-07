/** @format */

// 加载特定环境的 .env 文件
const dotenv = require("dotenv");
const env = process.env.NODE_ENV === "local" ? ".local" : "";
const envFile = `.env${env}`;
dotenv.config({ path: envFile });

const fetchConfig = require("./fetch-config.js");
const fetchLanguage = require("./fetch-language.js");
const fetchFestivalDiscount = require("./fetch-festival-discount.js");

// 注意：product / blog 不再构建期物化，改为运行时从后端拉取 + ISR。
// 这里只保留仍需物化的 config / language / discount。
async function getData() {
  // 顺序约束：fetchConfig 先写入 globalConfig（语言列表派生自它），
  // 之后 fetchLanguage 才能 reload 到正确的 languageList，否则会读到空配置。
  await fetchConfig();
  await Promise.all([
    fetchLanguage(),
    fetchFestivalDiscount(),
  ]);
  const createSitemap = require("./create-sitemap.js");
  await createSitemap();
}
getData();

module.exports = getData;
