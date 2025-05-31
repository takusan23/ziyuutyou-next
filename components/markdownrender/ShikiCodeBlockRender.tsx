import { codeToHtml } from "shiki"

/** ShikiCodeBlockRender へ渡す Props */
type ShikiCodeBlockRenderProps = {
    /** コード本文 */
    code: string
    /** 言語。未指定の場合は plaintext */
    language?: string
}

/** shiki を使ってシンタックスハイライトした後描画するコードブロック */
export default async function ShikiCodeBlockRender({ code, language }: ShikiCodeBlockRenderProps) {
    const syntaxHighlightingCode = await codeToHtml(
        code.trimEnd(),
        {
            lang: language ?? 'plaintext',
            theme: 'dark-plus'
        }
    )
    // この pre にスクロールバーと padding
    return <div className="[&>pre]:overflow-x-scroll [&>pre]:p-4" dangerouslySetInnerHTML={{ __html: syntaxHighlightingCode }} />
}
