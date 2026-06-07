/** @format */

const globalConfig = require("../../fetch-data/globalConfig/index.json");

const getSettingMarkets = () =>
  (globalConfig["setting.markets"] ?? []).filter((item) => item.enabled);

const buildMarketSettings = () => {
  const markets = getSettingMarkets();
  const supportedAreas = [
    ...new Set(
      markets.flatMap((market) =>
        (market.countries || []).map((code) => String(code).toLowerCase())
      )
    )
  ];
  const defaultArea = supportedAreas.includes("us")
    ? "us"
    : supportedAreas[0] || "us";

  return { markets, supportedAreas, defaultArea };
};

const settings = buildMarketSettings();

const resolveArea = (area) => {
  const normalized = String(area || "").toLowerCase();
  return settings.supportedAreas.includes(normalized)
    ? normalized
    : settings.defaultArea;
};

module.exports = {
  ...settings,
  getSettingMarkets,
  resolveArea
};
