/** @format */

import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";

/** @format */
const localeData = new Map();
async function getData({ lang, area }) {
  if (!localeData.get(`${lang}:${lang}`)) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/service/blog/read-blog-data?language=${lang}&area=${area}`,
      { method: "GET" }
    );
    const data = await response.json();
    localeData.set(`${lang}:${lang}`, data);
  }
  return localeData.get(`${lang}:${lang}`);
}



export default async function getBlogList(lang) {
  const startTime = Date.now();
  const area = cookies().get("area")?.value || "us";
 const getCachedData = unstable_cache(
    async (lang, area) => {
      const data = await getData({ lang, area });
      return data;
    },
    {
      key: `blog:${lang}:${area}`,
      revalidate: 365 * 60 * 60 * 24, // 可选：设置缓存过期时间为24小时
    }
  );

  const data = await getCachedData(lang, area);
  console.log(`---获取Blog时间: ${Date.now() - startTime}---`);
  return data;
}
