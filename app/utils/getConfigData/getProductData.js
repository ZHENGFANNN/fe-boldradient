/** @format */
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function handleProductList({ productList, area }) {
  if (Array.isArray(productList) && productList.length > 0) {
    return productList.map(({ comboItem, ...item }) => {
      let areaInfo = null;
      comboItem?.areaList?.find((area_item) => {
        if (area_item.country_code === area) {
          areaInfo = area_item;
        }
        return area_item.country_code === area;
      });
      item.areaInfo = areaInfo;
      return item;
    });
  }
  return [];
}

// 通过 Cloudflare ASSETS 绑定读取静态 JSON（部署后位于 .open-next/assets）。
// 本地 next dev 时 ASSETS 目录通常尚未 build，回退到 public/ 直接读文件。
async function loadConfig(nameSpace, locale) {
  const assetPath = `/config/product/${nameSpace}/${locale}.json`;

  try {
    const { env } = getCloudflareContext();
    const res = await env.ASSETS.fetch(
      new URL(assetPath, "https://assets.local")
    );
    if (res.ok) {
      return await res.json();
    }
    console.error(`config not found: ${nameSpace}/${locale} (${res.status})`);
  } catch (err) {
    console.error(
      `loadConfig ASSETS failed: ${nameSpace}/${locale}`,
      err?.message
    );
  }

  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const filePath = path.join(process.cwd(), "public", assetPath);
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`loadConfig failed: ${nameSpace}/${locale}`, err?.message);
    return null;
  }
}

// 过滤商品数据
const localeData = new Map();
async function getData({ locale, nameSpace }) {
  const cookieStore = await cookies();
  const area = cookieStore.get("area")?.value || "us";
  const cacheKey = `${locale}:${area}:${nameSpace}`;
  const cachedData = localeData.get(cacheKey);
  if (!cachedData) {
    let data = await loadConfig(nameSpace, locale);
    if (!data) return null;

    if (nameSpace.includes("product:")) {
      data.associateProduct = handleProductList({
        productList: data.associateProduct,
        area,
      });

      data.comboList = (data.comboList || []).map(({ areaList, ...combo }) => {
        // 遍历商品套餐区域, 找到对应的国家列表
        let areaInfo = null;
        areaList?.forEach((areaItem) => {
          if (areaItem.country_code === area) {
            areaInfo = areaItem;
          }
        });
        return {
          areaInfo,
          ...combo,
        };
      });
    }

    if (nameSpace === "sort") {
      data = Object.keys(data)
        .map((key) => {
          const { goodList, ...sort } = data[key];
          return {
            ...sort,
            goodList: goodList.map(({ comboList, ...item }) => {
              return {
                ...item,
                comboList: comboList.map(({ areaList, ...combo }) => {
                  let areaInfo = null;
                  areaList?.find((areaItem) => {
                    if (areaItem.country_code === area) {
                      areaInfo = areaItem;
                    }
                    return areaItem.country_code === area;
                  });
                  return {
                    areaInfo,
                    ...combo,
                  };
                }),
              };
            }),
          };
        })
        .sort((a, b) => b.weight - a.weight);
    }

    localeData.set(cacheKey, data);
  }
  return localeData.get(cacheKey);
}

export default async function getGoodList({
  locale,
  configList,
  productNameSpace,
}) {
  if (!configList.includes("product")) return null;
  const promiseList = await Promise.all(
    productNameSpace.map((nameSpace) => getData({ locale, nameSpace }))
  );
  const resMap = {};
  productNameSpace.forEach((item, index) => {
    resMap[item] = promiseList[index];
  });

  return resMap;
}
