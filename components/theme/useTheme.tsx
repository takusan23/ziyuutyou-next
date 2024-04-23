import { useSyncExternalStore } from "react"
import { ThemeTool, Theme } from "../../src/ThemeTool"

const subscribe = (onStoreChange: () => void) => {
    window.addEventListener('storage', onStoreChange)
    return () => {
        window.removeEventListener('storage', onStoreChange)
    }
}
const getSnapshot = () => ThemeTool.readTheme()
const getServerSnapshot = () => 'light'

/**
 * テーマ用カスタムフック。
 * 現在のテーマ設定と、テーマ変更の関数を返します。
 */
export default function useTheme() {
    // useSyncExternalStore で localStorage と React のステートをつなげる
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    // 設定変更用関数
    function setTheme(theme: Theme) {
        ThemeTool.saveTheme(theme)
        // subscribe で通知が行くように
        window.dispatchEvent(new Event('storage'))
    }

    return { theme, setTheme }
}