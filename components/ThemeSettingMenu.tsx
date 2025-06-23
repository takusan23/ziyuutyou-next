"use client"

import { ReactNode } from "react"
import useTheme from "./theme/useTheme"
import IconParent from "./IconParent"
import ExpandMoreIcon from "../public/icon/expand_more.svg"
import FormatPaintIcon from "../public/icon/format_paint.svg"
import LightModeIcon from "../public/icon/light_mode.svg"
import DarkModeIcon from "../public/icon/dark_mode.svg"
import DevicesIcon from "../public/icon/devices.svg"

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
        <div className="flex flex-col flex-1 space-y-1 cursor-pointer" onClick={onClick}>
            <div className={`flex flex-col items-center rounded-full mx-1 ${iconBackgroundCss}`}>
                <IconParent>
                    {icon}
                </IconParent>
            </div>
            <p className="self-center text-content-text-light dark:text-content-text-dark">
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
            <summary className="flex flex-row items-center space-x-4 list-none p-3 rounded-full hover:bg-hover-light dark:hover:bg-hover-dark">
                <IconParent>
                    <FormatPaintIcon />
                </IconParent>
                <p className="flex-1 text-content-text-light dark:text-content-text-dark text-base">
                    テーマ設定
                </p>
                <IconParent className="group-open:rotate-180 fill-content-primary-light dark:fill-content-primary-dark">
                    <ExpandMoreIcon />
                </IconParent>
            </summary>

            {/* 展開したときに出るボタンたち */}
            <div className="flex flex-row justify-center p-2 rounded-2xl bg-container-primary-light dark:bg-container-primary-dark">
                <ThemeMenuButton
                    name="ライト"
                    isSelected={theme === "light"}
                    icon={<LightModeIcon />}
                    onClick={() => setTheme('light')} />
                <ThemeMenuButton
                    name="ダーク"
                    isSelected={theme === "dark"}
                    icon={<DarkModeIcon />}
                    onClick={() => setTheme('dark')} />
                <ThemeMenuButton
                    name="システム"
                    isSelected={theme === "system"}
                    icon={<DevicesIcon />}
                    onClick={() => setTheme('system')} />
            </div>
        </details>
    )
}
