import MarkdownParser from "../../src/MarkdownParser"
import type { RootContent, Element } from "hast"
import { FallbackElement } from "./DefaultRenderer"
import EnvironmentTool from "../../src/EnvironmentTool"
import Link from "next/link"
import ShikiCodeBlockRender from "./ShikiCodeBlockRender"
import HeadingElement from "./HeadingRender"
import { whitespace } from "hast-util-whitespace"

/**
 * 自前で描画するタグ <HtmlElementRender />
 * 自前で描画する場合、タグの中で使うタグも自前で描画する必要があります（table なら thead とか）
 */
const ReBuildHtmlElementTagNames = ["br", "p", "a", "img", "strong", "ul", "li", "table", "thead", "tbody", "tr", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "code"] as const

/** ReBuildHtmlElementTagNames を union にしたもの */
type ReBuildHtmlElementTypes = typeof ReBuildHtmlElementTagNames[number]

/** MarkdownView に渡す Props */
type MarkdownViewProps = {
    /** Markdown 本文 */
    markdown: string
}

/** MarkdownNodeRender に渡す Props */
type HtmlElementRenderProps = {
    /** 各要素 */
    element: RootContent
}

/** HTML AST の element を受け取って、自前で描画する */
function HtmlElementRender({ element }: HtmlElementRenderProps) {

    // "element" 以外はここでふるい落とす
    // text は <p> の中身などで使っている
    switch (element.type) {
        case "comment": return <></>
        case "doctype": return <></>
        case "raw": return <></>
        // HTML 的に空白とかはむしろエラーになるので、空の文字列は return
        // 例: In HTML, whitespace text nodes cannot be a child of <table>.
        case "text": return whitespace(element.value) ? <></> : <>{element.value}</>
        case "element": break
    }

    // 子が居て、かつ子の中がすべて自分で描画できるもののみ。一つでも無理なら unified に投げる
    // <p> の中で <div> を使うことが出来ないため
    if (element.children.filter((node) => node.type === "element").every((element) => ReBuildHtmlElementTagNames.includes(element.tagName as any)) === false) {

        // 自前で描画したはずなのに、unified にフォールバックしている場合
        // 不具合を見つけやすくするため、ここで原因を出力しておく
        const parentTagName = element.tagName
        const childTagNameList = element.children.filter((node) => node.type === "element").map((element) => element.tagName)
        console.log(`HTML の作成を unified へフォールバックしました。親=${parentTagName} 子=${childTagNameList}`)

        // 自前で描画無理なので unified で HTML を作る
        return <FallbackElement content={element} />
    }

    // 子を持つ場合は再帰
    const childrenHtml = element.children.map((node, index) => <HtmlElementRender key={index} element={node} />)

    // 自前で作っている部分
    const tagName = element.tagName as ReBuildHtmlElementTypes
    switch (tagName) {

        // br
        case "br":
            return <br />

        // p
        case "p":
            return <p className="my-4 text-content-text-light dark:text-content-text-dark wrap-break-word">{childrenHtml}</p>

        // img
        // 画像読み込みを遅延させたい
        case "img":
            return <img className="max-w-[80%]" loading="lazy" src={element.properties['src']?.toString()} alt={element.properties['alt']?.toString()} />

        // a
        // サイト内の遷移の場合は next/link にする
        case "a":
            const href = element.properties['href']?.toString()
            if (href?.startsWith(EnvironmentTool.BASE_URL)) {
                return <Link href={href}>{childrenHtml}</Link>
            } else {
                return <a href={href}>{childrenHtml}</a>
            }

        // 太字
        case "strong":
            return <strong>{childrenHtml}</strong>

        // 箇条書き
        case "ul":
            return <ul className="list-disc m-[revert] p-[revert]">{childrenHtml}</ul>
        case "li":
            return <li>{childrenHtml}</li>

        // テーブル
        case "table":
            return <table className="w-full p-3 border-collapse border-b-spacing-0 border-b-[1px] border-b-content-primary-light dark:border-content-primary-dark">{childrenHtml}</table>
        case "tr":
            return <tr className="border-b-[1px] border-b-content-primary-light dark:border-b-content-primary-dark">{childrenHtml}</tr>
        case "td":
            return <td className="p-3 text-center">{childrenHtml}</td>
        case "th":
            return <th className="p-3 text-center">{childrenHtml}</th>
        case "thead":
            return <thead>{childrenHtml}</thead>
        case "tbody":
            return <tbody>{childrenHtml}</tbody>

        // h1 h2 ...
        // Tailwind CSS で色付けをする
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            return <HeadingElement tagName={tagName} element={element}>{childrenHtml}</HeadingElement>

        // コードブロック
        // pre の中の code を見る
        // language-... の prefix を消してから shiki へ
        case "pre":
            const codeElement = element.children[0] as Element
            const textNode = codeElement.children[0]
            const code = textNode.type === "text" ? textNode.value : ""
            const lang = codeElement.properties?.['className']?.[0]?.replace('language-', '') ?? ""
            return <ShikiCodeBlockRender code={code} language={lang} />

        // 単発コード
        // 複数行は pre で全部やるので、ここに来ない
        case "code":
            return <code className="px-2 rounded-md bg-gray-200">{childrenHtml}</code>
    }
}

/**
 * Markdown を unified にかけて、部分的に時前で描画する
 * @see MarkdownParser
 */
export default async function MarkdownRender({ markdown }: MarkdownViewProps) {
    // Markdown から HTML AST を取得する
    const htmlAst = await MarkdownParser.parseMarkdownToHtmlAst(markdown)

    // 各要素を受け取って組み立てる
    // 一部の element (HTML タグ) は自前で描画する（リンクカード作りたい）
    const nodeJsxList = htmlAst.children.map((node, index) => <HtmlElementRender key={index} element={node} />)

    return (
        <div className="content_div">
            {nodeJsxList}
        </div>
    )
}