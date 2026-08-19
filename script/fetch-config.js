/** @format */

const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const api = require("./api");

/**
 * 从两个公开接口拉取配置，按后端 code 原样写入：
 *   fetch-data/pageConfig/<locale>.json  ← /config/getPageSettings
 *   fetch-data/globalConfig/index.json   ← /config/get{Market,Language,Pay,Analytics}Settings（拆分后按命名空间拉取重组）
 *
 * locale 取自 globalConfig.setting.language 的 iso_code（小写）
 */

const isEmptyCell = (v) => {
  if (v === undefined || v === null) return true;
  const s = String(v).trim();
  return s === "" || s === "null" || s === "[]";
};

const parseCell = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const toLocale = (isoCode) => String(isoCode || "").toLowerCase();

const getPageValue = (item, locale) => {
  let raw = item[locale];
  if (isEmptyCell(raw)) raw = item.en;
  if (isEmptyCell(raw)) return undefined;
  return parseCell(raw);
};

const buildPageConfig = (pageList, locale) => {
  const target = {};
  pageList.forEach((item) => {
    const value = getPageValue(item, locale);
    if (value !== undefined && item.code) {
      target[item.code] = value;
    }
  });
  return target;
};

const writeJson = (filePath, data) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 0));
};

const getEnabledLanguages = (globalConfig) =>
  (globalConfig["setting.language"] ?? []).filter(
    (item) => item.enabled !== false
  );

const fetchConfig = async (times = 1, cookie = "") => {
  let error = false;
  const startTime = Date.now();
  console.log(`${chalk.yellow("【开始获取配置信息】")}`);

  try {
    // 全局配置按命名空间拆分拉取（安全：markets/language 端点不再顺带下发 pay，
    // pay 端点服务端脱敏，剔除密钥/webhook/mode）。旧 /config/getGlobalSettings 已下线。
    // 各端点返回 { code:0, data: <该 code 已解析的 JSON> }，此处重组回与旧
    // globalConfig/index.json 完全一致的 { "setting.markets", "setting.language", "setting.pay" }
    // 快照，故 app/config/*.ts 三个加载器与运行时 CONFIG 零改动。
    const [pageRes, marketRes, languageRes, payRes] = await Promise.all([
      api.get("/config/getPageSettings", { headers: { cookie } }),
      api.get("/config/getMarketSettings", { headers: { cookie } }),
      api.get("/config/getLanguageSettings", { headers: { cookie } }),
      api.get("/config/getPaySettings", { headers: { cookie } }),
    ]);

    // 埋点配置（setting.analytics）单独拉取并独立容错：新接口（getAnalyticsSettings）若尚未
    // 随后端上线（前端先于后端部署的时间窗），这里降级为 {} 而非让整个构建失败——
    // 埋点缺失只是 GA/Pixel 不注入，不该阻断商城构建。后端上线后重新构建即补齐。
    const analyticsRes = await api
      .get("/config/getAnalyticsSettings", { headers: { cookie } })
      .catch((err) => {
        console.log(
          `${chalk.yellow("【埋点配置获取失败，降级为空】")}`,
          err?.message || err
        );
        return { data: {} };
      });

    const pageList = pageRes?.data?.list || [];
    const globalConfig = {
      "setting.markets": marketRes?.data ?? [],
      "setting.language": languageRes?.data ?? [],
      "setting.pay": payRes?.data ?? {},
      "setting.analytics": analyticsRes?.data ?? {},
    };

    writeJson("./fetch-data/globalConfig/index.json", globalConfig);

    getEnabledLanguages(globalConfig).forEach((item) => {
      const locale = toLocale(item.iso_code);
      writeJson(
        `./fetch-data/pageConfig/${locale}.json`,
        buildPageConfig(pageList, locale)
      );
    });
  } catch (err) {
    console.log(`${chalk.red("【配置信息获取失败】")}`, err);
    error = true;
  } finally {
    console.log(
      `${chalk.green("【配置信息获取时长】")} ${Date.now() - startTime}ms`
    );
    times += 1;
    if (error && times < 4) {
      console.log(`${chalk.red(`【!!!配置信息第${times}次获取!!!】`)}`);
      return fetchConfig(times, cookie);
    }
    if (error && times > 3) {
      console.log(`${chalk.red("【!!!配置信息连续三次获取失败!!!】")}`);
      throw new Error("【!!!配置信息连续三次获取失败!!!】");
    }
  }
};

module.exports = fetchConfig;
