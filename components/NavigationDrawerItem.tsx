"use client" // usePathname のため

import Link from "next/link"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

/** NavigationDraweItem へ渡すデータ */
type NavigationDrawerItemProps = {
    /** テキスト */
    title: string
    /** アイコン */
    icon: ReactNode
    /** 遷移先パス */
    path: string
}

/** ナビゲーションドロワーの各メニュー */
export default function NavigationDrawerItem({ title, icon, path }: NavigationDrawerItemProps) {
    // 今のパス
    const pathName = usePathname()
    // 選択中なら背景色。そうじゃない場合はホバー時に
    const backgroundStyle = pathName === path
        ? 'bg-hover-light hover:bg-hover-dark'
        : 'hover:bg-hover-light dark:hover:bg-hover-dark'

    return (
        <Link href={path}>
            <div className={`flex flex-row p-3 items-center space-x-4 rounded-full select-none cursor-pointer text-content-text-light dark:text-content-text-dark ${backgroundStyle}`}>
                {icon}
                <p className="text-base">
                    {title}
                </p>
            </div>
        </Link>
    )
}