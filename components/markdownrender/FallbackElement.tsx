import type { RootContent } from "hast"
import { whitespace } from "hast-util-whitespace"
import MarkdownParser from "../../src/MarkdownParser"

/** FallbackElement に渡す Props */
type FallbackElementProps = {
    /** 各要素 */
    content: RootContent
}

/** フォールバック用。HTML を自前で組み立てる必要がないやつはこれ */
export async function FallbackElement({ content }: FallbackElementProps) {
    // 描画した所で空文字の場合は何もしない
    if (whitespace(content)) {
        return <></>
    } else {
        // TODO <br> がここに来ないようになったら className を消す
        return <div className="text-content-text-light dark:text-content-text-dark" id="fallback" dangerouslySetInnerHTML={{ __html: await MarkdownParser.buildHtmlFromHtmlAst(content) }} />
    }
}