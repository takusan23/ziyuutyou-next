import { ThemeProvider } from '@mui/material/styles';
import { useEffect } from "react"
import Layout from "../components/Layout"
import theme from "../tools/ZiyuutyouTheme"

/**
 * Androidで言うところのActivity。この中でPages(AndroidでいうとFragment)を切り替える
 */
const App = ({ Component, pageProps }) => {

    // Next.jsではMaterial-UIの設定が必要。
    // useEffectはJetpackComposeで言うところのLaunchedEffectのようなもの
    useEffect(() => {
        const jssStyles = document.querySelector('#jss-server-side')
        jssStyles?.parentElement?.removeChild(jssStyles)
    }, [])

    return (
        <>
            <ThemeProvider theme={theme}>
                {/* ナビゲーションドロワーとタイトルバーをAppで描画する。各Pageでは描画しない */}
                <Layout>
                    {/* 各Pageはここで切り替える。これでタイトルバー等は共通化される */}
                    <Component {...pageProps} />
                </Layout>
            </ThemeProvider>
        </>
    )
}

export default App