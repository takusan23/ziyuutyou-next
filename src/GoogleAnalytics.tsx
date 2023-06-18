// クライアント側で動く
"use client"

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from "next/script"

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

/** 開発モード。本番（意味深）だけアナリティクスを動作させるため */
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * ページ遷移のたびに呼ぶ
 * 
 * @param {string} url うらる
 */
const pageview = (url: string) => {
    // 本番のみ実行
    if (isDevelopment) {
        return
    }
    (window as any).gtag('config', UA_TRACKING_ID, {
        page_path: url,
    });
    (window as any).gtag('config', GA_TRACKING_ID, {
        page_path: url,
    });
}

/** Google Analytics 4 で利用するJavaScriptを差し込むやつ。本番（意味深）のみ実行 */
export default function GoogleAnalytics() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Google Analytics へnext/routerのページ遷移の状態を通知する
    useEffect(() => {
        const url = `${pathname}?${searchParams}`
        pageview(url)
    }, [pathname, searchParams])

    // 本番ビルド時のみ GoogleAnalytics をセットアップする
    return (
        <>
            {!isDevelopment && <>
                <Script
                    strategy="afterInteractive"
                    src={`https://www.googletagmanager.com/gtag/js?id=${UA_TRACKING_ID}`}
                    dangerouslySetInnerHTML={{
                        __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${UA_TRACKING_ID}');
                        gtag('config', '${GA_TRACKING_ID}');
                    `}}
                />
            </>}
        </>
    )
}