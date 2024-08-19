/** @format */

import React from "react";
import styles from "./page.module.scss";
import getConfigData from "@/utils/getConfigData";
import Banner from "./components/Banner";
import ArticleInfo from "./components/ArticleInfo";
import ArticleNav from "./components/ArticleNav";
import AssociateArticle from "./components/AssociateArticle";
import IdJson from "./components/IdJson";
import BaseLayout from "../../components/BaseLayout";

import ProductModal from "./components/ProductModal";
import { cookies } from "next/headers";
import "@/styles/richtext.scss";

export const runtime = "edge";

const getData = async function ({
  area,
  locale,
  blogKey,
  sortKey,
  configList,
  configNameSpace,
}) {
  const { BLOG, CONFIG, LANG, GOODDISCOUNTFESTIVAL } = await getConfigData({
    locale,
    configNameSpace,
    configList,
  });
  // 文章分类
  const blogSort = BLOG.blogSortMap[sortKey];
  // 找到当前文章
  const blogArticle = BLOG.blogMap[`${sortKey}:${blogKey}`];

  return {
    BLOG,
    blogSort,
    blogArticle,
    CONFIG,
    LANG,
    GOODDISCOUNTFESTIVAL,
  };
};

export async function generateMetadata({
  params: { locale, blogKey, sortKey },
}) {
  const { blogArticle } = await getData({
    locale,
    blogKey,
    sortKey,
    configList: ["blog"],
  });

  const title = blogArticle.page_title;
  const description = blogArticle.page_description;
  const keywords = blogArticle.page_keywords;

  return {
    title,
    description,
    keywords,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [blogArticle.image], // Must be an absolute URL
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: blogArticle.image, // Must be an absolute URL
          width: 746,
          height: 420,
        },
      ],
    },
  };
}

export default async function Article({
  params: { locale, blogKey, sortKey },
}) {
  const area = cookies().get("area")?.value || "us";
  const {
    blogSort,
    blogArticle,
    CONFIG,
    LANG,
    BLOG: { blogSortMap },
    GOODDISCOUNTFESTIVAL,
  } = await getData({
    area,
    locale,
    blogKey,
    sortKey,
    configList: ["blog", "config", "language", "goodDiscountFestival"],
    configNameSpace: [
      "company.basic.company_name",
      "company.basic.customer_service",
    ],
    languageNameSpace: [
      "store.blog_index.all",
      "store.blog_index.title",
      "store.blog_index.related_products",
      "store.product.off",
      "store.product.no_stock",
      "store.product.reviews",
    ],
  });
  const blogSortList = Object.keys(blogSortMap)
    .map((item) => {
      const blogSort = blogSortMap[item];
      return {
        weight: blogSort.weight,
        key: blogSort.key,
        name: blogSort.name,
      };
    })
    .sort((a, b) => b.weight - a.weight);

  return (
    <>
      <BaseLayout blogSortList={blogSortList} sortKey={sortKey} LANG={LANG} />
      <div className={styles.container}>
        <IdJson CONFIG={CONFIG} article={blogArticle} />
        <div className={styles.flex_container}>
          {/* 导航栏 */}
          <ArticleNav titleList={blogArticle.titleList} />
          {/* 内容区 */}
          <div className={styles.flex_right}>
            <Banner article={blogArticle} />
            <div className={styles.content_container}>
              <h1 className={styles.title}>{blogArticle.title}</h1>
              <ArticleInfo
                article={blogArticle}
                sort={blogSort}
                locale={locale}
              />
              <div
                id="blog-article-content-html"
                className="wangeditor-rich-text-css"
                dangerouslySetInnerHTML={{
                  __html: blogArticle.content,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* 关联文章 */}
      {blogArticle.associateArticle.length > 0 ? (
        <AssociateArticle articleList={blogArticle.associateArticle} />
      ) : null}
      {/* 关联产品 */}
      {blogArticle.products?.length > 0 ? (
        <ProductModal
          LANG={LANG}
          goodDiscountFestival={GOODDISCOUNTFESTIVAL}
          productList={blogArticle.products}
          locale={locale}
        />
      ) : null}
    </>
  );
}
