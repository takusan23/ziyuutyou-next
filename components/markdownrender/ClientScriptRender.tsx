"use client"

import { createRef, ReactNode, useEffect } from "react"

/** ClientScriptRender へ渡す Props */
type ScriptRenderProps = {
    /** js の URL */
    src?: string
    /** application/javascript など */
    type?: string
    /** 子要素 */
    children: ReactNode
}

/** <script> タグを next/link の画面遷移でも動くようにしたもの */
export default function ClientScriptRender({ src, type, children }: ScriptRenderProps) {

    // クライアントで描画されたときに src / type をセットする
    // next/link の画面遷移では <script> のスクリプトが起動しない
    const divRef = createRef<HTMLDivElement>()
    useEffect(() => {
        // すでに div に追加していれば何もしない
        if (divRef.current?.querySelector('script')) return
        // 作成
        const scriptElement = document.createElement('script')
        scriptElement.src = src ?? ""
        scriptElement.type = type ?? ""
        // 追加
        divRef.current?.append(scriptElement)
        // 一応消しておく
        return () => { divRef.current?.removeChild(scriptElement) }
    }, [])

    return (
        <div ref={divRef}>
            {children}
        </div>
    )
}