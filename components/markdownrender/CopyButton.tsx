"use client"

import { useState } from "react"
import Icon from "../Icon"

/** CopyButton に渡す Props */
type CopyButtonProps = {
    /** コピー内容 */
    text: string
}

/** コピーボタン */
export default function CopyButton({ text }: CopyButtonProps) {
    // 一時的にアイコンを差し替える
    const [special, setSpecial] = useState(false)

    // 押したとき
    const execCopy = () => {
        (async () => {
            // コピー
            setSpecial(true)
            navigator.clipboard.writeText(text)

            // アイコン戻す
            await new Promise(resolve => setTimeout(resolve, 1_000))
            setSpecial(false)
        })()
    }

    return (
        <button className="hidden group-hover:flex p-2 m-2 absolute top-0 right-0 cursor-pointer rounded-md bg-background-dark border-2 border-content-primary-dark text-content-primary-dark" onClick={execCopy}>
            {
                special
                    ? <Icon iconStyle="mask-[url('/icon/celebration.svg')]" size="medium" color="currentColor" />
                    : <Icon iconStyle="mask-[url('/icon/content_paste.svg')]" size="medium" color="currentColor" />
            }
        </button>
    )
}