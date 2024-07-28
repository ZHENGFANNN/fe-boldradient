/** @format */

let localeData = null;

async function getData(lang) {
  if (localeData) return localeData[lang];

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DOMAIN}/service/blog/read-blog-data`,
    {
      method: "GET",
    }
  );
  const data = await response.json();
  localeData = data;
  return data[lang];
}

export default async function getBlogList(lang) {
  return await getData(lang);
}
