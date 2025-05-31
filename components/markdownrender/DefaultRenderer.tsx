import { createElement, ReactNode } from "react"
import type { RootContent, Element } from "hast"
import { whitespace } from "hast-util-whitespace"
import MarkdownParser from "../../src/MarkdownParser"

/** FallbackElement に渡す Props */
type FallbackElementProps = {
    /** 各要素 */
    content: RootContent
}

/** FallbackHtmlElement に渡す Props */
type FallbackHtmlElementProps = {
    /** 各要素 */
    element: Element
}

/** フォールバック用。HTML を自前で組み立てる必要がないやつはこれ */
export async function FallbackElement({ content }: FallbackElementProps) {
    // 描画した所で空文字の場合は何もしない
    if (whitespace(content)) {
        return <></>
    } else {
        return <div dangerouslySetInnerHTML={{ __html: await MarkdownParser.buildHtmlFromHtmlAst(content) }} />
    }
}

/** フォールバック用。HTML 要素を自前で組み立てる必要がないやつはこれ */
export async function FallbackHtmlElement({ element }: FallbackHtmlElementProps) {
    // 描画した所で空文字の場合は何もしない
    if (whitespace(element)) {
        return <></>
    } else {
        // 親のみ
        return <div dangerouslySetInnerHTML={{ __html: await MarkdownParser.buildHtmlFromHtmlAst(element) }} />
    }
}