import "../../styles/globals.css";
import "../../styles/reset.css";

import Navbar from "@/components/Layout/NavBar";
import Footer from "@/components/Layout/Footer";

import getAllConfigData from "@/utils/getAllConfigData";

import React from "react";
import Layout from "@/components/Layout";

export default async function RootLayout(props) {
  const {
    children,
    params: { locale },
  } = props;
  const { CONFIG, LANG, GOODLIST, GOODSORTLIST } = await getAllConfigData(
    locale
  );
  return (
    <html lang="en">
      <body>
        <Layout>
          <Navbar
            LANG={LANG}
            CONFIG={CONFIG}
            GOODLIST={GOODLIST}
            GOODSORTLIST={GOODSORTLIST}
          />
          <div id="app-content">{children}</div>
          <Footer
            LANG={LANG}
            CONFIG={CONFIG}
            GOODLIST={GOODLIST}
            GOODSORTLIST={GOODSORTLIST}
          />
        </Layout>
      </body>
    </html>
  );
}
