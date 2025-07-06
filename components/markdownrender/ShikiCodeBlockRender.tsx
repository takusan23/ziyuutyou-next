import { bundledLanguages, bundledThemes, createHighlighter } from "shiki"
import localFont from "next/font/local"
import dynamic from "next/dynamic"

const kosugiMaru = localFont({
    // CSS 変数として使う
    variable: '--kosugi-maru-font',
    src: [
        { path: '../../styles/css/fonts/KosugiMaru-Regular.ttf' }
    ]
})

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

/** テストが失敗するので、遅延ロードしている。 */
const DynamicCopyButton = dynamic(() => import('./CopyButton'))

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
        const highlighter = await highlighterPromise
        syntaxHighlightingCode = highlighter.codeToHtml(trimCode, option)
    } catch (e) {
        // 失敗したら plaintext で再試行
        if (process.env.NODE_ENV === "development") {
            console.log(`言語 ${option.lang} のシンタックスハイライトに失敗しました。plaintext にします。`)
        }
        const highlighter = await highlighterPromise
        syntaxHighlightingCode = highlighter.codeToHtml(trimCode, { ...option, lang: 'plaintext' })
    }

    return (
        <div className={kosugiMaru.variable}>
            <div className="relative group">
                <div
                    className={`[&>pre]:overflow-x-scroll [&>pre]:p-4 [&>pre]:my-4 [&_code]:font-(family-name:--kosugi-maru-font)`}
                    dangerouslySetInnerHTML={{ __html: syntaxHighlightingCode }} />
                <DynamicCopyButton text={code} />
            </div>
        </div>
    )
}
