import Script from "next/script"
import { GA_TRACKING_ID } from '../src/analytics/gtag'

/**
 * Google Analytics 4 で利用するJavaScriptを差し込むやつ
 * 
 * <Head> の中に書かないで下さい！
 */
const GoogleAnalyticsHead = () => {
    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
            <Script
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_TRACKING_ID}');
                    `,
                }} />
        </>
    )
}

export default GoogleAnalyticsHead