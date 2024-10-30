import Script from "next/script";

export default function CustomService() {
  console.log(`'${process.env.NEXT_PUBLIC_SMARTSUPP_KEY}'`);
  return (
    <>
      <Script
        dangerouslySetInnerHTML={{
          __html: `
                var _smartsupp = _smartsupp || {};
                _smartsupp.key = '${process.env.NEXT_PUBLIC_SMARTSUPP_KEY}';
                window.smartsupp||(function(d) {
                var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
                s=d.getElementsByTagName('script')[0];c=d.createElement('script');
                c.type='text/javascript';c.charset='utf-8';c.async=true;
                c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
                })(document);
            `,
        }}
        on
      />
    </>
  );
}
