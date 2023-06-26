"use client"

import { ReactNode, useState } from "react"
import MenuIcon from "../public/icon/material-menu.svg"

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

    return (
        <div className="flex flex-row">

            {/* 大きい画面の時のナビゲーションドロワー。デフォルトで消しておいて、sm 以上なら出す。 */}
            {/* （多分まずスマホの振る舞いを書いてから、それ以上のサイズの振る舞いを書くのが良さそう？） */}
            <div className="hidden sm:block">
                {navigationDrawer}
            </div>

            {
                // ナビゲーションドロワー 出す場合
                isDrawerOpen && (
                    <>
                        {/* fixed で画面の上に重ねる */}
                        <div className="fixed z-10">
                            <div className="flex flex-row h-screen w-screen">
                                {/* ナビゲーションドロワー */}
                                <div className="flex-none drop-shadow-md bg-background-light">
                                    {navigationDrawer}
                                </div>
                                {/* ナビゲーションドロワー以外を押したら閉じるように */}
                                <div className="grow bg-background-light opacity-80" onClick={() => setDrawerOpen(false)} />
                            </div>
                        </div>
                    </>
                )
            }

            <main className="flex flex-col grow">
                {/* タイトル部分 */}
                <div className="flex flex-row items-center py-5">
                    {/* デフォルトで出しておいて、それ以上のサイズのときにドロワー展開ボタンを出す */}
                    <MenuIcon
                        className="h-6 w-6 ml-4 block cursor-pointer sm:hidden"
                        onClick={() => setDrawerOpen(!isDrawerOpen)}
                    />
                    <div className="ml-4">
                        {title}
                    </div>
                </div>
                {children}
            </main>
        </div>
    )
}