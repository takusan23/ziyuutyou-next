import { Metadata } from "next"
import ClientLayout from "./ClientLayout"
import { Suspense } from "react"
import GoogleAnalytics from "../src/GoogleAnalytics"
// コードブロックのCSS
import "highlight.js/styles/vs2015.css"
// グローバルCSS
import "../styles/css/global.css"

export const metadata: Metadata = {
    manifest: '/manifest.json'
}

/** 共通レイアウト部分 */
export default function RootLayout({ children, }: { children: React.ReactNode }) {
    // クライアントコンポーネントとして描画する必要があるため
    return (
        <html>
            <body>
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
