import { Metadata } from "next"
import { Suspense } from "react"
import GoogleAnalytics from "../src/GoogleAnalytics"
import localFont from "next/font/local"
import NavigationDrawer from "../components/NavigationDrawer"
import ResponsiveLayout from "../components/ResponsiveLayout"
import ApplyThemeToTailwindCss from "../components/theme/ApplyThemeToTailwindCss"
import EnvironmentTool from "../src/EnvironmentTool"
// グローバルCSS
import "../styles/css/global.css"

/** フォントを読み込む */
const koruriFont = localFont({
    // CSS 変数として使う
    variable: '--koruri-font',
    src: [
        { path: '../styles/css/fonts/Koruri-Regular.ttf' }
    ]
})

export const metadata: Metadata = {
    manifest: '/manifest.json',
    // テスト用。検索結果に乗らないようクローラーを指示する
    robots: {
        index: !EnvironmentTool.NO_INDEX_MODE
    }
}

/** 共通レイアウト部分 */
export default function RootLayout({ children, }: { children: React.ReactNode }) {
    return (
        <html className={koruriFont.variable}>
            <body className="font-body bg-background-light dark:bg-background-dark">

                {/* レスポンシブデザイン。画面の幅が大きいときにドロワーが表示される */}
                <ResponsiveLayout
                    navigationDrawer={<NavigationDrawer />}
                    title={<p className="text-content-primary-light dark:text-content-primary-dark text-2xl">たくさんの自由帳</p>}
                >
                    {children}
                </ResponsiveLayout>

                {/* GoogleAnalytics */}
                <Suspense fallback={null}>
                    <GoogleAnalytics />
                </Suspense>

                {/* テーマ変更を検知して Tailwind CSS へ適用するやつ */}
                <ApplyThemeToTailwindCss />
            </body>
        </html>
    )
}
