import { Metadata } from "next"
import ClientLayout from "./ClientLayout"
import { Suspense } from "react"
import GoogleAnalytics from "../src/GoogleAnalytics"
import localFont from "@next/font/local"
// コードブロックのCSS
import "highlight.js/styles/vs2015.css"
// グローバルCSS
import "../styles/css/global.css"

/** フォントを読み込む */
const koruriFont = localFont({
    // CSS 変数として使う
    variable: '--koruri-font',
    src: [
        { path: '../styles/css/fonts/Koruri-Regular-sub.eot' },
        { path: '../styles/css/fonts/Koruri-Regular-sub.ttf' },
        { path: '../styles/css/fonts/Koruri-Regular-sub.woff' },
    ]
})

export const metadata: Metadata = {
    manifest: '/manifest.json'
}

/** 共通レイアウト部分 */
export default function RootLayout({ children, }: { children: React.ReactNode }) {
    // クライアントコンポーネントとして描画する必要があるため
    return (
        <html>
            <body className={koruriFont.variable}>
                {/* 共通レイアウト。ナビゲーションドロワーとか */}
                <ClientLayout children={children} />
                {/* GoogleAnalytics */}
                <Suspense fallback={null}>
                    <GoogleAnalytics />
                </Suspense>
            </body>
        </html>
    )
}
