"use client"

import { useEffect, useState } from "react"

/**
 * Tailwind CSS のダークモードスイッチ
 * @see https://tailwindcss.com/docs/dark-mode
 */
export default function DarkmodeSwitch() {
    const [isDarkmode, setDarkmode] = useState(false)

    // 端末のテーマ設定をセットする
    useEffect(() => {
        // On page load or when changing themes, best to add inline in `head` to avoid FOUC
        const isDarkmode = window.matchMedia('(prefers-color-scheme: dark)').matches
        setDarkmode(isDarkmode)
    }, [])

    // 切替時のイベント
    useEffect(() => {
        if (isDarkmode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDarkmode])

    return (
        <label className="flex flex-row items-center select-none cursor-pointer">
            <input
                type="checkbox"
                checked={isDarkmode}
                onChange={(ev) => setDarkmode(ev.target.checked)} />
            <span>ダークモード</span>
        </label>
    )
}