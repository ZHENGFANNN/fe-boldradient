/**
 * 作用：导航栏列表
 * 注意：所有语言相关的数据都在这里获取
 *
 * @format
 */

export default function NAVFUNC({
  LANG,
  CONFIG,
  goodList,
  goodSortList,
  BLOG,
}) {
  // 产品分类
  const navGoodSort = {
    key: "product_categories",
    title: LANG["common.nav.product_categories"],
    list: goodSortList?.map((item) => {
      return {
        sub_title: item.name,
        href: `/#${item.key}`,
        img: (
          <img
            height={60}
            width={60}
            data-src={item.image_src}
            alt={item.name}
          />
        ),
      };
    }),
  };

  // 产品列表
  const navGoodList = {
    key: "product_info",
    title: LANG["common.nav.product_info"],
    list: goodList?.map((item) => {
      return {
        sub_title: item.name,
        href: `/product/${item.sort_key}/${item.key}`,
        img: (
          <img
            height={60}
            width={60}
            data-src={item.image || item.image_list?.[0]?.src}
            alt={item.name}
          />
        ),
      };
    }),
  };

  // 博客分类
  const navBlogSort = {
    key: "blog",
    title: "Blog",
    href: "/blog",
    list: [],
    // list: Object.keys(BLOG["blogSortMap"]).map((item) => {
    //   return {
    //     sub_title: BLOG["blogSortMap"][item].name,
    //     href: `/blog/${BLOG["blogSortMap"][item].key}`,
    //   };
    // }),
  };

  // 购买方式
  const navBuyWay = {
    key: "where_buy",
    title: LANG["common.nav.where_buy"],
    list: CONFIG["company.sales_channels.index"]?.map((item) => {
      return {
        sub_title: item.title,
        href: item.href,
        img: (
          <img height={60} width={60} data-src={item.src} alt={item.title} />
        ),
      };
    }),
  };

  // 网站协议
  const navWebsiteSupport = {
    key: "support",
    title: LANG["common.nav.support"],
    list: [
      {
        sub_title: LANG["common.nav.sales_policy"],
        href: "/protocol/sales",
        img: (
          <img
            alt={LANG["common.nav.sales_policy"]}
            height={60}
            width={60}
            data-src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/nav-sales.svg`}
          />
        ),
      },
      {
        sub_title: LANG["common.nav.privacy_policy"],
        href: "/protocol/policy",
        img: (
          <img
            alt={LANG["common.nav.privacy_policy"]}
            height={60}
            width={60}
            data-src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/nav-privacy.svg`}
          />
        ),
      },
      {
        sub_title: LANG["common.nav.user_service"],
        href: "/protocol/user",
        img: (
          <img
            alt={LANG["common.nav.user_service"]}
            height={60}
            width={60}
            data-src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/nav-argeement.svg`}
          />
        ),
      },
      {
        sub_title: LANG["common.nav.faq"],
        href: "/protocol/faq",
        img: (
          <img
            alt={LANG["common.nav.faq"]}
            height={60}
            width={60}
            data-src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/nav-faq.svg`}
          />
        ),
      },
    ],
  };

  // 关于我们
  const navAboutUs = {
    key: "about_us",
    title: LANG["common.nav.about_us"],
    list: [
      {
        sub_title: LANG["common.nav.company_profile"],
        href: "/company/introduce",
        img: (
          <img
            alt={LANG["common.nav.company_profile"]}
            height={60}
            width={60}
            data-src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/nav-company.svg`}
          />
        ),
      },
      {
        sub_title: LANG["common.nav.market_collaboration"],
        href: "/company/market",
        img: (
          <img
            alt={LANG["common.nav.market_collaboration"]}
            height={60}
            width={60}
            data-src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/nav-market.svg`}
          />
        ),
      },
      {
        sub_title: LANG["common.nav.technical_cooperation"],
        href: "/company/technology",
        img: (
          <img
            alt={LANG["common.nav.technical_cooperation"]}
            height={60}
            width={60}
            data-src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/nav-technology.svg`}
          />
        ),
      },
      {
        sub_title: LANG["common.nav.supplier_cooperation"],
        href: "/company/supplier",
        img: (
          <img
            alt={LANG["common.nav.supplier_cooperation"]}
            height={60}
            width={60}
            data-src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/nav-suppiler.svg`}
          />
        ),
      },
      {
        sub_title: LANG["common.nav.contact_us"],
        href: "/company/contact",
        img: (
          <img
            alt={LANG["common.nav.contact_us"]}
            height={60}
            width={60}
            data-src={`${process.env.NEXT_PUBLIC_FILE}/image/icon/nav-contact.svg`}
          />
        ),
      },
    ],
  };

  return [
    navGoodSort,
    navGoodList,
    navBlogSort,
    navBuyWay,
    navWebsiteSupport,
    navAboutUs,
  ];
}
