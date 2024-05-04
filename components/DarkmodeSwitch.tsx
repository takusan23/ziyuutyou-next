"use client"

import IconParent from "./IconParent"
import LightModeIcon from "../public/icon/light_mode.svg"
import DarkModeIcon from "../public/icon/dark_mode.svg"
import useTheme from "./theme/useTheme"

/**
 * Tailwind CSS のダークモードスイッチ
 * 実際の切り替え処理は {@link useTheme}、{@link ApplyThemeToTailwindCss}などを参照。
 */
export default function DarkmodeSwitch() {
    const { theme, setTheme } = useTheme()

    return (
        <label className="flex flex-row p-3 items-center select-none cursor-pointer">
            {/* peer をつけておくと、チェック true / false 時にそれぞれ指定する CSS をセットできる（ JS で動的に className を変化させる必要がない ） */}
            <input
                className="sr-only peer"
                type="checkbox"
                checked={theme === 'dark'}
                onChange={(ev) => {
                    const isChecked = ev.target.checked
                    setTheme(isChecked ? 'dark' : 'light')
                }} />

            <div className="flex peer-checked:hidden">
                <IconParent>
                    <LightModeIcon />
                </IconParent>
            </div>
            <div className="hidden peer-checked:flex">
                <IconParent>
                    <DarkModeIcon />
                </IconParent>
            </div>

            <span className="text-content-text-light dark:text-content-text-dark flex grow ml-4">
                ダークモード
            </span>
            {/* チェックが付いたら左に寄せる、丸を大きくする（peer-checked:justify-end） */}
            <div className="h-8 w-14 flex flex-row items-center rounded-full border-content-primary-light dark:border-content-primary-dark border-2 p-1.5 peer-checked:p-0.5 justify-start peer-checked:justify-end">
                <div className="h-full aspect-square bg-content-primary-light dark:bg-content-primary-dark rounded-full" />
            </div>
        </label>
    )
}