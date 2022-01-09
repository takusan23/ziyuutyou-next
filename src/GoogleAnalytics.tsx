import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect } from "react"

/**
 * 参考
 * 
 * https://github.com/vercel/next.js/tree/master/examples/with-google-analytics
 * 
 * GA4 と UA を共存させる。GA4に移行しても良いんだけど、今までの記録が引き継がれないみたいなので...
 */

/** Google アナリティクス (UA) の 測定ID */
export const UA_TRACKING_ID = `UA-149954537-2`

/** Google アナリティクス (GA4) の 測定ID */
export const GA_TRACKING_ID = `G-LH09FLQ8DX`

/**
 * ページ遷移のたびに呼ぶ
 * 
 * @param {string} url うらる
 */
const pageview = (url) => {
    (window as any).gtag('config', UA_TRACKING_ID, {
        page_path: url,
    });
    (window as any).gtag('config', GA_TRACKING_ID, {
        page_path: url,
    });
}

/** Google Analytics へnext/routerのページ遷移の状態を通知する */
export const useGoogleAnalytics = () => {
    // Google アナリティクスへページ遷移を通知
    const router = useRouter()
    useEffect(() => {
        const handleRouteChange = (url: string) => {
            pageview(url)
        }
        router.events.on('routeChangeComplete', handleRouteChange)
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange)
        }
    }, [router.events])
}

/** Google Analytics 4 で利用するJavaScriptを差し込むやつ */
export const GoogleAnalyticsHead = () => {
    return (
        <>
            <Head>
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${UA_TRACKING_ID}`}></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${UA_TRACKING_ID}');
                        gtag('config', '${GA_TRACKING_ID}');
                    `}}
                />
            </Head>
        </>
    )
}
