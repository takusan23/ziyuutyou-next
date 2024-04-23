"use client"

import useTheme from "./useTheme"
import { useEffect } from "react"
import resolveConfig from "tailwindcss/resolveConfig"
import tailwindConfig from "../../tailwind.config.js"

/**
 * テーマ設定を監視して、Tailwind CSS のクラスを書き換えるやつ。
 * レイアウトのルートらへんにおいておけばいいと思う。
 */
export function ApplyThemeToTailwindCss() {
    const { theme } = useTheme()

    /**
     * Tailwind CSS とステータスバーの色をテーマ切り替え
     * @param isDarkmode ダークモードなら true
     */
    function setTailwindThemeAndStatusBarColor(isDarkmode: boolean) {
        // Tailwind CSS のテーマ
        if (isDarkmode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        // 動的に Tailwind CSS のテーマを取得して
        // ステータスバーの色にする
        const colors = resolveConfig(tailwindConfig).theme?.colors
        if (colors) {
            const backgroundColor = isDarkmode ? colors['background']['dark'] : colors['background']['light']
            document.querySelector("meta[name='theme-color']")?.setAttribute('content', backgroundColor)
        }
    }

    // Android のステータスバーの色をセットする <meta name="theme-color"> が初回時は無いので作る
    useEffect(() => {
        if (!document.querySelector("meta[name='theme-color']")) {
            const metaElement = document.createElement('meta')
            metaElement.setAttribute('name', 'theme-color')
            document.head.append(metaElement)
        }
    }, [])

    // カスタムフックの値変更を拾って Tailwind CSS のクラス指定する
    useEffect(() => {
        const isDarkMode = theme === 'dark'
        setTailwindThemeAndStatusBarColor(isDarkMode)
    }, [theme])

    return (<></>)
}