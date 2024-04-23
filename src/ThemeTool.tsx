/** テーマ。ライトとダークどちらか。 */
export type Theme = 'light' | 'dark'

/**
 * テーマ設定用ユーティリティクラス
 * TODO 初回表示時にライトテーマになる問題を直したいが、<head> に介入できそうにない。
 * 
 * @see https://tailwindcss.com/docs/dark-mode
 */
export class ThemeTool {

    private static LOCAL_STORAGE_KEY_THEME = 'theme'

    /**
     * localStorage と、端末のダークモード設定からテーマ設定を取得する。
     * 
     * @returns {@link ThemeType}。ダークかライト。
     */
    static readTheme(): Theme {
        const readValue = localStorage.getItem(this.LOCAL_STORAGE_KEY_THEME)

        if (readValue) {
            // localStorage を優先する
            return readValue as Theme
        } else {
            // なければ端末の設定を考慮
            // メディアクエリでダークモードかチェック
            const isDarkmodeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)').matches
            return isDarkmodeMediaQuery ? 'dark' : 'light'
        }
    }

    /**
     * localStorage へテーマ設定を書き込む。
     * 
     * @param theme {@link Theme}。ダークかライト。
     */
    static saveTheme(theme: Theme) {
        localStorage.setItem(this.LOCAL_STORAGE_KEY_THEME, theme)
    }

}