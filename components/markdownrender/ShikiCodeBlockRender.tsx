import { codeToHtml } from "shiki"

type ShikiCodeBlockRenderProps = {
    code: string
    language?: string
}

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
