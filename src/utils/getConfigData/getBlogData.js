/** @format */

import { cookies } from "next/headers";

/** @format */
const localeData = new Map();
async function getData({ lang, area, key }) {
  if (!localeData.get(`${lang}:${lang}:${key}`)) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/service/blog/read-blog-data?language=${lang}&area=${area}&key=${key}`,
      { method: "GET" }
    );
    const data = await response.json();
    localeData.set(`${lang}:${lang}:${key}`, data);
  }
  return localeData.get(`${lang}:${lang}:${key}`);
}

export default async function getBlogList(lang, key) {
  const startTime = Date.now();
  const area = cookies().get("area")?.value || "us";
  const data = await getData({ lang, area, key });
  console.log(`---获取Blog时间: ${Date.now() - startTime}---`);
  return data;
}
