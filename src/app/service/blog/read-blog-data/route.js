/** @format */

export const runtime = "nodejs";
export const fetchCache = "force-cache";

const fs = require("fs");
const qs = require("qs");

import { useParams } from "next/navigation";
import path from "path";
import getLanguage from "@/config/LANGUAGE";

const languageList = getLanguage("list");
const localeCache = {};

function updateLocaleCache(lang) {
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

export const updateData = () => {
  languageList.forEach((item) => {
    updateLocaleCache(item.value);
  });
};

// 初始化缓存
updateData();

export async function GET(request) {
  const { lang } = qs.parse(request.url.split("?")[1]);
  const data = Response.json(localeCache[lang]);
  return data;
}
