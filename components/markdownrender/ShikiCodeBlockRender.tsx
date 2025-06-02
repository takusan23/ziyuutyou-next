import { bundledLanguages, bundledThemes, createHighlighter } from "shiki"
import CopyButton from "./CopyButton"

/**
 * シングルトンにする。
 * よく分からないけど、明示的にすべて読み込むようにしないと、たまによくビルドがが成功しない。
 * https://shiki.style/guide/install#highlighter-usage
 */
const highlighterPromise = createHighlighter({
    themes: Object.keys(bundledThemes),
    langs: Object.keys(bundledLanguages)
})

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

    const highlighter = await highlighterPromise
    let syntaxHighlightingCode: string
    try {
        // Markdown のコードブロックの言語を尊重する
        syntaxHighlightingCode = highlighter.codeToHtml(trimCode, option)
    } catch (e) {
        // 失敗したら plaintext で再試行
        console.log(`言語 ${option.lang} のシンタックスハイライトに失敗しました。plaintext にします。`)
        syntaxHighlightingCode = highlighter.codeToHtml(trimCode, { ...option, lang: 'plaintext' })
    }

    return (
        <div className="relative group">
            <div className="[&>pre]:overflow-x-scroll [&>pre]:p-4 [&>pre]:my-4" dangerouslySetInnerHTML={{ __html: syntaxHighlightingCode }} />
            <CopyButton text={code} />
        </div>
    )
}
