"use client"

import { useEffect, useState } from "react"

/**
 * Tailwind CSS のダークモードスイッチ
 * @see https://tailwindcss.com/docs/dark-mode
 */
export default function DarkmodeSwitch() {
    const [isDarkmode, setDarkmode] = useState(false)

    // 端末のテーマ設定をセットする
    // TODO 責務的にここでやるべきではない
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
        <label className="flex flex-row items-center select-none cursor-pointer p-2">
            {/* peer をつけておくと、チェック true / false 時にそれぞれ指定する CSS をセットできる（ JS で動的に className を変化させる必要がない ） */}
            <input
                className="sr-only peer"
                type="checkbox"
                checked={isDarkmode}
                onChange={(ev) => setDarkmode(ev.target.checked)} />
            <span className="text-content-text-light dark:text-content-text-dark flex grow">
                ダークモード
            </span>
            {/* チェックが付いたら左に寄せる、丸を大きくする（peer-checked:justify-end） */}
            <div className="h-8 w-14 flex flex-row items-center bg-container-primary-light dark:bg-container-primary-dark rounded-full border-content-primary-light dark:border-content-primary-dark border-2 p-1.5 peer-checked:p-0.5 justify-start peer-checked:justify-end">
                <div className="h-full aspect-square bg-content-primary-light dark:bg-content-primary-dark rounded-full" />
            </div>
        </label>
    )
}