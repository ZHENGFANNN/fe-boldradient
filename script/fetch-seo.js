/** @format */

const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const api = require("./api");

/**
 * 构建期物化 SEO 运营配置：
 *   fetch-data/seo/index.json  ← /config/getSeoConfig
 *
 * 数据结构（后端已按 enabled=1 过滤，前端拿到即有效）：
 *   {
 *     meta:     [{pathname,title,description,keywords}],
 *     sitemap:  {adds:[{url,change_freq,priority}], excludes:["/x"]},
 *     robots:   [{user_agent,rule_type:"disallow"|"allow",path}]
 *   }
 *
 * 容错原则（对齐 languageSettings.ts）：网络/接口任意异常都不能整垮 fetch-prod，
 * 一律写入空骨架，避免运行时读盘 crash（app/config/seoOverrides.ts 亦有 try/catch 兜底）。
 */

const EMPTY_SEO = {
  meta: [],
  sitemap: { adds: [], excludes: [] },
  robots: [],
};

const OUT_PATH = "./fetch-data/seo/index.json";

const writeJson = (filePath, data) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 0));
};

const normalizeSeo = (raw) => {
  const meta = Array.isArray(raw?.meta) ? raw.meta : [];
  const sitemap = raw?.sitemap || {};
  const adds = Array.isArray(sitemap.adds) ? sitemap.adds : [];
  const excludes = Array.isArray(sitemap.excludes) ? sitemap.excludes : [];
  const robots = Array.isArray(raw?.robots) ? raw.robots : [];
  return { meta, sitemap: { adds, excludes }, robots };
};

const fetchSeo = async () => {
  const startTime = Date.now();
  console.log(`${chalk.yellow("【开始获取 SEO 配置】")}`);

  try {
    const res = await api.get("/config/getSeoConfig");
    const data = normalizeSeo(res?.data);
    writeJson(OUT_PATH, data);
    console.log(
      `${chalk.green("【SEO 配置获取成功】")} ` +
        `meta=${data.meta.length} adds=${data.sitemap.adds.length} ` +
        `excludes=${data.sitemap.excludes.length} robots=${data.robots.length}`
    );
  } catch (err) {
    // 后端表不存在 / 网络抖动 / 接口 500 → 写空骨架，构建照常继续
    console.log(
      `${chalk.red("【SEO 配置获取失败，写入空骨架】")}`,
      err?.message || err
    );
    try {
      writeJson(OUT_PATH, EMPTY_SEO);
    } catch (writeErr) {
      // 写盘失败也别抛（读盘侧有 try/catch）；仅打印
      console.log(
        `${chalk.red("【SEO 空骨架写盘失败】")}`,
        writeErr?.message || writeErr
      );
    }
  } finally {
    console.log(
      `${chalk.green("【SEO 配置获取时长】")} ${Date.now() - startTime}ms`
    );
  }
};

module.exports = fetchSeo;
