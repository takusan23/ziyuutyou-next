"use client"

import { ThemeTool } from "../../src/ThemeTool"
import useTheme from "./useTheme"
import { useEffect } from "react"

/**
 * テーマ設定を監視して、Tailwind CSS のクラスを書き換えるやつ。
 * レイアウトのルートらへんにおいておけばいいと思う。
 */
export default function ApplyThemeToTailwindCss() {
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
        const styles = getComputedStyle(document.documentElement)
        const backgroundColor = styles.getPropertyValue(isDarkmode ? "--color-background-dark" : "--color-background-light")
        document.querySelector("meta[name='theme-color']")?.setAttribute('content', backgroundColor)
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
        let isDarkMode = false
        if (theme === 'system') {
            isDarkMode = ThemeTool.getSystemTheme() === 'dark'
        } else {
            isDarkMode = theme === 'dark'
        }
        setTailwindThemeAndStatusBarColor(isDarkMode)
    }, [theme])

    return null
}