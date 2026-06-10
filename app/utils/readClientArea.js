/** @format */

import Cookies from "js-cookie";

/** 客户端读取 area cookie，默认 us。 */
export function readClientArea(fallback = "us") {
  if (typeof document === "undefined") return fallback;
  return Cookies.get("area") || fallback;
}

export default readClientArea;
