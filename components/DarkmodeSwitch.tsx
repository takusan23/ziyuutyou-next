"use client"

import { useEffect, useState } from "react"
import resolveConfig from "tailwindcss/resolveConfig"
import tailwindConfig from "../tailwind.config.js"
import IconParent from "./IconParent"
import LightModeIcon from "../public/icon/light_mode.svg"
import DarkModeIcon from "../public/icon/dark_mode.svg"

/**
 * Tailwind CSS のダークモードスイッチ
 * @see https://tailwindcss.com/docs/dark-mode
 */
export default function DarkmodeSwitch() {
    const [isDarkmode, setDarkmode] = useState(false)

    // 端末のテーマ設定をセットする
    // TODO 責務的にここでやるべきではない
    useEffect(() => {
        // Android のステータスバーの色をセットする <meta name="theme-color"> が初回時はないので作る
        // ない場合はここで作る
        if (!document.querySelector("meta[name='theme-color']")) {
            const metaElement = document.createElement('meta')
            metaElement.setAttribute('name', 'theme-color')
            document.head.append(metaElement)
        }

        // メディアクエリでダークモードかチェック
        const isDarkmode = window.matchMedia('(prefers-color-scheme: dark)').matches
        // すでに Tailwind CSS のダークモードが有効かどうか。サイズ変更したらリセットされちゃった
        const isCurrentDarkmode = document.documentElement.classList.contains('dark')
        setDarkmode(isDarkmode || isCurrentDarkmode)
    }, [])

    // 切替時のイベント
    useEffect(() => {
        // Tailwind CSS はクラス名でテーマ切り替えする
        if (isDarkmode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

        // 動的に Tailwind CSS のテーマを取得して、ステータスバーの色にする
        const colors = resolveConfig(tailwindConfig).theme?.colors
        if (colors) {
            const backgroundColor = isDarkmode ? colors['background']['dark'] : colors['background']['light']
            document.querySelector("meta[name='theme-color']")?.setAttribute('content', backgroundColor)
        }
    }, [isDarkmode])

    return (
        <label className="flex flex-row p-3 items-center select-none cursor-pointer">
            {/* peer をつけておくと、チェック true / false 時にそれぞれ指定する CSS をセットできる（ JS で動的に className を変化させる必要がない ） */}
            <input
                className="sr-only peer"
                type="checkbox"
                checked={isDarkmode}
                onChange={(ev) => setDarkmode(ev.target.checked)} />

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