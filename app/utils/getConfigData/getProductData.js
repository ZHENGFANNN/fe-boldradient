/** @format */
import { cookies, headers } from "next/headers";

function handleProductList({ productList, area }) {
  if (Array.isArray(productList) && productList.length > 0) {
    return productList.map(({ comboItem, ...item }) => {
      let areaInfo = null;
      comboItem?.areaList.find((area_item) => {
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

// 过滤商品数据
const localeData = new Map();
async function getData({ locale, nameSpace }) {
  const cookieStore = await cookies();
  const area = cookieStore.get("area")?.value || "us";
  const cacheKey = `${locale}:${area}:${nameSpace}`;
  const cachedData = localeData.get(cacheKey);
  if (!cachedData) {
    // 改为运行时 fetch 静态资源，避免动态 require 把整个 public/config/product 打进 worker
    const h = await headers();
    const host = h.get("host");
    const proto = h.get("x-forwarded-proto") || "https";
    const res = await fetch(
      `${proto}://${host}/config/product/${nameSpace}/${locale}.json`,
      { cache: "force-cache" }
    );
    if (!res.ok) return null;
    let data = await res.json();

    if (nameSpace.includes("product:")) {
      data.associateProduct = handleProductList({
        productList: data.associateProduct,
        area,
      });

      data.comboList = data.comboList.map(({ areaList, ...combo }) => {
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
                  areaList.find((areaItem) => {
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
