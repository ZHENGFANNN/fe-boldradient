// ============================================================
// Next.js 原生 robots（替代静态 public/robots.txt）。
// 域名统一取 NEXT_PUBLIC_DOMAIN —— 与 app/sitemap.ts、app/config/seo.ts
// 同源，避免再次硬编码导致旧域名残留。DOMAIN 未配置时省略 host/sitemap，
// 不输出残缺值。
//
// 运营追加规则（getRobotsExtras）来自 fetch-data/seo/index.json：
//   - 与内置的 `*` 硬编码 disallow 合并去重
//   - 若出现非 `*` UA，输出转为 `rules: [...]` 多组数组
// ============================================================

import type { MetadataRoute } from "next";
import { getRobotsExtras } from "@/config/seoOverrides";

const DOMAIN = String(process.env.NEXT_PUBLIC_DOMAIN || "").replace(/\/$/, "");

const BUILT_IN_DISALLOW = [
  "/*/user/account",
  "/*/user/forget",
  "/*/cart",
  "/*/order",
  "/config/*",
];

/** 追加规则按 user_agent 分组，同一组内再按 allow / disallow 拆桶去重 */
function groupExtras() {
  const groups = new Map<
    string,
    { allow: Set<string>; disallow: Set<string> }
  >();
  for (const rule of getRobotsExtras()) {
    const ua = rule.user_agent || "*";
    if (!groups.has(ua)) {
      groups.set(ua, { allow: new Set(), disallow: new Set() });
    }
    const bucket = groups.get(ua)!;
    if (rule.rule_type === "allow") bucket.allow.add(rule.path);
    else bucket.disallow.add(rule.path);
  }
  return groups;
}

export default function robots(): MetadataRoute.Robots {
  const groups = groupExtras();
  const starGroup = groups.get("*");
  const otherGroups = Array.from(groups.entries()).filter(
    ([ua]) => ua !== "*"
  );

  // `*` 组：内置 disallow ∪ 运营追加 disallow；allow 默认 `/`，若运营配了额外 allow 就合并成数组
  const starDisallow = Array.from(
    new Set([...BUILT_IN_DISALLOW, ...(starGroup?.disallow || [])])
  );
  const starAllow = starGroup?.allow?.size
    ? Array.from(new Set(["/", ...starGroup.allow]))
    : "/";

  const starRule = {
    userAgent: "*",
    allow: starAllow,
    disallow: starDisallow,
  };

  // 多 UA 分组：Robots.rules 支持数组形态 [{userAgent,...}, {userAgent,...}]
  const result: MetadataRoute.Robots = {
    rules:
      otherGroups.length > 0
        ? [
            starRule,
            ...otherGroups.map(([ua, bucket]) => {
              const rule: {
                userAgent: string;
                allow?: string[];
                disallow?: string[];
              } = { userAgent: ua };
              if (bucket.allow.size)
                rule.allow = Array.from(bucket.allow);
              if (bucket.disallow.size)
                rule.disallow = Array.from(bucket.disallow);
              return rule;
            }),
          ]
        : starRule,
  };

  if (DOMAIN) {
    result.sitemap = `${DOMAIN}/sitemap.xml`;
    result.host = DOMAIN;
  }

  return result;
}
