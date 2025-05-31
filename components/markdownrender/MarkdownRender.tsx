import Link from "next/link"
import type { RootContent, Element } from "hast"
import { whitespace } from "hast-util-whitespace"
import MarkdownParser from "../../src/MarkdownParser"
import { FallbackElement } from "./DefaultRenderer"
import EnvironmentTool from "../../src/EnvironmentTool"
import ShikiCodeBlockRender from "./ShikiCodeBlockRender"
import HeadingElement from "./HeadingRender"
import ClientScriptRender from "./ClientScriptRender"

/**
 * 自前で描画するタグ <HtmlElementRender />
 * 自前で描画する場合、タグの中で使うタグも自前で描画する必要があります（table なら thead とか）
 */
const ReBuildHtmlElementTagNames = ["br", "p", "span", "a", "img", "strong", "ul", "li", "em", "del", "table", "thead", "tbody", "tr", "td", "th", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "code", "script", "noscript"] as const

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
    // raw は Markdown に html 直接書いたとき
    switch (element.type) {
        case "comment": return <></>
        case "doctype": return <></>

        // HTML なので、AST に変換して、配列の各要素を再帰的に呼び出す
        case "raw":
            return MarkdownParser.parseHtmlAstFromHtmlString(element.value).map((child, index) => <HtmlElementRender key={index} element={child} />)

        // HTML 的に空白とかはむしろエラーになるので、空の文字列は return
        // 例: In HTML, whitespace text nodes cannot be a child of <table>.
        case "text":
            return whitespace(element.value) ? <></> : <>{element.value}</>

        // 続行
        case "element": break
    }

    // unifid に投げるか
    // 自前で描画したはずなのに、unified にフォールバックしている場合
    // 不具合を見つけやすくするため、console.log しておく
    let isFallback = false

    // そもそも親が描画できない
    if (ReBuildHtmlElementTagNames.includes(element.tagName as any) === false) {
        console.log(`親のタグが描画できないため unified へフォールバックします。${element.tagName}`)
        isFallback = true
    }

    // 子の中に自分で描画できない要素がある
    if (element.children.filter((node) => node.type === "element").some((element) => ReBuildHtmlElementTagNames.includes(element.tagName as any) === false)) {
        const childTagNameList = element.children.filter((node) => node.type === "element").map((element) => element.tagName)
        console.log(`子に描画できないタグがあるため unified へフォールバックします。${childTagNameList}`)
        isFallback = true
    }

    // 子に raw（Markdown に HTML）を持つ
    // <p> の中で <div> を使うことが出来ないため
    if (element.children.some((node) => node.type === "raw")) {
        console.log(`直接書いた HTML を子に持つため unified へフォールバックします`)
        isFallback = true
    }

    // フォールバックする場合
    if (isFallback) {
        // 自前で描画無理なので unified で HTML を作る
        return <FallbackElement content={element} />
    }

    // 自分で描画する場合、子を children: ReactNode に入れる必要があるので、再帰で作っておく
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

        case "span":
            return <span>{childrenHtml}</span>

        // em
        // 斜め
        case "em":
            return <em>{childrenHtml}</em>

        // del
        // 打ち消し線
        case "del":
            return <del>{childrenHtml}</del>

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

        // script
        // noscript もついでに
        case "script":
            const src = element.properties['src']?.toString()
            const type = element.properties['type']?.toString()
            return <ClientScriptRender src={src} type={type}>{childrenHtml}</ClientScriptRender>
        case "noscript":
            return <noscript>{childrenHtml}</noscript>
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