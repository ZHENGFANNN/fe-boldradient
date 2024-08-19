/** @format */

export const runtime = "nodejs";
export const fetchCache = "force-cache";

const fs = require("fs");
const msgpack = require("msgpack-lite");
import path from "path";
import { parse } from "url";
import getLanguage from "@/config/LANGUAGE";

const languageList = getLanguage("list");
const localeCache = {};

function updateLocaleCache(lang) {
  if (!localeCache[lang]) {
    const filePath = path.join(
      process.cwd(),
      "locale",
      "blogData",
      `${lang}.json`
    );
    const fileContents = fs.readFileSync(filePath, "utf8");
    try {
      const data = JSON.parse(fileContents);
      localeCache[lang] = data;
    } catch {
      localeCache[lang] = fileContents;
    }
  }
  return localeCache[lang];
}

languageList.forEach((item) => {
  updateLocaleCache(item.value);
});

function handleProductList({ productList, area }) {
  if (Array.isArray(productList) && productList.length > 0) {
    return productList.map(
      ({
        reviewsList,
        image_list,
        comboList,
        reviews_num,
        reviews_score,
        ...item
      }) => {
        let areaInfo = null;
        comboList.find(({ areaList }) => {
          areaList.find((area_item) => {
            if (area_item.country_code === "us" && !areaInfo) {
              areaInfo = area_item;
            }
            if (area_item.country_code === area) {
              areaInfo = area_item;
            }
            return area_item.country_code === area;
          });
          return areaInfo?.stock;
        });

        const totalScore = reviewsList?.reduce(
          (pre, cur) => pre + cur.score,
          0
        );
        item.reviewScore = totalScore / reviewsList?.length || reviews_score;
        item.reviewsNum = reviewsList?.length || reviews_num;

        item.image = image_list[0].src;
        item.areaInfo = areaInfo;

        return item;
      }
    );
  }
  return [];
}

export async function GET(req) {
  // 解析 URL 和查询参数
  const newReq = new Request(req);
  const parsedUrl = parse(newReq.url, true);
  const { language = "en", area = "us", key = "" } = parsedUrl.query;
  const data = JSON.parse(JSON.stringify(localeCache[language]));
  Object.keys(data.blogMap).map((key) => {
    const { associateProduct, ...item } = data.blogMap[key];
    data.blogMap[key] = {
      ...item,
      products: handleProductList({
        productList: associateProduct,
        area,
      }),
    };
  });

  if (key === "layout") {
    return Response.json({
      blogSortMap: {
        888: {
          weight: 888,
          key: "888",
          name: "888",
          blogList: [
            {
              image:
                "https://files.sslfly.com/image/base/2024/2/24/629084C05391E39B6829C8B6CBEE7296/WechatIMG4928.jpeg?width=800&height=800",
              title: "fasdasadsr",
              key: "123",
              sort_key: "888",
              updated_time: "2024-08-01T14:59:42.000Z",
            },
            {
              image: null,
              title: "sdasd",
              key: "test-3",
              sort_key: "888",
              updated_time: "2024-08-01T14:55:28.000Z",
            },
          ],
        },
        "eee-10000": {
          weight: 1000,
          key: "eee-10000",
          name: "tip",
          blogList: [
            {
              image:
                "https://files.sslfly.com/image/base/2024/6/24/2D125A9A04C92ACB88F7EE8EDDCEAF14/video-cover.jpg?width=2160&height=2880",
              title: "33 zf ----",
              key: "888",
              sort_key: "eee-10000",
              updated_time: "2024-08-11T11:20:05.000Z",
            },
            {
              image:
                "https://files.sslfly.com/image/base/2024/6/22/2886F6BF0274C50C24F1CB07D9FFA117/3-jelly-scented-candle.jpg?width=790&height=790",
              title:
                "Ex-SpaceX Security Chief Upgrades the Security Industry with Pocket-Sized Camerasz",
              key: "23423",
              sort_key: "eee-10000",
              updated_time: "2024-08-19T13:48:29.000Z",
            },
            {
              image:
                "https://files.sslfly.com/image/base/2024/6/24/2D125A9A04C92ACB88F7EE8EDDCEAF14/video-cover.jpg?width=2160&height=2880",
              title:
                "High Definition Cameras: The Ultimate Guide to Choosing and Using HD Camerasd",
              key: "1111",
              sort_key: "eee-10000",
              updated_time: "2024-07-31T18:07:15.000Z",
            },
            {
              image:
                "https://files.sslfly.com/image/base/2024/6/22/542E60F060F8C2F422440BE6A20EB430/2-coffee-scented-candle.jpg?width=658&height=658",
              title:
                "The Fastest Skier in the World - Thinking Bold With World Record Holder Simon Billys",
              key: "999",
              sort_key: "eee-10000",
              updated_time: "2024-08-01T16:34:04.000Z",
            },
          ],
        },
      },
    });
  }

  return Response.json(data);
}
