import Script from "next/script"
import EnvironmentTool from './EnvironmentTool'

/**
 * 参考
 * 
 * https://github.com/vercel/next.js/tree/master/examples/with-google-analytics
 * 
 * UA は終わるので、GA4 へのみ送っています。
 */

/** Google アナリティクス (GA4) の 測定ID */
const GA_TRACKING_ID = EnvironmentTool.GA_TRACKING_ID

/** 開発モード。本番（意味深）だけアナリティクスを動作させるため */
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Google Analytics 4 で利用するJavaScriptを差し込むやつ。本番（意味深）のみ実行
 * Hooks でページ遷移イベントを送るのはもうやめました（めんどい）、GA4 の「ブラウザの履歴イベントに基づくページの変更」を有効にしてください。
 */
export default function GoogleAnalytics() {
    // 本番時のみ GoogleAnalytics をセットアップする
    return (
        <>
            {!isDevelopment && <>
                <Script
                    strategy="afterInteractive"
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                />
                <Script
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_TRACKING_ID}');
                    `}}
                />
            </>}
        </>
    )
}