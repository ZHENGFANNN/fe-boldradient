/** @format */
/**
 * 10 种钻石形状的元数据。
 * slug：用于 ?shape=<slug> query + 自托管图片文件名（/diamond-shapes/<slug>.png）；
 * label：英文 fallback，运行时优先取 LANG["home.shape_<slug>"]。
 * 图片为 Brilliant Earth 同款钻石缩略图，已下载自托管到 public/diamond-shapes/，
 * 并抠成透明底 PNG（原白底方块会在米色区块上露出白框）。
 */
export const SHAPES = [
  { slug: "oval", label: "Oval" },
  { slug: "round", label: "Round" },
  { slug: "emerald", label: "Emerald" },
  { slug: "marquise", label: "Marquise" },
  { slug: "radiant", label: "Radiant" },
  { slug: "pear", label: "Pear" },
  { slug: "elongated-cushion", label: "Elongated Cushion" },
  { slug: "cushion", label: "Cushion" },
  { slug: "princess", label: "Princess" },
  { slug: "asscher", label: "Asscher" }
];
