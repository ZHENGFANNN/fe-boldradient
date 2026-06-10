/** @format */

import { cookies } from "next/headers";

/** 服务端读取商品页 area cookie，默认 us。 */
export async function readProductArea(fallback = "us") {
  const cookieStore = await cookies();
  return cookieStore.get("area")?.value || fallback;
}

export default readProductArea;
