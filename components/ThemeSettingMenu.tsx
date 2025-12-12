"use client"

import { ReactNode } from "react"
import useTheme from "./theme/useTheme"
import Icon from "./Icon"

/** ThemeMenuButton へ渡す Props */
type ThemeMenuButtonProps = {
    /** 名前 */
    name: string
    /** アイコン */
    icon: ReactNode
    /** 選択中か */
    isSelected: boolean
    /** 押したとき */
    onClick: () => void
}

/** ライト・ダーク・システム メニューの各アイテム */
function ThemeMenuButton({ name, icon, isSelected, onClick }: ThemeMenuButtonProps) {
    const iconBackgroundCss = isSelected ? "bg-background-light dark:bg-background-dark" : ""
    return (
        <div className="flex flex-col flex-1 space-y-1 cursor-pointer text-content-text-light dark:text-content-text-dark" onClick={onClick}>
            <div className={`flex flex-col items-center rounded-full mx-1 ${iconBackgroundCss}`}>
                {icon}
            </div>
            <p className="self-center">
                {name}
            </p>
        </div>
    )
}

/**
 * Tailwind CSS のダークモード切り替えをするメニュー
 * 実際の切り替え処理は {@link useTheme}、{@link ApplyThemeToTailwindCss}などを参照。
 */
export default function ThemeSettingMenu() {
    const { theme, setTheme } = useTheme()

    return (
        <details open={false} className="group flex flex-col space-y-3 select-none cursor-pointer">

            {/* 展開してない時に出る部分 */}
            <summary className="flex flex-row items-center space-x-4 list-none p-3 rounded-full text-base text-content-text-light dark:text-content-text-dark hover:bg-hover-light dark:hover:bg-hover-dark">
                <Icon iconStyle="mask-[url('/icon/format_paint.svg')]" size="medium" color="currentColor" />
                <p className="flex-1">
                    テーマ設定
                </p>
                <Icon iconStyle="mask-[url('/icon/expand_more.svg')]" className="group-open:rotate-180" size="medium" color="currentColor" />
            </summary>

            {/* 展開したときに出るボタンたち */}
            <div className="flex flex-row justify-center p-2 rounded-2xl bg-container-primary-light dark:bg-container-primary-dark">
                <ThemeMenuButton
                    name="ライト"
                    isSelected={theme === "light"}
                    icon={<Icon iconStyle="mask-[url('/icon/light_mode.svg')]" size="medium" color="currentColor" />}
                    onClick={() => setTheme('light')} />
                <ThemeMenuButton
                    name="ダーク"
                    isSelected={theme === "dark"}
                    icon={<Icon iconStyle="mask-[url('/icon/dark_mode.svg')]" size="medium" color="currentColor" />}
                    onClick={() => setTheme('dark')} />
                <ThemeMenuButton
                    name="システム"
                    isSelected={theme === "system"}
                    icon={<Icon iconStyle="mask-[url('/icon/devices.svg')]" size="medium" color="currentColor" />}
                    onClick={() => setTheme('system')} />
            </div>
        </details>
    )
}
