import { ThemeProvider } from '@mui/material/styles'
import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import useCustomTheme from '../src/ZiyuutyouTheme'
import useMediaQuery from '@mui/material/useMediaQuery'
// シンタックスハイライトのCSS
import 'highlight.js/styles/vs2015.css'
// テーブルとかスクロールバーのCSS
import '../styles/css/styles.css'
import { GoogleAnalyticsHead, useGoogleAnalytics } from '../src/GoogleAnalytics'

/**
 * Androidで言うところのActivity。この中でPages(AndroidでいうとFragment)を切り替える
 */
const App = ({ Component, pageProps }) => {
    // ダークモードスイッチ
    const [isDarkmode, setDarkmode] = useState(false)
    // テーマ。カスタムフック？何もわからん
    const theme = useCustomTheme(isDarkmode)

    // システム設定がダークモードならダークモードにする。Win10で確認済み
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    // システム設定のダークモード切り替え時にテーマも切り替え
    useEffect(() => {
        setDarkmode(prefersDarkMode)
    }, [prefersDarkMode])

    // Next.jsではMaterial-UIの設定が必要。
    // useEffectはJetpackComposeで言うところのLaunchedEffectのようなもの
    useEffect(() => {
        const jssStyles = document.querySelector('#jss-server-side')
        jssStyles?.parentElement?.removeChild(jssStyles)
    }, [])

    // GoogleAnalyticsへnext/routerのページ遷移を通知する。
    useGoogleAnalytics()

    return (
        <>            
            {/* Google アナリティクス GA4 / UA */}
            <GoogleAnalyticsHead />

            <ThemeProvider theme={theme}>
                {/* ナビゲーションドロワーとタイトルバーをAppで描画する。各Pageでは描画しない */}
                <Layout
                    isDarkmode={isDarkmode}
                    onDarkmodeChange={() => setDarkmode(!isDarkmode)}
                >
                    {/* 各Pageはここで切り替える。これでタイトルバー等は共通化される */}
                    <Component {...pageProps} />
                </Layout>
            </ThemeProvider>
        </>
    )
}

export default App