"use client"

import { ReactNode, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import MenuIcon from "../public/icon/menu.svg"

// 定数
const NAVIGATION_DRAWER_WIDTH = 'w-[250px]'
const MAIN_WIDTH = 'w-[calc(100%-250px)]'

/** Scaffold へ渡すデータ */
type ResponsiveLayoutProps = {
    /** ナビゲーションドロワー */
    navigationDrawer: ReactNode
    /** タイトル */
    title: ReactNode
    /** 子要素 */
    children: ReactNode
}

/**
 * レイアウトの土台。
 * ナビゲーションドロワーは画面が大きいときに表示するなどをやる
 */
export default function ResponsiveLayout({ navigationDrawer, title, children }: ResponsiveLayoutProps) {
    const [isDrawerOpen, setDrawerOpen] = useState(false)

    // 画面遷移後にナビゲーションドロワーを消す
    const pathname = usePathname()
    useEffect(() => {
        setDrawerOpen(false)
    }, [pathname])

    return (
        <div className="flex flex-row w-full">

            {/* 大きい画面の時のナビゲーションドロワー。デフォルトで消しておいて、sm 以上なら出す。 */}
            {/* （多分まずスマホの振る舞いを書いてから、それ以上のサイズの振る舞いを書くのが良さそう？） */}
            <div className={`${NAVIGATION_DRAWER_WIDTH} hidden sm:block`}>
                {navigationDrawer}
            </div>

            {
                // ナビゲーションドロワー 出す場合
                // fixed で画面の上に重ねる
                isDrawerOpen && (
                    <div className="fixed z-10">
                        <div className="flex flex-row h-screen w-screen">
                            {/* ナビゲーションドロワー */}
                            <div className={`${NAVIGATION_DRAWER_WIDTH} flex-none drop-shadow-md bg-background-light dark:bg-background-dark`}>
                                {navigationDrawer}
                            </div>
                            {/* ナビゲーションドロワー以外を押したら閉じるように */}
                            <div
                                className="grow bg-background-light dark:bg-background-dark opacity-80"
                                onClick={() => setDrawerOpen(false)} />
                        </div>
                    </div>
                )
            }

            {/* 各ページの CSS でパーセント指定できるように、ここで width:100% を指定する */}
            <main className={`flex flex-col grow ${MAIN_WIDTH}`}>
                {/* タイトル部分。ナビゲーションドロワーが出る幅があれば出さない。 */}
                <div className="flex sm:hidden flex-row items-center py-5">
                    <MenuIcon
                        className="h-6 w-6 ml-4 cursor-pointer fill-content-primary-light dark:fill-content-primary-dark"
                        onClick={() => setDrawerOpen(!isDrawerOpen)}
                    />
                    <div className="ml-4">
                        {title}
                    </div>
                </div>
                {/* ページ切り替え */}
                <div>
                    {children}
                </div>
            </main>
        </div>
    )
}