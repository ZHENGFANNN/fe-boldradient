"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { defaultArea } from "@/config/marketSettings";
import { saveAreaPref } from "@/utils/localePrefs";


export type UseAreaResult = {
  /** cookie 未就绪时为 undefined；就绪后为 cookie 值，无 cookie 时落站点默认地区 */
  area: string | undefined;
  areaReady: boolean;
};

/**
 * 客户端读 cookie `area`，避免 layout 服务端 cookies() 影响 SSG。
 * 访客从未打开过国家选择器（无 area cookie）时，不做「读时兜底」，
 * 而是把站点默认地区（marketSettings.defaultArea：支持列表含 us 用 us、否则取首个）
 * 写进 cookie 并持久化，使后续所有取 area 的地方（订阅/联系表单等）都能拿到真实地区，
 * 避免存库空 area。
 */
export function useArea(): UseAreaResult {
  const [area, setArea] = useState<string | undefined>(undefined);
  const [areaReady, setAreaReady] = useState(false);

  useEffect(() => {
    let cookieArea = Cookies.get("area");
    if (!cookieArea) {
      // 无 cookie：种入站点默认地区并持久化（cookie + localStorage 镜像）
      cookieArea = defaultArea;
      saveAreaPref(cookieArea);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setArea(cookieArea);
    setAreaReady(true);
  }, []);

  return { area, areaReady };
}

export default useArea;
