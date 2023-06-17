// Material-UI を使うためクライアントコンポーネント
"use client"

import { ThemeProvider } from '@mui/material/styles'
import Layout from '../components/Layout'
import useCustomTheme from '../src/ZiyuutyouTheme'
import { useEffect, useState } from "react"
import useMediaQuery from '@mui/material/useMediaQuery'

/** ClientLayout へ渡す値  */
type ClientLayoutProps = {
    /** 子要素 */
    children: React.ReactNode
}

/** 共通レイアウト */
export default function ClientLayout({ children }: ClientLayoutProps) {
    // ダークモードスイッチ
    const [isDarkmode, setDarkmode] = useState(false)
    // テーマ
    const theme = useCustomTheme(isDarkmode)
    // システム設定がダークモードならダークモードにする。Win10で確認済み
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
    // システム設定のダークモード切り替え時にテーマも切り替え
    useEffect(() => {
        setDarkmode(prefersDarkMode)
    }, [prefersDarkMode])

    return (
        <>
            <ThemeProvider theme={theme}>
                {/* ナビゲーションドロワーとタイトルバーをAppで描画する。各Pageでは描画しない */}
                <Layout
                    isDarkmode={isDarkmode}
                    onDarkmodeChange={() => setDarkmode(!isDarkmode)}
                >
                    {/* 各Pageはここで切り替える。これでタイトルバー等は共通化される */}
                    {children}
                </Layout>
            </ThemeProvider>
        </>
    )
}