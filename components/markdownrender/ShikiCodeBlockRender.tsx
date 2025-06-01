import { codeToHtml } from "shiki"
import CopyButton from "./CopyButton"

/** ShikiCodeBlockRender へ渡す Props */
type ShikiCodeBlockRenderProps = {
    /** コード本文 */
    code: string
    /** 言語。未指定の場合は plaintext */
    language?: string
}

/** shiki を使ってシンタックスハイライトした後描画するコードブロック */
export default async function ShikiCodeBlockRender({ code, language }: ShikiCodeBlockRenderProps) {
    const trimCode = code.trimEnd()
    const option = {
        lang: language ?? 'plaintext',
        theme: 'dark-plus'
    }
    let syntaxHighlightingCode: string
    try {
        // Markdown のコードブロックの言語を尊重する
        syntaxHighlightingCode = await codeToHtml(trimCode, option)
    } catch (e) {
        // 失敗したら plaintext で再試行
        syntaxHighlightingCode = await codeToHtml(trimCode, { ...option, lang: 'plaintext' })
    }

    return (
        <div className="relative group">
            <div className="[&>pre]:overflow-x-scroll [&>pre]:p-4 [&>pre]:my-4" dangerouslySetInnerHTML={{ __html: syntaxHighlightingCode }} />
            <CopyButton text={code} />
        </div>
    )
}
