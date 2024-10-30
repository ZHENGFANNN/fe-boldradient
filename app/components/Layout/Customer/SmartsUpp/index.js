import React from "react";
import Script from "next/script";
import GlobalContext from "@/[locale]/context";

export default function CustomService() {
  const { locale } = React.useContext(GlobalContext);

  React.useEffect(() => {
    window.smartsupp("language", `${locale}`);
  }, [locale]);

  return (
    <>
      <Script
        id="smarts-upp-customer-service"
        dangerouslySetInnerHTML={{
          __html: `
                var _smartsupp = _smartsupp || {};
                _smartsupp.key = '${process.env.NEXT_PUBLIC_SMARTS_UPP_KEY}';
                window.smartsupp||(function(d) {
                var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
                s=d.getElementsByTagName('script')[0];c=d.createElement('script');
                c.type='text/javascript';c.charset='utf-8';c.async=true;
                c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
                })(document);
            `,
        }}
      />
    </>
  );
}
