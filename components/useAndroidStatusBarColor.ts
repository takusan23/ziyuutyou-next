"use client"

import { useEffect, useRef } from "react"

/**
 * Androidのステータスバーに色を設定する
 * AppRouter だと next/head が使えない。多分現状クライアントコンポーネントで head の中身を変える方法が Next.js にはなさそう？
 * 仕方ないので、DOM を触る。
 * 
 * @param colorCode カラーコード
 */
export default function useAndroidStatusBarColor(colorCode: string) {
    const statusBarColorMeta = useRef<HTMLMetaElement>()

    // 追加する
    useEffect(() => {
        statusBarColorMeta.current = document.createElement('meta')
        statusBarColorMeta.current.setAttribute('name', 'theme-color')
        document.head.append(statusBarColorMeta.current)
    }, [])

    // 色が変化したら更新する
    useEffect(() => {
        statusBarColorMeta.current?.setAttribute('content', colorCode)
    }, [colorCode])
}
