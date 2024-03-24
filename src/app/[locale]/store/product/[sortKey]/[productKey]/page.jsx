import React from "react";

import GoodMediaDisplay from "./components/GoodMediaDisplay";
import GoodMediaTabs from "./components/GoodMediaTabs";
import GoodOptionList from "./components/GoodOptionList";
import GoodComboList from "./components/GoodComboList";
import AssociateProductList from "./components/AssociateProductList/index";
import GoodPackageList from "./components/GoodPackageList";
import GoodAccessoriesList from "./components/GoodAccessoriesList";
import GoodFunctionList from "./components/GoodFunctionList";
import GoodMediaList from "./components/GoodMediaList";
import GoodNumber from "./components/GoodNumber";
import GoodBtnList from "./components/GoodBtnList";
import Countdown from "./components/Countdown";

import styles from "./page.module.scss";
import { cookies } from "next/headers";
import Script from "next/script";

import GoodPrice from "./components/GoodPrice";
import GoodFooter from "./components/GoodFooter";
import Loading from "@/components/Loading";
import NavigatorIndex from "./components/NavigatorIndex";
import GoodReviewsRate from "./components/GoodReviewsRate";
import GoodReviewsContent from "./components/GoodReviewsContent";

import getConfigDataV2 from "@/utils/getConfigDataV2";
import GoodGuarantee from "./components/GoodGuarantee";
import GoodFaq from "./components/GoodFaq";

import formatCurrency from "@/utils/formatCurrency";
import GoodNav from "./components/GoodNav";

export const runtime = "edge";

// 匹配产品信息
async function getProductInfo({ productList, productKey }) {
  return productList.find((item) => {
    return item.key === productKey;
  });
}

/**
 * 获取数据
 */
async function getData({ productKey, locale, area, configList }) {
  const result = await getConfigDataV2({ locale, area, configList });
  // 获取产品信息
  result.productInfo = await getProductInfo({
    productList: result.GOODLIST,
    productKey,
  });
  const [mediaDisplayList, navList, associateProduct] = await Promise.all([
    // 获取产品参数
    await getMediaDisplayList({
      productInfo: result.productInfo,
      LANG: result.LANG,
    }),
    // 获取产品导航栏
    await getProductNavList({
      productInfo: result.productInfo,
      LANG: result.LANG,
    }),
    // 获取关联产品
    await getAssociateProduct({
      productInfo: result.productInfo,
    }),
  ]);
  result.productInfo.associateProduct = associateProduct;
  result.mediaDisplayList = mediaDisplayList;
  result.navList = navList;
  return result;
}

// 获取类型
async function getMediaDisplayList({ productInfo, LANG }) {
  if (productInfo) {
    const list = [];
    if (productInfo.image_list.length > 0) {
      list.push({
        type: "image",
        icon_src: `${process.env.NEXT_PUBLIC_IMAGE}/icon/media-image.svg`,
        text: LANG["store.product.image"],
        image_list: productInfo.image_list,
      });
    }
    if (productInfo.video_url) {
      list.push({
        type: "video",
        icon_src: `${process.env.NEXT_PUBLIC_IMAGE}/icon/media-play.svg`,
        text: LANG["store.product.product_introduce"],
        video_url: productInfo.video_url,
        video_cover: productInfo.video_cover,
      });
    }
    if (productInfo.three_d) {
      list.push({
        type: "3d",
        icon_src: `${process.env.NEXT_PUBLIC_IMAGE}/icon/media-three-3d.svg`,
        text: "3D",
        three_d: productInfo.three_d,
        three_d_background: productInfo.three_d_background,
      });
    }
    return list;
  } else {
    return null;
  }
}

