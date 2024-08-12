/** @format */

// /** @format */

// const cn = require("@@/locale/productList/cn.json");
// const de = require("@@/locale/productList/de.json");
// const en = require("@@/locale/productList/en.json");
// const es = require("@@/locale/productList/es.json");
// const fr = require("@@/locale/productList/fr.json");
// const hk = require("@@/locale/productList/hk.json");
// const it = require("@@/locale/productList/it.json");
// const ja = require("@@/locale/productList/ja.json");
// const ko = require("@@/locale/productList/ko.json");
// const ru = require("@@/locale/productList/ru.json");

// const productInfoList = {
//   cn,
//   de,
//   en,
//   es,
//   fr,
//   hk,
//   it,
//   ja,
//   ko,
//   ru,
// };

// export default async function getGoodList(lang) {
//   return productInfoList[lang];
// }

export default async function getGoodList(lang) {
  const startTime = Date.now();
  let data;
  switch (lang) {
    case "cn":
      data = await import("@@/locale/productList/cn.json");
      break;
    case "de":
      data = await import("@@/locale/productList/de.json");
      break;
    case "en":
      data = await import("@@/locale/productList/en.json");
      break;
    case "es":
      data = await import("@@/locale/productList/es.json");
      break;
    case "fr":
      data = await import("@@/locale/productList/fr.json");
      break;
    case "hk":
      data = await import("@@/locale/productList/hk.json");
      break;
    case "it":
      data = await import("@@/locale/productList/it.json");
      break;
    case "ja":
      data = await import("@@/locale/productList/ja.json");
      break;
    case "ko":
      data = await import("@@/locale/productList/ko.json");
      break;
    case "ru":
      data = await import("@@/locale/productList/ru.json");
      break;
    default:
      throw new Error(`Unsupported language: ${lang}`);
  }
  console.log(`---获取产品列表时间: ${Date.now() - startTime}---`);
  return data.default;
}
