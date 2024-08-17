/** @format */

export const runtime = "nodejs";
export const fetchCache = "force-cache";

const fs = require("fs");
const qs = require("qs");

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
  return localeCache[lang];
}

export async function GET(res) {
  const data = updateLocaleCache("en");
  return Response.json(data);
}
