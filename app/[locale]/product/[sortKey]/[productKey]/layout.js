/** @format */

import { notFound } from "next/navigation";
import BaseLayout from "./components/BaseLayout";
import { getProductPage } from "../../../../utils/getConfigData/getProductPage";

export async function generateMetadata({ params }) {
  const { locale, productKey, sortKey } = await params;
  const productPageData = await getProductPage({ locale, sortKey, productKey });
  const { CONFIG, productInfo } = productPageData;
  if (!productInfo?.key) {
    return {
      title: CONFIG?.["common.base"]?.company_name,
    };
  }
  return {
    title: `${productInfo.page_title} - ${CONFIG["common.base"]?.company_name}`,
    description: productInfo.page_description,
    keywords: productInfo.page_keywords,
    metadataBase: new URL(productInfo.image_list[0].src),
    openGraph: {
      title: `${productInfo.page_title} - ${CONFIG["common.base"]?.company_name}`,
      description: productInfo.page_description,
      images: productInfo.image_list.map((item) => {
        return {
          url: item.src,
          width: 300,
          height: 300
        };
      })
    }
  };
}

export default async function Layout({ children, params }) {
  const { locale, sortKey, productKey } = await params;
  const productPageData = await getProductPage({ locale, sortKey, productKey });
  const { LANG, CONFIG, productInfo: baseProductInfo } = productPageData;

  if (!baseProductInfo?.key) {
    notFound();
  }

  return (
    <BaseLayout
      locale={locale}
      sortKey={sortKey}
      productKey={productKey}
      LANG={LANG}
      CONFIG={CONFIG}
      isMobile={false}
      baseProductInfo={baseProductInfo}
      productInfo={baseProductInfo}
    >
      {children}
    </BaseLayout>
  );
}