// 生成产品Nav
async function getProductNavList({ productInfo, LANG }) {
  let navList = [];
  if (productInfo.mediaList?.length > 0) {
    navList.push({
      title: LANG["store.product.nav.overview"],
      href: "#product_overview",
    });
  }
  if (productInfo.associationsList?.length > 0) {
    navList.push({
      title: LANG["store.product.nav.specs"],
      href: "#product_specs",
    });
  }
  if (productInfo.associationsList?.length > 0) {
    navList.push({
      title: LANG["store.product.nav.package"],
      href: "#product_package",
    });
  }
  navList.push({
    title: LANG["store.product.nav.faq"],
    href: "#product_faq",
  });
  if (productInfo.reviewsList?.length > 0) {
    navList.push({
      title: LANG["store.product.nav.reviews"],
      href: "#product_reviews",
    });
  }
  return navList;
}

// 关联产品
async function getAssociateProduct({ productInfo }) {
  let newAssociateProduct = productInfo.associateProduct.filter(
    (item) => item.key !== productInfo.key
  );
  newAssociateProduct = newAssociateProduct.map(
    ({ reviewsList, image_list, ...item }) => {
      const totalScore = reviewsList.reduce((pre, cur) => pre + cur.score, 0);
      item.reviewScore = totalScore / reviewsList.length;
      item.reviewsNum = reviewsList.length;
      item.image = image_list[0].src;
      return item;
    }
  );
  return newAssociateProduct;
}

// 设置元信息
export async function generateMetadata({ params: { locale, productKey } }) {
  const area = cookies().get("area")?.value || "us";
  const { CONFIG, GOODLIST } = await getConfigDataV2({
    locale,
    area,
    configList: ["config", "good"],
  });
  const productInfo = await getProductInfo({
    productList: GOODLIST,
    productKey,
  });
  if (productInfo) {
    return {
      title: `${productInfo.indexConfig[0]?.page_title} - ${CONFIG["company.basic.company_name"]}`,
      description: productInfo.indexConfig[0]?.page_description,
      keywords: productInfo.indexConfig[0]?.page_keywords,
      metadataBase: new URL(productInfo.image_list[0].src),
      openGraph: {
        title: `${productInfo.indexConfig[0]?.page_title} - ${CONFIG["company.basic.company_name"]}`,
        description: productInfo.indexConfig[0]?.page_description,
        images: productInfo.image_list.map((item) => {
          return {
            url: item.src,
            width: 300,
            height: 300,
          };
        }),
      },
    };
  } else {
    return {
      title: CONFIG["company.basic.company_name"],
    };
  }
}

