/** @format */

const cn = require("@@/locale/blogData/cn.json");
const de = require("@@/locale/blogData/de.json");
const en = require("@@/locale/blogData/en.json");
const es = require("@@/locale/blogData/es.json");
const fr = require("@@/locale/blogData/fr.json");
const hk = require("@@/locale/blogData/hk.json");
const it = require("@@/locale/blogData/it.json");
const ja = require("@@/locale/blogData/ja.json");
const ko = require("@@/locale/blogData/ko.json");
const ru = require("@@/locale/blogData/ru.json");

const blogData = {
  cn,
  de,
  en,
  es,
  fr,
  hk,
  it,
  ja,
  ko,
  ru,
};

export default async function getBlogList(lang) {
  return blogData[lang];
}
