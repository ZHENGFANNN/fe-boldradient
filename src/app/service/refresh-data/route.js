/** @format */

const fs = require("fs");
import path from "path";
import getLanguage from "@/config/LANGUAGE";

const languageList = getLanguage("list");
let localeCache = {};

function updateLocaleCache(lang) {
  const filePath = path.join(
    process.cwd(),
    "locale",
    "blogData",
    `${lang}.json`
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(fileContents);
  localeCache[lang] = data;
}

// 初始化缓存
languageList.forEach((item) => {
  updateLocaleCache(item.value);
});

export default async function getBlogList(lang) {
  return localeCache[lang];
}

export async function GET() {
  // await getData();
  return Response.json(localeCache["en"]);
}