export default async function Product({ params: { locale, productKey } }) {
  const area = cookies().get("area")?.value || "us";
  const {
    LANG,
    CONFIG,
    GOODDISCOUNTFESTIVAL,
    productInfo,
    mediaDisplayList,
    navList,
  } = await getData({
    locale,
    area,
    productKey,
    configList: ["config", "language", "good", "goodDiscountFestival"],
  });

  return (
    <div className={styles.container}>
      {!productInfo || !productInfo?.comboList ? (
        <>
          <Loading height="80vh" />
          <NavigatorIndex />
        </>
      ) : (
        <>
          {/* 首屏信息配置 */}
          <section className={styles.main_content}>
            <div className={styles.left_content}>
              <GoodMediaDisplay
                LANG={LANG}
                options={mediaDisplayList}
                goodDiscountFestival={GOODDISCOUNTFESTIVAL}
                productInfo={productInfo}
              />
              <Countdown
                goodDiscountFestival={GOODDISCOUNTFESTIVAL}
                LANG={LANG}
              />
              <GoodMediaTabs options={mediaDisplayList} />
            </div>
            <div className={styles.right_content}>
              <div>
                <h1>{productInfo.name}</h1>
                {/* 配置的亮点 */}
                {productInfo.sellingList.length > 0 ? (
                  <ul className={styles.product_advantage}>
                    {productInfo.sellingList.map((item, index) => {
                      if (index > 3) {
                        return null;
                      } else {
                        return (
                          <li key={index}>
                            <span className={styles.product_advantage_symbol}>
                              ✅
                            </span>
                            {item.light}
                          </li>
                        );
                      }
                    })}
                  </ul>
                ) : null}
                {/* 价格配置 */}
                <GoodPrice
                  goodDiscountFestival={GOODDISCOUNTFESTIVAL}
                  LANG={LANG}
                />
                {/* 产品评价 */}
                {productInfo.reviewsList.length || productInfo.reviews_score ? (
                  <GoodReviewsRate
                    reviewsScore={productInfo.reviews_score}
                    reviewsNum={productInfo.reviews_num}
                    configList={productInfo.reviewsList}
                    LANG={LANG}
                  />
                ) : null}
                <div className={styles.line}></div>
                {/* 产品选项 */}
                {productInfo.typeList?.length > 0
                  ? productInfo.typeList.map((item, index) => {
                      return (
                        <GoodOptionList
                          key={index}
                          title={item.title}
                          options={item.options}
                          type={item.type}
                        />
                      );
                    })
                  : null}
                {/* 套餐列表 */}
                <GoodComboList
                  goodDiscountFestival={GOODDISCOUNTFESTIVAL}
                  LANG={LANG}
                  options={productInfo.comboList}
                />
              </div>
              <div>
                <GoodNumber LANG={LANG} />
                <GoodBtnList
                  goodDiscountFestival={GOODDISCOUNTFESTIVAL}
                  CONFIG={CONFIG}
                  LANG={LANG}
                  areaCode={area}
                  locale={locale}
                  productInfo={productInfo}
                />
                <GoodGuarantee LANG={LANG} CONFIG={CONFIG} />
              </div>
            </div>
          </section>
          <GoodNav navList={navList} />
          {/* <div className={styles.sec_line}></div> */}
          {/* 产品媒体列表 */}
          <GoodMediaList configList={productInfo.mediaList} LANG={LANG} />
          {/* 产品功能 */}
          <GoodFunctionList configList={productInfo.funcionList} LANG={LANG} />
          {/* 产品参数 */}
          <GoodAccessoriesList
            configList={productInfo.associationsList}
            LANG={LANG}
          />
          {/* 产品包装列表 */}
          <GoodPackageList configList={productInfo.packageList} LANG={LANG} />
          {/* 产品FAQ */}
          <GoodFaq
            LANG={LANG}
            CONFIG={CONFIG}
            configList={productInfo.faqList}
          />
          {/* 产品评论 */}
          <GoodReviewsContent
            configList={productInfo.reviewsList}
            LANG={LANG}
          />
          {/* 关联产品列表 */}
          {productInfo.associateProduct.length > 0 ? (
            <AssociateProductList
              products={productInfo.associateProduct}
              title={LANG["store.product.maybe_you_like"]}
            />
          ) : null}
          {/* 产品底部 */}
          <GoodFooter
            area={area}
            locale={locale}
            CONFIG={CONFIG}
            LANG={LANG}
            productInfo={productInfo}
            goodDiscountFestival={GOODDISCOUNTFESTIVAL}
            options={productInfo.comboList}
          />
          {/* <Script
            id="product-3d-script"
            defer
            type="module"
            src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
          ></Script> */}
          <Script
            id="store-product-ld-json"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                {
                  "@context": "https://schema.org/",
                  "@type": "Product",
                  name: productInfo.name,
                  image: productInfo.image_list.map((item) => item.src),
                  description: productInfo.description,
                  offers: {
                    "@type": "Offer",
                    price:
                      formatCurrency(
                        productInfo.comboList[0]?.areaInfo?.selling_price
                      ) ?? 99999,
                    priceCurrency:
                      productInfo.comboList[0]?.areaInfo?.currency ?? "USD",
                  },
                  sku: CONFIG["company.basic.company_name"],
                  mpn: productInfo.key,
                  brand: {
                    "@type": "Brand",
                    name: `${CONFIG["company.basic.company_name"]}`,
                  },
                },
                null,
                "\t"
              ),
            }}
          />
        </>
      )}
    </div>
  );
}
