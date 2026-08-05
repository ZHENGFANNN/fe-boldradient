import React from "react";
import styles from "./index.module.scss";
import { useRouter } from "next/navigation";
import GlobalContext from "@/[locale]/context";
import { COOKIE_ALERT_REGION_LIST } from "@/components/Layout/CookieModal/const";
import { setCookieConsent } from "@/hooks/useCookieConsent";
import { defaultLocale } from "@/config/languageSettings";
import { track } from "@/utils/analytics";
import Button from "@/components/Button";

function CookieSetting({ showCookieSetting }, ref) {
  const router = useRouter();
  const { LANG, locale, area, areaReady } = React.useContext(GlobalContext);
  const contentRef = React.useRef();
  const [show, setShow] = React.useState(false);
  const [firstRender, setFirstRender] = React.useState(true);
  const cookieModalRef = React.useRef();
  // Cookie 政策文章路由（sort=legal）；默认语言 en 无前缀，其它语言带 /{locale}。
  const cookiePolicyPath =
    locale && locale !== defaultLocale
      ? `/${locale}/article/legal/cookie-policy`
      : "/article/legal/cookie-policy";

  const handleClick = React.useCallback(
    (e) => {
      const key = e.target.getAttribute("data-key");
      if (key === "cookie-preferences") {
        showCookieSetting();
      } else if (key === "cookie-policy") {
        // 关闭横幅并软跳转到 Cookie 政策文章页，避免整页硬刷。
        e.preventDefault();
        setShow(false);
        router.push(cookiePolicyPath);
      }
      // 上报走 data-event 冒泡，见 dangerouslySetInnerHTML 内的属性
    },
    [showCookieSetting, router, cookiePolicyPath]
  );

  React.useEffect(() => {
    if (!firstRender && contentRef.current) {
      const observer = new MutationObserver(() => {
        const $domList = contentRef.current.querySelectorAll("[data-key]");
        $domList.forEach(($dom) => {
          $dom.addEventListener("click", handleClick);
        });
      });

      observer.observe(contentRef.current, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
      };
    }
  }, [firstRender, contentRef, handleClick]);

  // 写偏好并广播（setCookieConsent 内部 localStorage + dispatch），使脚本 gate 即时响应。
  const setCookiePermissions = React.useCallback((list) => {
    setCookieConsent(list);
  }, []);

  React.useImperativeHandle(ref, () => ({
    show: () => {
      setFirstRender(false);
      setTimeout(() => {
        setShow(true);
      }, 0);
    },
    close: () => {
      setShow(false);
    },
  }));

  React.useEffect(() => {
    // 必须等 area cookie 就绪再判：useArea 首帧 area=undefined、mount 后才填，
    // 否则本 effect（原 [] 依赖）在 area 未就绪时判 includes(undefined)=false → 横幅永不弹。
    if (!areaReady) return;
    const cookiePermissionsList = localStorage.getItem(
      "cookie_permissions_list"
    );
    // 无 area cookie 时按站点默认 us（与 BottomModule/readClientArea 一致），否则横幅对默认访客不弹。
    const effectiveArea = area || "us";
    if (
      !cookiePermissionsList &&
      COOKIE_ALERT_REGION_LIST.includes(effectiveArea)
    ) {
      const timer = setTimeout(() => {
        track("cookie-alert-view");
        setFirstRender(false);
        setTimeout(() => {
          setShow(true);
        }, 100);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [areaReady, area]);

  if (firstRender) return null;

  return (
    <div className={styles.modal} data-show={show} ref={cookieModalRef}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.title}>
            {LANG["common.cookie.cookie_alert.title"]}
          </div>
          <div
            ref={contentRef}
            className={styles.desc}
            dangerouslySetInnerHTML={{
              __html: LANG["common.cookie.cookie_alert.content"]
                ?.replace(
                  "$1",
                  `<a data-key='cookie-preferences' data-event='cookie-alert-setting-preferences'>${LANG["common.cookie.cookie_perferences"]}</a>`
                )
                ?.replace(
                  "$2",
                  `<a href='${cookiePolicyPath}' data-key='cookie-policy' data-event='cookie-alert-setting-policy'>${LANG["common.cookie.cookie_policy"]}</a>`
                ),
            }}
          />
        </div>
        <div className={styles.btn_container}>
          <Button
            variant="secondary"
            size="small"
            className={styles.btn}
            data-event="cookie-alert-btn-required-only"
            onClick={() => {
              setShow(false);
              setCookiePermissions([]);
            }}
          >
            {LANG["common.cookie.cookie_alert.required_only"]}
          </Button>
          <Button
            variant="primary"
            size="small"
            className={styles.btn}
            data-event="cookie-alert-btn-accept-all"
            onClick={() => {
              setShow(false);
              setCookiePermissions(["functional", "analytical", "marketing"]);
            }}
          >
            {LANG["common.cookie.cookie_alert.accept_all"]}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default React.forwardRef(CookieSetting);
